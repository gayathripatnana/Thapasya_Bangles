// utils/whatsappCheckout.js - Enhanced WhatsApp checkout functionality
export const WHATSAPP_NUMBER = '918074086883';

/**
 * Creates a comprehensive WhatsApp message for cart checkout
 * @param {Array} cartItems - Array of cart items
 * @param {Object} orderSummary - Order summary with totals
 * @param {Object} customerInfo - Customer information (optional)
 * @returns {string} Formatted checkout message
 */
export const createCartCheckoutMessage = (cartItems, orderSummary, customerInfo = null) => {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let message = `🛒 *Hi! I want to place an ORDER* 🛒
📅 Date: ${currentDate}
${customerInfo ? `\n👤 My Name: ${customerInfo.name || 'Not provided'}\n📱 My Phone: ${customerInfo.phone || 'Not provided'}\n📧 My Email: ${customerInfo.email || 'Not provided'}\n📍 My Address: ${customerInfo.address || 'Not provided'}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *PRODUCTS I WANT TO ORDER* (${itemCount} item${itemCount !== 1 ? 's' : ''})

`;

  // Add each cart item with details
  cartItems.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*
   📂 Category: ${item.category}
   ${item.selectedSize ? `📏 Size: ${item.selectedSize}` : ''}
   💰 Price: ₹${item.price.toLocaleString()}
   📊 Quantity: ${item.quantity}
   💵 Subtotal: ₹${(item.price * item.quantity).toLocaleString()}
   ⭐ Rating: ${item.rating}/5
   🔗 Product Image: ${item.image || 'Image not available'}

`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 *ORDER SUMMARY*
💳 Subtotal: ₹${orderSummary.subtotal.toLocaleString()}`;

  if (orderSummary.discount > 0) {
    message += `
🎟️ Discount Applied: -₹${orderSummary.discount.toLocaleString()}`;
  }

  message += `
🚚 Delivery: ${orderSummary.deliveryCharges === 0 ? 'FREE' : '₹' + orderSummary.deliveryCharges.toLocaleString()}
💵 *TOTAL AMOUNT: ₹${orderSummary.total.toLocaleString()}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *PLEASE LET ME KNOW:*
✅ Availability of these products
✅ Delivery timeline
✅ Payment options (UPI/COD/Bank Transfer)
✅ Any additional charges

🙏 Please confirm my order and share the next steps.

Thank you!`;

  return message;
};

/**
 * Creates a WhatsApp URL with pre-filled message
 * @param {string} phoneNumber - WhatsApp number
 * @param {string} message - Pre-filled message
 * @returns {string} WhatsApp URL
 */
export const createWhatsAppURL = (phoneNumber, message) => {
  const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
};

/**
 * Handles cart checkout via WhatsApp
 * @param {Array} cartItems - Cart items
 * @param {Object} orderSummary - Order totals
 * @param {Object} customerInfo - Customer details (optional)
 */
export const proceedToWhatsAppCheckout = (cartItems, orderSummary, customerInfo = null) => {
  if (!cartItems || cartItems.length === 0) {
    alert('Your cart is empty. Please add items before checkout.');
    return;
  }

  const message = createCartCheckoutMessage(cartItems, orderSummary, customerInfo);
  const whatsappUrl = createWhatsAppURL(WHATSAPP_NUMBER, message);
  
  // Open WhatsApp in new tab
  window.open(whatsappUrl, '_blank');
  
  // Optional: Track checkout event
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', 'checkout', {
      'event_category': 'ecommerce',
      'value': orderSummary.total,
      'currency': 'INR',
      'items': cartItems.length
    });
  }
};

/**
 * Creates a single product WhatsApp order message
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity to order
 * @returns {string} Formatted message
 */
export const createProductOrderMessage = (product, quantity = 1) => {
  const total = product.price * quantity;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const message = `🛍️ *Hi! I'm interested in this PRODUCT* 🛍️
📅 Date: ${currentDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *PRODUCT I WANT*

*${product.name}*
📂 Category: ${product.category}
💰 Price: ₹${product.price.toLocaleString()}
📊 Quantity I want: ${quantity}
💵 Total Amount: ₹${total.toLocaleString()}
⭐ Rating: ${product.rating}/5 stars

🔗 Product Image: ${product.image}

📋 Description:
${product.description || 'Beautiful handcrafted bangle with traditional elegance.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 *Please tell me about:*
✅ Is this product available?
✅ Delivery timeline to my location
✅ Payment options available
✅ Any bulk discounts for this quantity

📍 I will share my delivery address once you confirm availability.

Looking forward to your response! 🙏`;

  return message;
};

/**
 * Orders a single product via WhatsApp
 * @param {Object} product - Product to order
 * @param {number} quantity - Quantity
 */
export const orderProductViaWhatsApp = (product, quantity = 1) => {
  const message = createProductOrderMessage(product, quantity);
  const whatsappUrl = createWhatsAppURL(WHATSAPP_NUMBER, message);
  window.open(whatsappUrl, '_blank');
};

/**
 * Creates wishlist share message
 * @param {Array} wishlistItems - Wishlist items
 * @returns {string} Formatted message
 */
export const createWishlistInquiryMessage = (wishlistItems) => {
  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0);
  const currentDate = new Date().toLocaleDateString('en-IN');

  let message = `💕 *Hi! I'm interested in these products from my WISHLIST* 💕
📅 Date: ${currentDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 *PRODUCTS I'M INTERESTED IN* (${wishlistItems.length} items)

`;

  wishlistItems.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*
   💰 Price: ₹${item.price.toLocaleString()}
   📂 Category: ${item.category}
   ⭐ Rating: ${item.rating}/5
   🔗 Image: ${item.image}

`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Total Wishlist Value: ₹${totalValue.toLocaleString()}

💬 *Please let me know:*
✅ Which of these items are available?
✅ Best price if I order multiple items
✅ Delivery options to my location
✅ Payment methods you accept

I'm ready to place an order for the available items.

Thank you! 🙏`;

  return message;
};

/**
 * Sends wishlist inquiry via WhatsApp
 * @param {Array} wishlistItems - Wishlist items
 */
export const inquireWishlistViaWhatsApp = (wishlistItems) => {
  if (!wishlistItems || wishlistItems.length === 0) {
    alert('Your wishlist is empty.');
    return;
  }

  const message = createWishlistInquiryMessage(wishlistItems);
  const whatsappUrl = createWhatsAppURL(WHATSAPP_NUMBER, message);
  window.open(whatsappUrl, '_blank');
};

/**
 * Creates general inquiry message
 * @param {string} inquiryType - Type of inquiry
 * @param {string} customMessage - Custom message
 * @returns {string} Formatted message
 */
export const createGeneralInquiryMessage = (inquiryType = 'General', customMessage = '') => {
  const currentDate = new Date().toLocaleDateString('en-IN');

  const message = `📞 *Hi! I have a ${inquiryType.toUpperCase()} INQUIRY* 📞
📅 Date: ${currentDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 My Message:
${customMessage || 'Hi! I have a question about your bangles collection.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 *I'm interested in learning about:*
✅ Your product catalog
✅ Customization options available
✅ Bulk order discounts
✅ Delivery information for my area
✅ Pricing details

Please get back to me when convenient.

Thank you! 🙏`;

  return message;
};

/**
 * Sends general inquiry via WhatsApp
 * @param {string} inquiryType - Type of inquiry
 * @param {string} customMessage - Custom message
 */
export const sendGeneralInquiry = (inquiryType, customMessage) => {
  const message = createGeneralInquiryMessage(inquiryType, customMessage);
  const whatsappUrl = createWhatsAppURL(WHATSAPP_NUMBER, message);
  window.open(whatsappUrl, '_blank');
};

// Updated CartPage.jsx with WhatsApp checkout integration
export const CartPageWithWhatsAppCheckout = `
// Add this import to your CartPage.jsx
import { proceedToWhatsAppCheckout } from '../utils/whatsappCheckout';

// Replace the checkout button onClick handler with:
const handleCheckout = () => {
  const orderSummary = {
    subtotal,
    discount,
    deliveryCharges,
    total
  };

  // Optional: Collect customer info (you can create a form for this)
  const customerInfo = {
    name: '', // Get from form or user profile
    phone: '', // Get from form or user profile  
    email: '' // Get from form or user profile
  };

  proceedToWhatsAppCheckout(cartItems, orderSummary, customerInfo);
};

// Update the checkout button:
<button
  onClick={handleCheckout}
  className="w-full bg-gradient-to-r from-yellow-500 to-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:from-yellow-600 hover:to-gray-700 transition-all transform hover:-translate-y-1 hover:shadow-lg"
>
  Send Order to WhatsApp
</button>
`;

// Product page quick order integration
export const ProductPageQuickOrder = `
// Add this import to your ProductPage.jsx or ProductCard.jsx
import { orderProductViaWhatsApp } from '../utils/whatsappCheckout';

// Add quick order button:
<button
  onClick={() => orderProductViaWhatsApp(product, 1)}
  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
>
  <Phone className="w-4 h-4" />
  <span>Inquire on WhatsApp</span>
</button>
`;

const whatsappCheckout = {
  proceedToWhatsAppCheckout,
  orderProductViaWhatsApp,
  inquireWishlistViaWhatsApp,
  sendGeneralInquiry,
  createCartCheckoutMessage,
  createProductOrderMessage,
  createWishlistInquiryMessage,
  createGeneralInquiryMessage
};

export default whatsappCheckout;