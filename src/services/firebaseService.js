// src/services/firebaseService.js
import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  setDoc
} from 'firebase/firestore';

// Collection and document constants
const INTRO_PICTURES_COLLECTION = 'intro_pictures';
const CAROUSEL_DOC_ID = 'carousel_pictures';

// Get carousel images
export const getCarouselImages = async () => {
  try {
    const docRef = doc(db, INTRO_PICTURES_COLLECTION, CAROUSEL_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().images || [];
    } else {
      console.log('No such document!');
      return [];
    }
  } catch (error) {
    console.error('Error getting carousel images:', error);
    return [];
  }
};

// Real-time listener for carousel images
export const subscribeToCarouselImages = (callback) => {
  const docRef = doc(db, INTRO_PICTURES_COLLECTION, CAROUSEL_DOC_ID);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const images = docSnap.data().images || [];
      callback(images);
    } else {
      console.log('No such document!');
      callback([]);
    }
  });
};

// Add new carousel images (admin function)
export const addCarouselImages = async (imageUrls) => {
  try {
    const docRef = doc(db, INTRO_PICTURES_COLLECTION, CAROUSEL_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Update existing document
      const currentData = docSnap.data();
      const updatedImages = [...(currentData.images || []), ...imageUrls];
      await updateDoc(docRef, { images: updatedImages });
    } else {
      // Create new document
      await setDoc(docRef, { images: imageUrls });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding carousel images:', error);
    return false;
  }
};

// Set carousel images (admin function - replaces all images)
export const setCarouselImages = async (imageUrls) => {
  try {
    const docRef = doc(db, INTRO_PICTURES_COLLECTION, CAROUSEL_DOC_ID);
    await setDoc(docRef, { 
      images: imageUrls,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error setting carousel images:', error);
    return false;
  }
};