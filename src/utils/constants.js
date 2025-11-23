// utils/constants.js

// Admin Configuration
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// WhatsApp Configuration
export const WHATSAPP_NUMBER = '919876543210';

// Order Status Options
export const ORDER_STATUSES = {
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Traditional',
  'Contemporary',
  'Designer',
  'Bridal',
  'Antique'
];

// App Configuration
export const APP_CONFIG = {
  name: 'Thapasya Bangles',
  tagline: 'Handcrafted with Love',
  description: 'Handcrafted bangles with traditional artistry and modern designs',
  contact: {
    phone: '+91 98765 43210',
    email: 'info@thapasyabangles.com',
    address: 'Mumbai, Maharashtra'
  }
};

// Business Hours
export const BUSINESS_HOURS = {
  open: '9:00 AM',
  close: '8:00 PM',
  timezone: 'IST'
};

// Pagination
export const PAGINATION_CONFIG = {
  productsPerPage: 12,
  ordersPerPage: 10
};

// Image Configuration
export const IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  placeholder: 'https://via.placeholder.com/400x400?text=No+Image'
};

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  base: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  products: '/products',
  orders: '/orders',
  auth: '/auth',
  upload: '/upload'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  products: 'thapasya_products',
  orders: 'thapasya_orders',
  adminToken: 'thapasya_admin_token',
  userPreferences: 'thapasya_user_prefs'
};

// Form Validation Rules
export const VALIDATION_RULES = {
  product: {
    name: {
      minLength: 3,
      maxLength: 100,
      required: true
    },
    price: {
      min: 1,
      max: 100000,
      required: true
    },
    description: {
      minLength: 10,
      maxLength: 500,
      required: true
    },
    rating: {
      min: 1,
      max: 5,
      step: 0.1
    }
  },
  order: {
    customerName: {
      minLength: 2,
      maxLength: 50,
      required: true
    },
    phone: {
      pattern: /^[+]?[1-9][\d]{9,14}$/,
      required: true
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      required: false
    }
  }
};

// Color Schemes
export const COLORS = {
  primary: 'pink',
  secondary: 'purple',
  accent: 'indigo',
  success: 'green',
  warning: 'yellow',
  error: 'red',
  info: 'blue'
};

// Social Media Links
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/thapasyabangles',
  instagram: 'https://instagram.com/thapasyabangles',
  twitter: 'https://twitter.com/thapasyabangles',
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`
};

// SEO Configuration
export const SEO_CONFIG = {
  title: 'Thapasya Bangles - Handcrafted Traditional Jewelry',
  description: 'Discover beautiful handcrafted bangles with traditional artistry and modern designs. Perfect for weddings, festivals, and special occasions.',
  keywords: 'bangles, traditional jewelry, handcrafted, indian jewelry, wedding bangles, gold bangles, silver bangles',
  author: 'Thapasya Bangles',
  image: '/logo192.png'
};

export default {
  ADMIN_CREDENTIALS,
  WHATSAPP_NUMBER,
  ORDER_STATUSES,
  PRODUCT_CATEGORIES,
  APP_CONFIG,
  BUSINESS_HOURS,
  PAGINATION_CONFIG,
  IMAGE_CONFIG,
  API_ENDPOINTS,
  STORAGE_KEYS,
  VALIDATION_RULES,
  COLORS,
  SOCIAL_LINKS,
  SEO_CONFIG
};