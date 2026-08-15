import razorpay.errors
from fastapi import APIRouter, HTTPException, Request

from config import RAZORPAY_WEBHOOK_SECRET
from routers.orders import finalize_order, mark_payment_failed
from services.razorpay_client import client

router = APIRouter()


@router.post("/razorpay")
async def razorpay_webhook(request: Request):
    """Fallback safety net - fires even if the customer closes the tab right
    after paying (or after a failed attempt), before the frontend can react.

    Configure only `payment.captured` and `payment.failed` as Active Events in the
    Razorpay dashboard - every other event type is ignored below since there's no
    code here to act on it, so enabling more just adds noise/unnecessary traffic.
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
    event = payload.get("event")

    if event == "payment.captured":
        payment_entity = payload["payload"]["payment"]["entity"]
        order_id = finalize_order(payment_entity["order_id"], payment_entity["id"])

        if order_id is None:
            return {"status": "no_matching_order"}

        return {"status": "ok", "orderId": order_id}

    if event == "payment.failed":
        payment_entity = payload["payload"]["payment"]["entity"]
        mark_payment_failed(payment_entity["order_id"], payment_entity)
        return {"status": "failure_recorded"}

    return {"status": "ignored"}
