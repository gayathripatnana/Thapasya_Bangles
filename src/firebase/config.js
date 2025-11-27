import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore'; // ← ADD doc, getDoc
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWg3NDKNeAvKfMX66UoNH0V5Xnyc5IdHs",
  authDomain: "thapasya-bangles.firebaseapp.com",
  projectId: "thapasya-bangles",
  storageBucket: "thapasya-bangles.firebasestorage.app",
  messagingSenderId: "560825753786",
  appId: "1:560825753786:web:7b96adfb567bd1aeb76283",
  measurementId: "G-C9HL618GPW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Export Firestore functions ← ADD THIS SECTION
export { doc, getDoc, collection, getDocs }; // ← ADD THIS LINE

// Collection names - centralized configuration
export const COLLECTIONS = {
  INTRO_PICTURES: 'intro_pictures',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  CATEGORY_PICTURES: 'category_pictures',
  ORDERS: 'orders',
  FEATURED_PRODUCTS: 'featured_products',
  USERS: 'users',
  REVIEWS: 'reviews', // ← ADD THIS if you have reviews collection
};

// Document IDs - centralized configuration
export const DOCUMENTS = {
  CAROUSEL_PICTURES: 'carousel_pictures',
  IMAGES: 'images',
  PRODUCTS: 'products',
};

export default app;