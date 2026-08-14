"""
One-time script: grant the admin custom claim to a Firebase Auth user by email.

This replaces the old "isAdmin = email === 'thapasyabangles@gmail.com'" check with a
proper server-set claim, so the admin's email no longer needs to appear anywhere in
the frontend code or Firestore rules.

Run this locally (never expose it as a live API endpoint - it grants real admin power):

    cd server
    python scripts/set_admin_claim.py your-admin-email@example.com

Requires server/ServiceAccount.json (or FIREBASE_SERVICE_ACCOUNT_JSON) to already be
set up, same as the rest of this backend.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_client import fb_auth  # noqa: E402


def set_admin_claim(email):
    user = fb_auth.get_user_by_email(email)
    fb_auth.set_custom_user_claims(user.uid, {"admin": True})
    print(f"Granted admin claim to {email} (uid: {user.uid})")
    print("They must sign out and sign back in (or wait for their session to refresh) to see the change take effect.")


def revoke_admin_claim(email):
    user = fb_auth.get_user_by_email(email)
    fb_auth.set_custom_user_claims(user.uid, {"admin": False})
    print(f"Revoked admin claim from {email} (uid: {user.uid})")


if __name__ == "__main__":
    args = sys.argv[1:]

    if len(args) == 2 and args[0] == "--revoke":
        revoke_admin_claim(args[1])
    elif len(args) == 1:
        set_admin_claim(args[0])
    else:
        print("Usage: python scripts/set_admin_claim.py <email>")
        print("       python scripts/set_admin_claim.py --revoke <email>")
        sys.exit(1)
