// utils/helpers.js
import { db, COLLECTIONS, DOCUMENTS } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';

/**
 * Convert Google Drive URL to direct image URL
 */
export const convertGoogleDriveUrl = (url) => {
  if (typeof url !== 'string' || !url) {
    console.error('Invalid URL provided to convertGoogleDriveUrl:', url);
    return null;
  }
  
  try {
    let fileId = null;
    
    if (url.includes('uc?export=view&id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    } else if (url.includes('drive.google.com/file/d/')) {
      fileId = url.split('/d/')[1].split('/')[0];
    } else if (url.includes('/open?id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    } else if (url.includes('/view?usp=drive_link')) {
      fileId = url.split('/d/')[1].split('/view')[0];
    }
    
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}=s1000`;
    }
    
    return url;
  } catch (e) {
    console.error('Error converting URL:', url, e);
    return url;
  }
};


/**
 * Extract unique categories from products
 */
export const extractCategoriesFromProducts = (products) => {
  if (!products || !Array.isArray(products)) return [];
  
  const categories = products
    .map(product => product.category)
    .filter(category => category && category.trim() !== '');
  
  return [...new Set(categories)].sort();
};

/**
 * Get next product ID (max ID + 1)
 */
export const getNextProductId = async () => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      return 1;
    }
    
    // Find maximum numeric ID
    let maxId = 0;
    snapshot.forEach((doc) => {
      const id = parseInt(doc.id);
      if (!isNaN(id) && id > maxId) {
        maxId = id;
      }
    });
    
    return maxId + 1;
  } catch (error) {
    console.error('Error getting next product ID:', error);
    return 1;
  }
};

/**
 * Fetch all categories from Firebase
 */
export const fetchCategories = async () => {
  try {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
    const q = query(categoriesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    const categories = [];
    snapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Fetch category images from Firebase
 */
export const fetchCategoryImages = async () => {
  try {
    const docRef = doc(db, COLLECTIONS.CATEGORY_PICTURES, DOCUMENTS.IMAGES);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const imagesData = data.images || {};
      
      // Convert all Google Drive URLs
      const convertedImages = {};
      Object.keys(imagesData).forEach(category => {
        const url = imagesData[category];
        if (typeof url === 'string' && url) {
          convertedImages[category] = convertGoogleDriveUrl(url);
        }
      });
      
      return convertedImages;
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching category images:', error);
    return {};
  }
};

/**
 * Add a new category
 */
export const addCategory = async (categoryData) => {
  try {
    const { id, title, gradient, order } = categoryData;
    
    if (!id || !title) {
      throw new Error('Category ID and title are required');
    }
    
    const categoryRef = doc(db, COLLECTIONS.CATEGORIES, id);
    await setDoc(categoryRef, {
      title,
      gradient: gradient || 'from-gray-400 to-gray-500',
      order: order || 999,
      createdAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

/**
 * Update category image
 */
export const updateCategoryImage = async (categoryId, imageUrl) => {
  try {
    const docRef = doc(db, COLLECTIONS.CATEGORY_PICTURES, DOCUMENTS.IMAGES);
    const docSnap = await getDoc(docRef);
    
    const currentImages = docSnap.exists() ? docSnap.data().images || {} : {};
    
    await setDoc(docRef, {
      images: {
        ...currentImages,
        [categoryId]: imageUrl
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error updating category image:', error);
    throw error;
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId) => {
  try {
    const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    await deleteDoc(categoryRef);
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Fetch all products
 */
export const fetchProducts = async () => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(productsRef);
    
    const products = [];
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
        image: convertGoogleDriveUrl(doc.data().image)
      });
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

/**
 * Add a new product
 */
export const addProduct = async (productData) => {
  try {
    const nextId = await getNextProductId();
    const productRef = doc(db, COLLECTIONS.PRODUCTS, nextId.toString());
    
    await setDoc(productRef, {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return nextId.toString();
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

/**
 * Update a product
 */
export const updateProduct = async (productId, productData) => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId.toString());
    
    await updateDoc(productRef, {
      ...productData,
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId.toString());
    await deleteDoc(productRef);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Setup real-time listener for categories
 */
export const subscribeToCategoriesUpdates = (callback) => {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  
  return onSnapshot(productsRef, (snapshot) => {
    const products = [];
    snapshot.forEach(doc => {
      products.push({ 
        id: doc.id, 
        ...doc.data(),
        image: convertGoogleDriveUrl(doc.data().image)
      });
    });
    
    const categories = extractCategoriesFromProducts(products);
    callback(categories);
  });
};



export const getProductsByCategory = async (category) => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(productsRef);
    
    const products = [];
    snapshot.forEach((doc) => {
      const product = {
        id: doc.id,
        ...doc.data(),
        image: convertGoogleDriveUrl(doc.data().image)
      };
      
      if (category === 'all' || product.category === category) {
        products.push(product);
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};



export const getFeaturedProducts = async () => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(productsRef);
    
    const products = [];
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
        image: convertGoogleDriveUrl(doc.data().image)
      });
    });
    
    // Return top 4 products by rating as featured
    return products
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};




export const getProductById = async (productId) => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId.toString());
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        ...productSnap.data(),
        image: convertGoogleDriveUrl(productSnap.data().image)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

/**
 * Search products
 */
export const searchProducts = async (searchTerm) => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(productsRef);
    
    const products = [];
    snapshot.forEach((doc) => {
      const product = {
        id: doc.id,
        ...doc.data(),
        image: convertGoogleDriveUrl(doc.data().image)
      };
      
      if (product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        products.push(product);
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

/**
 * Setup real-time listener for products
 */
export const subscribeToProductsUpdates = (callback) => {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  
  return onSnapshot(productsRef, (snapshot) => {
    const products = [];
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
        image: convertGoogleDriveUrl(doc.data().image)
      });
    });
    callback(products);
  });
};