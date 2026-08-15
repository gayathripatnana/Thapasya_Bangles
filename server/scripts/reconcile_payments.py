"""
Reconciliation safety net: cross-checks Razorpay's recently captured payments
against Firestore to find any payment that was actually charged but never ended
up as a finalized `orders` document - the scenario where *both* the frontend's
/orders/verify call and the payment.captured webhook failed to fire/process
(e.g. the customer's browser crashed right after paying, and the webhook secret
wasn't configured yet, or Razorpay's webhook delivery itself failed).

Run manually whenever you want a health check:

    cd server
    python scripts/reconcile_payments.py                  # look back 24h, ask before fixing
    python scripts/reconcile_payments.py --hours 72        # look back further
    python scripts/reconcile_payments.py --auto-fix        # finalize orphans without asking
                                                            # (only use this for an unattended
                                                            # cron job you already trust)

Uses the same ServiceAccount.json / FIREBASE_SERVICE_ACCOUNT_JSON and Razorpay
keys as the rest of this backend - never run against production without knowing
that's what you're pointed at.
"""
import argparse
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from routers.orders import finalize_order  # noqa: E402
from services.firebase_client import db  # noqa: E402
from services.razorpay_client import client  # noqa: E402


def reconcile(hours, auto_fix):
    since = int(time.time()) - hours * 3600
    payments = client.payment.all({"from": since, "count": 100})["items"]
    captured = [p for p in payments if p.get("status") == "captured"]

    print(f"Checking {len(captured)} captured payment(s) from the last {hours}h...")

    orphaned = []
    for payment in captured:
        razorpay_order_id = payment.get("order_id")
        if not razorpay_order_id:
            continue

        pending_snap = db.collection("pending_payments").document(razorpay_order_id).get()

        if not pending_snap.exists:
            orphaned.append((payment, "no pending_payments record found at all"))
            continue

        status = pending_snap.to_dict().get("status")
        if status != "fulfilled":
            orphaned.append((payment, f"pending_payments status is '{status}', not fulfilled"))

    if not orphaned:
        print("All captured payments have a matching finalized order. Nothing to do.")
        return

    print(f"\n{len(orphaned)} orphaned payment(s) found - customer was charged but no order exists:\n")

    for payment, reason in orphaned:
        amount_rupees = payment.get("amount", 0) / 100
        print(f"  Payment {payment['id']} (order {payment.get('order_id')}, Rs.{amount_rupees:,.2f}) - {reason}")

        should_fix = auto_fix
        if not auto_fix:
            should_fix = input("  Finalize this order now? [y/N] ").strip().lower() == "y"

        if should_fix:
            order_id = finalize_order(payment.get("order_id"), payment["id"])
            print(f"  -> Created order {order_id}" if order_id else "  -> Still couldn't finalize (no pending_payments record)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--hours", type=int, default=24, help="How far back to check (default: 24h)")
    parser.add_argument(
        "--auto-fix",
        action="store_true",
        help="Finalize orphaned payments automatically, without prompting (use only for trusted unattended/cron runs)"
    )
    args = parser.parse_args()
    reconcile(args.hours, args.auto_fix)
