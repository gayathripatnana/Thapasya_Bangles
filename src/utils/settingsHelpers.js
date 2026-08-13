// utils/settingsHelpers.js
import { db, COLLECTIONS, DOCUMENTS } from '../firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const DEFAULT_STORE_SETTINGS = {
  whatsappNumber: '918074086883',
  contactPhone: '+91 80740 86883',
  contactEmail: 'thapasyabangles@gmail.com',
  address: 'Mangalagiri, Andhra Pradesh',
  socialLinks: {
    facebook: 'https://facebook.com/thapasyabangles',
    instagram: 'https://instagram.com/thapasyabangles',
    twitter: 'https://twitter.com/thapasyabangles'
  }
};

/**
 * Real-time listener for store settings, falling back to defaults if not yet configured
 */
export const subscribeToStoreSettings = (callback) => {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, DOCUMENTS.STORE_INFO);

  return onSnapshot(
    settingsRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...DEFAULT_STORE_SETTINGS, ...docSnap.data() });
      } else {
        callback(DEFAULT_STORE_SETTINGS);
      }
    },
    (error) => {
      console.error('Error subscribing to store settings, using defaults:', error);
      callback(DEFAULT_STORE_SETTINGS);
    }
  );
};

/**
 * Merge-update the store settings document
 */
export const updateStoreSettings = async (data) => {
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, DOCUMENTS.STORE_INFO);
    const docSnap = await getDoc(settingsRef);
    const currentSettings = docSnap.exists() ? docSnap.data() : {};

    await setDoc(settingsRef, {
      ...currentSettings,
      ...data
    });

    return true;
  } catch (error) {
    console.error('Error updating store settings:', error);
    throw error;
  }
};
