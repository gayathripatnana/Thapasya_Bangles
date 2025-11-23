// utils/whatsapp.js - Fixed version with proper exports
export const WHATSAPP_NUMBER = '916304541430';

/**
 * Creates a formatted WhatsApp message for product orders
 * @param {Object} product - Product object
 * @returns {string} Formatted message
 */
export const createWhatsAppMessage = (product) => {
  const message = `Hi! I'm interested in ordering:

*${product.name}*
💰 Price: ₹${product.price.toLocaleString()}
📂 Category: ${product.category}
⭐ Rating: ${product.rating}/5

📋 Description:
${product.description}

Please let me know about:
• Availability
• Delivery details
• Payment options

Thank you! 🙏`;

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
 * Opens WhatsApp with product order message
 * @param {Object} product - Product object
 */
export const orderViaWhatsApp = (product) => {
  const message = createWhatsAppMessage(product);
  const whatsappUrl = createWhatsAppURL(WHATSAPP_NUMBER, message);
  window.open(whatsappUrl, '_blank');
};

/**
 * Creates a WhatsApp message for order status updates
 * @param {Object} order - Order object
 * @returns {string} Formatted message
 */
export const createOrderUpdateMessage = (order) => {
  const orderNumber = order.id.toString().padStart(4, '0');
  
  const message = `Hello ${order.customerName}! 👋

This is regarding your order #${orderNumber}

📦 Product: ${order.productName}
💰 Amount: ₹${order.amount.toLocaleString()}
📅 Order Date: ${new Date(order.orderDate).toLocaleDateString()}

🚀 Current Status: *${order.status}*

${getStatusMessage(order.status)}

If you have any questions, feel free to ask!

Thank you for choosing Thapasya Bangles! 🙏`;

  return message;
};

/**
 * Gets status-specific message content
 * @param {string} status - Order status
 * @returns {string} Status message
 */
const getStatusMessage = (status) => {
  switch (status) {
    case 'Processing':
      return `⏳ Your order is being processed and will be ready for shipping soon.
      
Expected processing time: 1-2 business days`;
      
    case 'Shipped':
      return `🚚 Great news! Your order has been shipped and is on its way.
      
You should receive it within 3-5 business days. We'll notify you once it's delivered.`;
      
    case 'Delivered':
      return `✅ Your order has been successfully delivered!
      
We hope you love your new bangles. Please share your feedback and photos with us!`;
      
    default:
      return 'We\'ll keep you updated on any changes to your order status.';
  }
};

/**
 * Sends order update via WhatsApp
 * @param {Object} order - Order object
 */
export const sendOrderUpdate = (order) => {
  const message = createOrderUpdateMessage(order);
  const cleanedPhone = order.customerPhone.replace(/[^0-9]/g, '');
  const whatsappUrl = createWhatsAppURL(cleanedPhone, message);
  window.open(whatsappUrl, '_blank');
};

/**
 * Creates a WhatsApp message for customer inquiry
 * @param {Object} inquiry - Inquiry details
 * @returns {string} Formatted message
 */
export const createInquiryMessage = (inquiry) => {
  const message = `Hello! I have an inquiry:

👤 Name: ${inquiry.name}
📧 Email: ${inquiry.email}
📱 Phone: ${inquiry.phone}

💬 Message:
${inquiry.message}

Please get back to me at your earliest convenience.

Thank you!`;

  return message;
};

/**
 * Creates WhatsApp share message for products
 * @param {Object} product - Product object
 * @returns {string} Share message
 */
export const createShareMessage = (product) => {
  const message = `Check out this beautiful bangle from Thapasya Bangles! ✨

*${product.name}*
💰 Only ₹${product.price.toLocaleString()}
⭐ ${product.rating}/5 rating

${product.description}

Contact them to order:
${createWhatsAppURL(WHATSAPP_NUMBER, createWhatsAppMessage(product))}

#ThapassyaBangles #HandcraftedJewelry #TraditionalBangles`;

  return message;
};

/**
 * Validates phone number format for WhatsApp
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} Is valid
 */
export const isValidWhatsAppNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/[^0-9]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Formats phone number for WhatsApp
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} Formatted number
 */
export const formatWhatsAppNumber = (phoneNumber) => {
  let cleaned = phoneNumber.replace(/[^0-9]/g, '');
  
  // Add country code if not present
  if (cleaned.length === 10 && !cleaned.startsWith('91')) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
};

/**
 * Creates bulk message for multiple customers
 * @param {Array} customers - Array of customer objects
 * @param {string} message - Message to send
 * @returns {Array} Array of WhatsApp URLs
 */
export const createBulkWhatsAppMessages = (customers, message) => {
  return customers.map(customer => {
    const personalizedMessage = message.replace('{{name}}', customer.name);
    return {
      customer: customer,
      url: createWhatsAppURL(customer.phone, personalizedMessage)
    };
  });
};