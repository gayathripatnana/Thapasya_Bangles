import json
import os
import firebase_admin
from firebase_admin import credentials, firestore, auth

from config import FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH

if not firebase_admin._apps:
    if os.path.exists(FIREBASE_SERVICE_ACCOUNT_PATH):
        cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
    elif FIREBASE_SERVICE_ACCOUNT_JSON:
        cred = credentials.Certificate(json.loads(FIREBASE_SERVICE_ACCOUNT_JSON))
    else:
        raise RuntimeError(
            f"No Firebase service account found. Place your downloaded key at "
            f"{FIREBASE_SERVICE_ACCOUNT_PATH}, or set the FIREBASE_SERVICE_ACCOUNT_JSON "
            "env var instead (used on platforms like Railway where the file can't be committed)."
        )
    firebase_admin.initialize_app(cred)

db = firestore.client()
fb_auth = auth
SERVER_TIMESTAMP = firestore.SERVER_TIMESTAMP
transactional = firestore.transactional
