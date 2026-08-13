import os
from pathlib import Path
from dotenv import load_dotenv

# Explicit path so this never accidentally walks up and loads the React app's
# root .env instead of (or in addition to) this backend's own.
load_dotenv(Path(__file__).resolve().parent / ".env")

RAZORPAY_KEY_ID = os.environ["RAZORPAY_KEY_ID"]
RAZORPAY_KEY_SECRET = os.environ["RAZORPAY_KEY_SECRET"]
RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Preferred: a downloaded service account key file, gitignored (see server/README.md).
# Falls back to FIREBASE_SERVICE_ACCOUNT_JSON env var for platforms like Railway where
# committing the file isn't an option.
FIREBASE_SERVICE_ACCOUNT_PATH = os.environ.get(
    "FIREBASE_SERVICE_ACCOUNT_PATH",
    str(Path(__file__).resolve().parent / "ServiceAccount.json")
)
FIREBASE_SERVICE_ACCOUNT_JSON = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON", "")

# Must match src/utils/shippingHelpers.js's DEFAULT_PRODUCT_WEIGHT_KG / DEFAULT_SHIPPING_SETTINGS
DEFAULT_PRODUCT_WEIGHT_KG = 0.5
DEFAULT_SHIPPING_RATE_PER_KG = 100
