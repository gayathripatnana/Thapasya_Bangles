import razorpay.errors
from fastapi import APIRouter, HTTPException, Request

from config import RAZORPAY_WEBHOOK_SECRET
from routers.orders import finalize_order
from services.razorpay_client import client

router = APIRouter()


@router.post("/razorpay")
async def razorpay_webhook(request: Request):
    """Fallback safety net - fires even if the customer closes the tab right
    after paying, before the frontend can call /orders/verify.
    """
    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    try:
        client.utility.verify_webhook_signature(body.decode("utf-8"), signature, RAZORPAY_WEBHOOK_SECRET)
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = await request.json()

    if payload.get("event") != "payment.captured":
        return {"status": "ignored"}

    payment_entity = payload["payload"]["payment"]["entity"]
    order_id = finalize_order(payment_entity["order_id"], payment_entity["id"])

    if order_id is None:
        return {"status": "no_matching_order"}

    return {"status": "ok", "orderId": order_id}
