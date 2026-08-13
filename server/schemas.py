from typing import List, Optional
from pydantic import BaseModel


class AddressPayload(BaseModel):
    doorNumber: str
    apartment: Optional[str] = ""
    street: str
    landmark: Optional[str] = ""
    village: str
    district: str
    state: str
    pincode: str


class OrderItemPayload(BaseModel):
    productId: str
    name: str
    category: Optional[str] = ""
    image: Optional[str] = ""
    selectedSize: Optional[str] = None
    price: float
    quantity: int


class OrderDataPayload(BaseModel):
    customerId: str
    customerName: str
    customerPhone: str
    customerEmail: Optional[str] = ""
    address: AddressPayload
    items: List[OrderItemPayload]


class CreateOrderRequest(BaseModel):
    order_data: OrderDataPayload


class CreateOrderResponse(BaseModel):
    order_id: str
    key_id: str
    amount: int
    currency: str = "INR"


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class VerifyPaymentResponse(BaseModel):
    success: bool
    orderId: Optional[str] = None
    message: Optional[str] = None
