// utils/paymentHelpers.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const parseErrorDetail = async (response) => {
  try {
    const data = await response.json();
    return data.detail || 'Something went wrong. Please try again.';
  } catch {
    return 'Something went wrong. Please try again.';
  }
};

/**
 * Ask the backend to create a Razorpay order. The backend recomputes pricing
 * from the real product data - orderData only needs customer/items/address.
 */
export const createRazorpayOrder = async (orderData, idToken) => {
  const response = await fetch(`${API_URL}/api/orders/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ order_data: orderData })
  });

  if (!response.ok) {
    throw new Error(await parseErrorDetail(response));
  }

  return response.json();
};

/**
 * Ask the backend to verify a completed payment's signature before trusting it.
 */
export const verifyRazorpayPayment = async (verificationData) => {
  const response = await fetch(`${API_URL}/api/orders/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verificationData)
  });

  if (!response.ok) {
    throw new Error(await parseErrorDetail(response));
  }

  return response.json();
};

/**
 * Open Razorpay's hosted checkout modal. Requires the checkout.js script
 * (loaded in public/index.html) to already be present on window.
 */
export const openRazorpayCheckout = ({ orderId, amount, keyId, name, email, contact, onSuccess, onFailure }) => {
  if (!window.Razorpay) {
    onFailure(new Error('Payment gateway failed to load. Please refresh and try again.'));
    return;
  }

  const razorpay = new window.Razorpay({
    key: keyId,
    amount,
    currency: 'INR',
    name: 'Thapasya Bangles',
    description: 'Order Payment',
    order_id: orderId,
    prefill: { name, email, contact },
    theme: { color: '#eab308' },
    handler: (response) => onSuccess(response),
    modal: {
      ondismiss: () => onFailure(new Error('Payment was cancelled'))
    }
  });

  razorpay.on('payment.failed', (response) => {
    onFailure(new Error(response.error?.description || 'Payment failed. Please try again.'));
  });

  razorpay.open();
};
