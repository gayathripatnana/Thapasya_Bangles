// utils/shippingHelpers.js
import { db, COLLECTIONS, DOCUMENTS } from '../firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Used whenever a product's weight hasn't been set by the admin
export const DEFAULT_PRODUCT_WEIGHT_KG = 0.5;

// Used whenever a customer's state has no rate configured yet
export const DEFAULT_SHIPPING_SETTINGS = {
  rates: {},
  defaultRatePerKg: 100
};

// Every order is billed for at least 1kg of shipping, even if the actual
// item weight is lower - extra weight above 1kg is billed on top of that.
export const MIN_BILLABLE_WEIGHT_KG = 1;

/**
 * Real-time listener for shipping rates, falling back to defaults if not yet configured
 */
export const subscribeToShippingRates = (callback) => {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, DOCUMENTS.SHIPPING_RATES);

  return onSnapshot(
    settingsRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...DEFAULT_SHIPPING_SETTINGS, ...docSnap.data() });
      } else {
        callback(DEFAULT_SHIPPING_SETTINGS);
      }
    },
    (error) => {
      console.error('Error subscribing to shipping rates, using defaults:', error);
      callback(DEFAULT_SHIPPING_SETTINGS);
    }
  );
};

/**
 * Overwrite the shipping rates document
 */
export const updateShippingRates = async (data) => {
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, DOCUMENTS.SHIPPING_RATES);
    const docSnap = await getDoc(settingsRef);
    const current = docSnap.exists() ? docSnap.data() : {};

    await setDoc(settingsRef, {
      ...current,
      ...data
    });

    return true;
  } catch (error) {
    console.error('Error updating shipping rates:', error);
    throw error;
  }
};

/**
 * Total weight (kg) of a cart/order's items, falling back to the default
 * weight for any item whose product has none set.
 */
export const calculateTotalWeight = (items = []) => {
  return items.reduce((sum, item) => {
    const weight = item.weight > 0 ? item.weight : DEFAULT_PRODUCT_WEIGHT_KG;
    return sum + weight * (item.quantity || 1);
  }, 0);
};

/**
 * Shipping cost = billable order weight (kg) x the customer's state rate (Rs/kg).
 * The billable weight has a 1kg minimum - a lighter order is still charged as
 * if it weighed 1kg, with any weight above that added on top as normal.
 * Falls back to the admin's default rate if that state has no rate set yet.
 */
export const calculateShippingCost = (items, state, shippingRates = DEFAULT_SHIPPING_SETTINGS) => {
  const billableWeight = Math.max(calculateTotalWeight(items), MIN_BILLABLE_WEIGHT_KG);
  const ratePerKg = (state && shippingRates.rates?.[state]) || shippingRates.defaultRatePerKg || DEFAULT_SHIPPING_SETTINGS.defaultRatePerKg;
  return Math.round(billableWeight * ratePerKg);
};
