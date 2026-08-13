from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import FRONTEND_URLS
from routers import orders, webhooks

app = FastAPI(title="Thapasya Bangles Payment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_methods=["POST"],
    allow_headers=["*"],
)

app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["webhooks"])


@app.get("/")
def health_check():
    return {"status": "ok"}
