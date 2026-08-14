"""
One-time migration: add the `productIds` array (flattened from `items`) to every
existing order document that predates this field being written at order-creation
time (see routers/orders.py's create_order).

This is needed for the customer-reviews Firestore rule, which checks
`productId in order.productIds` to verify a review's product was actually
purchased - orders placed before this script don't have that field yet, so any
review attempt referencing one of them will always fail with "Missing or
insufficient permissions", even for a genuinely Delivered order.

Run this locally (uses the same ServiceAccount.json / FIREBASE_SERVICE_ACCOUNT_JSON
as the rest of this backend - never run against production without knowing that):

    cd server
    python scripts/backfill_order_product_ids.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_client import db  # noqa: E402


def backfill():
    orders_ref = db.collection("orders")
    updated = 0
    skipped = 0

    for order_snap in orders_ref.stream():
        data = order_snap.to_dict()
        if "productIds" in data:
            skipped += 1
            continue

        product_ids = [item.get("productId") for item in data.get("items", []) if item.get("productId")]
        order_snap.reference.update({"productIds": product_ids})
        updated += 1
        print(f"Updated order {order_snap.id}: productIds={product_ids}")

    print(f"\nDone. Updated {updated} order(s), skipped {skipped} (already had productIds).")


if __name__ == "__main__":
    backfill()
