import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Collection names - centralized configuration
export const COLLECTIONS = {
  INTRO_PICTURES: 'intro_pictures',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  CATEGORY_PICTURES: 'category_pictures',
  ORDERS: 'orders',
  FEATURED_PRODUCTS: 'featured_products',
  USERS: 'users',
};

// Document IDs - centralized configuration
export const DOCUMENTS = {
  CAROUSEL_PICTURES: 'carousel_pictures',
  IMAGES: 'images',
  PRODUCTS: 'products',
};

export default app;