// utils/orderHelpers.js
import { db, COLLECTIONS } from '../firebase/config';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

export const ORDER_STATUSES = {
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
};

/**
 * Create a single order document for an entire checkout (all cart items together)
 */
export const createOrder = async (orderData) => {
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      status: ORDER_STATUSES.PROCESSING,
      orderDate: new Date().toISOString(),
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Real-time listener for all orders, newest first
 */
export const subscribeToOrdersUpdates = (callback, onError) => {
  const ordersQuery = query(collection(db, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc'));

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const orders = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(orders);
    },
    (error) => {
      console.error('Error subscribing to orders (check Firestore rules allow admin reads):', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Update an order's status
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(orderRef, { status });
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Short, friendly display reference for an order (not used for lookups)
 */
export const getOrderDisplayNumber = (orderId) => {
  if (!orderId) return '------';
  return orderId.slice(-6).toUpperCase();
};
