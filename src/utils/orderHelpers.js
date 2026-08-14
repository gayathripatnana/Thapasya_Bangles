// utils/orderHelpers.js
// Orders are only ever created by the payment backend's Admin SDK, after verifying a real
// Razorpay signature (see server/routers/orders.py) - there is no client-side order creation
// here, and Firestore rules block clients from writing to `orders` directly.
import { db, COLLECTIONS } from '../firebase/config';
import {
  doc,
  collection,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where
} from 'firebase/firestore';

export const ORDER_STATUSES = {
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
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
 * Real-time listener for a single customer's own orders, newest first.
 * Used for non-admin sessions, where Firestore rules only allow reading own orders -
 * an unfiltered collection query (subscribeToOrdersUpdates) would be denied for them.
 *
 * Sorted client-side rather than via `orderBy('createdAt')` in the query itself -
 * combining that with the `where('customerId', ...)` filter requires a composite
 * index to be created in the Firebase console before the query works at all.
 */
export const subscribeToCustomerOrders = (customerId, callback, onError) => {
  const ordersQuery = query(
    collection(db, COLLECTIONS.ORDERS),
    where('customerId', '==', customerId)
  );

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const orders = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() });
      });
      orders.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      callback(orders);
    },
    (error) => {
      console.error('Error subscribing to customer orders:', error);
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
