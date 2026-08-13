# Thapasya Bangles Payment API

FastAPI backend that handles Razorpay order creation and payment verification for the storefront. Kept separate from the React app so it can run as an always-on service (Razorpay verification is not a good fit for cold-start serverless).

## How it works

1. **`POST /api/orders/create`** — customer must be signed in (sends a Firebase ID token). The server looks up the *real* price of every item from the `products` Firestore collection (never trusts prices sent by the client), computes the total, creates a Razorpay order for that amount, and stashes the verified order details in a `pending_payments/{razorpay_order_id}` document.
2. The frontend opens Razorpay's checkout with that order id.
3. **`POST /api/orders/verify`** — after payment, the frontend sends back Razorpay's `order_id` / `payment_id` / `signature`. The server verifies the signature (HMAC-SHA256 with your Key Secret), then promotes the matching `pending_payments` doc into a real `orders` document with `paymentStatus: "Paid"`.
4. **`POST /api/webhooks/razorpay`** — a safety net. If the customer closes the tab right after paying (before step 3 can run), Razorpay's `payment.captured` webhook event finalizes the same pending order. Both paths are idempotent — whichever fires first wins.

## Local setup

```bash
cd server
python -m venv venv
source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env       # then fill in real values
```

Then get your Firebase credentials file: Firebase Console → Project Settings → Service Accounts → Generate new private key. Save the downloaded file as **`server/ServiceAccount.json`** — it's already covered by the repo's `.gitignore`, and `config.py` finds it automatically, no env var needed for it locally.

```bash
uvicorn main:app --reload --port 8000
```

### Required env vars (`server/.env`)

- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Razorpay Dashboard → Settings → API Keys
- `RAZORPAY_WEBHOOK_SECRET` — Razorpay Dashboard → Settings → Webhooks (create one pointing at `https://<your-api>/api/webhooks/razorpay`, subscribed to the `payment.captured` event)
- `FRONTEND_URL` — your deployed site's origin, used for the CORS allowlist

## Deploying to Railway

Railway builds from this repo, so `server/ServiceAccount.json` won't be there (it's gitignored on purpose — never commit it). Use the env var fallback instead for this one deploy target:

1. Create a new Railway project from this GitHub repo.
2. In the service settings, set **Root Directory** to `server`.
3. Railway auto-detects Python from `requirements.txt` and uses the `Procfile`'s start command.
4. Add env vars in the Railway dashboard (never commit `.env`): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `FRONTEND_URL`, and `FIREBASE_SERVICE_ACCOUNT_JSON` (paste the entire contents of your `ServiceAccount.json` as one line — `config.py` falls back to this automatically when the file isn't present).
5. Once deployed, copy the public URL Railway gives you and set it as `REACT_APP_API_URL` in the frontend's environment (Vercel project settings).
6. Point the Razorpay webhook at `https://<railway-url>/api/webhooks/razorpay`.

## Firestore security rules

`pending_payments` should **never** be readable or writable by clients — only this backend (via the Admin SDK, which bypasses security rules entirely) should touch it:

```
match /pending_payments/{orderId} {
  allow read, write: if false;
}
```

`orders` should stay readable only by the owning customer (`resource.data.customerId == request.auth.uid`) or an admin, and should not be client-writable at all now that both checkout paths (WhatsApp via the app's existing client-side write, and Razorpay via this backend) are the only legitimate writers. If you want to lock it down further, restrict client writes to just the WhatsApp/COD path's shape and let the backend's Admin SDK (which ignores rules) handle the rest.
