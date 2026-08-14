// utils/reviewHelpers.js
// Customer-submitted, per-product reviews - gated to verified purchasers only.
// Firestore rules (see firestore.rules) enforce that a review can only be created
// for a Delivered order the requester actually owns and that actually contains the
// product, so the eligibility checks here are for UX only, not the security boundary.
import { db, COLLECTIONS } from '../firebase/config';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Real-time listener for a single product's reviews, newest first.
 * Sorted client-side rather than via `orderBy` in the query - combining that with
 * `where('productId', ...)` would require a composite index to be created first.
 */
export const subscribeToProductReviews = (productId, callback, onError) => {
  const reviewsQuery = query(
    collection(db, COLLECTIONS.REVIEWS),
    where('productId', '==', productId)
  );

  return onSnapshot(
    reviewsQuery,
    (snapshot) => {
      const reviews = [];
      snapshot.forEach((docSnap) => {
        reviews.push({ id: docSnap.id, ...docSnap.data() });
      });
      reviews.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      callback(reviews);
    },
    (error) => {
      console.error('Error subscribing to product reviews:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Given an orders list and a product id, find the most recent Delivered order
 * belonging to `customerId` that contained this product and hasn't been reviewed
 * yet. Returns null if the customer isn't eligible to review.
 *
 * Explicitly filters by `customerId` rather than assuming the `orders` list is
 * already scoped to one customer - an admin's `orders` state holds every order,
 * so without this check the "eligible" order found could belong to someone else
 * (harmless since Firestore rules would reject the submission anyway, but it'd
 * make the button appear/fail confusingly for an admin browsing the storefront).
 */
export const findReviewableOrder = (orders, productId, customerId, existingReviewIds) => {
  const deliveredOrders = (orders || [])
    .filter(order => order.customerId === customerId)
    .filter(order => order.status === 'Delivered')
    .filter(order => (order.items || []).some(item => item.productId === productId))
    .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));

  return deliveredOrders.find(order => !existingReviewIds.has(`${order.id}_${productId}`)) || null;
};

/**
 * Submit a review for a product from a verified Delivered order.
 * Uses a deterministic doc id (`${orderId}_${productId}`) so a repeat submission
 * for the same order/product is an update, not a create - and Firestore rules only
 * allow admins to update, so this naturally blocks duplicate/edited reviews.
 */
export const submitProductReview = async ({ productId, orderId, customerId, customerName, rating, comment }) => {
  const reviewId = `${orderId}_${productId}`;
  const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);

  await setDoc(reviewRef, {
    productId,
    orderId,
    customerId,
    customerName: customerName || 'Anonymous',
    rating,
    comment: comment || '',
    createdAt: serverTimestamp()
  });

  return reviewId;
};
