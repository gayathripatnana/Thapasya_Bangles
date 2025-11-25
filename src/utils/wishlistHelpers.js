// utils/wishlistHelpers.js
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';

// Add item to wishlist
export const addToWishlist = async (userId, product) => {
  const wishlistRef = doc(db, 'wishlists', userId);
  const wishlistSnap = await getDoc(wishlistRef);
  
  if (wishlistSnap.exists()) {
    // Update existing wishlist - prevent duplicates
    await updateDoc(wishlistRef, {
      items: arrayUnion(product),
      updatedAt: new Date()
    });
  } else {
    // Create new wishlist
    await setDoc(wishlistRef, {
      userId: userId,
      items: [product],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (userId, productId) => {
  const wishlistRef = doc(db, 'wishlists', userId);
  const wishlistSnap = await getDoc(wishlistRef);
  
  if (wishlistSnap.exists()) {
    const wishlistData = wishlistSnap.data();
    const updatedItems = wishlistData.items.filter(item => item.id !== productId);
    
    await updateDoc(wishlistRef, { 
      items: updatedItems,
      updatedAt: new Date()
    });
  }
};

// Get user's wishlist
export const getWishlist = async (userId) => {
  const wishlistRef = doc(db, 'wishlists', userId);
  const wishlistSnap = await getDoc(wishlistRef);
  
  if (wishlistSnap.exists()) {
    return wishlistSnap.data().items || [];
  }
  return [];
};

// Clear entire wishlist
export const clearWishlist = async (userId) => {
  const wishlistRef = doc(db, 'wishlists', userId);
  await updateDoc(wishlistRef, {
    items: [],
    updatedAt: new Date()
  });
};