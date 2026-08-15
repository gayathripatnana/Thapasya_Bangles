from datetime import datetime, timezone

import razorpay.errors
from fastapi import APIRouter, Depends, HTTPException, Request

from config import (
    DEFAULT_PRODUCT_WEIGHT_KG,
    DEFAULT_SHIPPING_RATE_PER_KG,
    MIN_BILLABLE_WEIGHT_KG,
    RAZORPAY_KEY_ID,
)
from dependencies import get_current_uid
from rate_limiter import limiter
from schemas import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
)
from services.firebase_client import SERVER_TIMESTAMP, db
from services.razorpay_client import client

router = APIRouter()


def _get_shipping_rate_per_kg(state):
    """Mirrors src/utils/shippingHelpers.js's calculateShippingCost rate lookup."""
    settings_snap = db.collection("settings").document("shipping_rates").get()
    if not settings_snap.exists:
        return DEFAULT_SHIPPING_RATE_PER_KG

    settings = settings_snap.to_dict()
    rates = settings.get("rates", {})
    return rates.get(state) or settings.get("defaultRatePerKg") or DEFAULT_SHIPPING_RATE_PER_KG


def _compute_order_totals(order_data):
    """Recompute pricing from the real product prices/weights in Firestore.

    Never trust price/subtotal/total/deliveryCharges values sent by the client -
    a tampered request could otherwise pay a small amount and have it recorded
    as a full-price order.
    """
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # One batched read for every product instead of a sequential round-trip per
    # cart line - matters once a cart has more than a couple of items.
    product_refs = [db.collection("products").document(item.productId) for item in order_data.items]
    products_by_id = {snap.id: snap for snap in db.get_all(product_refs)}

    subtotal = 0.0
    total_weight = 0.0
    priced_items = []

    for item in order_data.items:
        product_snap = products_by_id.get(item.productId)
        if product_snap is None or not product_snap.exists:
            raise HTTPException(status_code=400, detail=f"Product {item.productId} no longer exists")

        product = product_snap.to_dict()
        real_price = float(product.get("price", 0))
        weight = float(product.get("weight") or DEFAULT_PRODUCT_WEIGHT_KG)

        subtotal += real_price * item.quantity
        total_weight += weight * item.quantity

        priced_items.append({
            **item.dict(),
            "price": real_price  # overwrite with the trusted price
        })

    rate_per_kg = _get_shipping_rate_per_kg(order_data.address.state)
    billable_weight = max(total_weight, MIN_BILLABLE_WEIGHT_KG)
    delivery_charges = round(billable_weight * rate_per_kg)
    total = subtotal + delivery_charges

    return priced_items, subtotal, delivery_charges, total


@router.post("/create", response_model=CreateOrderResponse)
@limiter.limit("10/minute")
def create_order(request: Request, payload: CreateOrderRequest, uid: str = Depends(get_current_uid)):
    order_data = payload.order_data

    if order_data.customerId != uid:
        raise HTTPException(status_code=403, detail="Customer ID does not match the authenticated user")

    priced_items, subtotal, delivery_charges, total = _compute_order_totals(order_data)
    amount_paise = round(total * 100)

    receipt = f"order_{uid}_{int(datetime.now(timezone.utc).timestamp())}"

    try:
        razorpay_order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1
        })
    except razorpay.errors.BadRequestError as error:
        raise HTTPException(status_code=400, detail=str(error))

    # Stash the server-verified order data, keyed by the Razorpay order id, so
    # /verify and the webhook never have to trust client-provided pricing again.
    db.collection("pending_payments").document(razorpay_order["id"]).set({
        "order_data": {
            "customerId": order_data.customerId,
            "customerName": order_data.customerName,
            "customerPhone": order_data.customerPhone,
            "customerEmail": order_data.customerEmail,
            "address": order_data.address.dict(),
            "items": priced_items,
            # Flattened for Firestore security rules - allows a cheap `in` check
            # for "did this order contain product X" without needing to inspect
            # the `items` array of maps (rules can't filter/map over those).
            "productIds": [item["productId"] for item in priced_items],
            "subtotal": subtotal,
            "deliveryCharges": delivery_charges,
            "total": total,
        },
        "status": "created",
        "createdAt": SERVER_TIMESTAMP,
    })

    return CreateOrderResponse(order_id=razorpay_order["id"], key_id=RAZORPAY_KEY_ID, amount=amount_paise)


def finalize_order(razorpay_order_id: str, razorpay_payment_id: str):
    """Create the real order document from the trusted pending-payment record.

    Idempotent - safe to call from both /verify and the webhook, whichever fires first wins.
    """
    pending_ref = db.collection("pending_payments").document(razorpay_order_id)
    pending_snap = pending_ref.get()

    if not pending_snap.exists:
        return None

    pending_data = pending_snap.to_dict()
    if pending_data.get("status") == "fulfilled":
        return pending_data.get("orderId")

    order_doc = {
        **pending_data["order_data"],
        "status": "Processing",
        "paymentStatus": "Paid",
        "paymentMethod": "Razorpay",
        "razorpayOrderId": razorpay_order_id,
        "razorpayPaymentId": razorpay_payment_id,
        "orderDate": datetime.now(timezone.utc).isoformat(),
        "createdAt": SERVER_TIMESTAMP,
    }

    _, order_ref = db.collection("orders").add(order_doc)
    pending_ref.update({"status": "fulfilled", "orderId": order_ref.id})

    return order_ref.id


def mark_payment_failed(razorpay_order_id: str, payment_entity: dict):
    """Record a failed payment attempt on its pending-payment record, for admin
    visibility - no `orders` document is ever created for a failed payment, this
    just keeps the "why did this checkout not go through" context from being lost.

    No-op if the pending record is missing, or already fulfilled (a failure
    notification arriving after a successful one - e.g. out-of-order webhook
    delivery - must never overwrite a real, paid order's record).
    """
    pending_ref = db.collection("pending_payments").document(razorpay_order_id)
    pending_snap = pending_ref.get()

    if not pending_snap.exists or pending_snap.to_dict().get("status") == "fulfilled":
        return

    pending_ref.update({
        "status": "failed",
        "razorpayPaymentId": payment_entity.get("id"),
        "failureReason": payment_entity.get("error_description") or payment_entity.get("error_reason") or "Unknown",
        "failedAt": SERVER_TIMESTAMP,
    })


@router.post("/verify", response_model=VerifyPaymentResponse)
@limiter.limit("20/minute")
def verify_payment(request: Request, payload: VerifyPaymentRequest):
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    order_id = finalize_order(payload.razorpay_order_id, payload.razorpay_payment_id)

    if order_id is None:
        raise HTTPException(status_code=404, detail="No matching pending order found")

    return VerifyPaymentResponse(success=True, orderId=order_id)
