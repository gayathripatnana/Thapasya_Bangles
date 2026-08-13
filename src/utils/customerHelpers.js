// utils/customerHelpers.js
import { db, COLLECTIONS } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

/**
 * Real-time listener for all customers (users collection, doc id = Firebase uid)
 */
export const subscribeToCustomersUpdates = (callback, onError) => {
  const usersRef = collection(db, COLLECTIONS.USERS);

  return onSnapshot(
    usersRef,
    (snapshot) => {
      const customers = [];
      snapshot.forEach((docSnap) => {
        customers.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(customers);
    },
    (error) => {
      console.error('Error subscribing to customers (check Firestore rules allow admin reads):', error);
      if (onError) onError(error);
    }
  );
};
