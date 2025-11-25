import { doc, getDoc, setDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config'; // Make sure you have this firebase config file

export const addToCart = async (userId, product) => {
  const cartRef = doc(db, 'carts', userId);
  const cartSnap = await getDoc(cartRef);
  
  if (cartSnap.exists()) {
    // Update existing cart
    const cartData = cartSnap.data();
    const existingItem = cartData.items.find(item => item.id === product.id);
    
    if (existingItem) {
      // Increase quantity
      const updatedItems = cartData.items.map(item =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      await updateDoc(cartRef, { items: updatedItems });
    } else {
      // Add new item
      const newItem = { ...product, quantity: 1 };
      await updateDoc(cartRef, { 
        items: [...cartData.items, newItem],
        updatedAt: new Date()
      });
    }
  } else {
    // Create new cart
    await setDoc(cartRef, {
      userId: userId,
      items: [{ ...product, quantity: 1 }],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

export const removeFromCart = async (userId, productId) => {
  const cartRef = doc(db, 'carts', userId);
  const cartSnap = await getDoc(cartRef);
  
  if (cartSnap.exists()) {
    const cartData = cartSnap.data();
    const updatedItems = cartData.items.filter(item => item.id !== productId);
    await updateDoc(cartRef, { 
      items: updatedItems,
      updatedAt: new Date()
    });
  }
};

export const updateCartQuantity = async (userId, productId, quantity) => {
  const cartRef = doc(db, 'carts', userId);
  const cartSnap = await getDoc(cartRef);
  
  if (cartSnap.exists()) {
    const cartData = cartSnap.data();
    const updatedItems = cartData.items.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0);
    
    await updateDoc(cartRef, { 
      items: updatedItems,
      updatedAt: new Date()
    });
  }
};

export const getCart = async (userId) => {
  const cartRef = doc(db, 'carts', userId);
  const cartSnap = await getDoc(cartRef);
  
  if (cartSnap.exists()) {
    return cartSnap.data().items || [];
  }
  return [];
};