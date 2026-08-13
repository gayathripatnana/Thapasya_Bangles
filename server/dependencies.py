from fastapi import Header, HTTPException

from services.firebase_client import fb_auth


def get_current_uid(authorization: str = Header(...)) -> str:
    """Verify the Firebase ID token sent by the frontend and return the real, trusted uid.

    Never trust a customerId sent in a request body alone - it can be edited in devtools.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1]

    try:
        decoded = fb_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return decoded["uid"]
