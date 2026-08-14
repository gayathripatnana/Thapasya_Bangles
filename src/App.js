// App.js - Updated with proper Firebase Auth integration
import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from './pages/ManageProducts';
import ManageOrders from './pages/ManageOrders';
import ManageCustomers from './pages/ManageCustomers';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import ManageCategories from './pages/ManageCategories';
import ManageShipping from './pages/ManageShipping';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import MyOrdersPage from './pages/MyOrdersPage';
import CustomAlert from './components/common/CustomAlert';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  subscribeToProductsUpdates,
  addToFeaturedProducts,
  removeFromFeaturedProducts,
  subscribeToCategoryList,
  subscribeToCategoryImages,
  addCategory,
  deleteCategory,
  updateCategoryImage
} from './utils/helpers';
import {
  subscribeToOrdersUpdates,
  subscribeToCustomerOrders,
  updateOrderStatus as updateOrderStatusInFirestore
} from './utils/orderHelpers';
import { subscribeToCustomersUpdates } from './utils/customerHelpers';
import { subscribeToStoreSettings, updateStoreSettings, DEFAULT_STORE_SETTINGS } from './utils/settingsHelpers';
import { subscribeToShippingRates, updateShippingRates, DEFAULT_SHIPPING_SETTINGS } from './utils/shippingHelpers';

// Firebase Auth imports
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase/config';

// Cart and Wishlist imports
import { 
  addToCart, 
  removeFromCart, 
  updateCartQuantity, 
  getCart,
  updateCartSize
} from './utils/cartHelpers';
import { 
  addToWishlist, 
  removeFromWishlist, 
  getWishlist, 
  clearWishlist 
} from './utils/wishlistHelpers';

import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [storeSettings, setStoreSettings] = useState(DEFAULT_STORE_SETTINGS);
  const [shippingRates, setShippingRates] = useState(DEFAULT_SHIPPING_SETTINGS);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Create a wrapper function to handle view changes with optional parameters
  const handleViewChange = (view, params = {}) => {
  if (params.category) {
    setSelectedCategory(params.category);
  }
  setCurrentView(view);
  window.history.pushState({ view }, '', `/${view}`);
};

  // Check for existing auth state on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          isGoogleAuth: !!firebaseUser.providerData?.some(provider => provider.providerId === 'google.com')
        };

        // Admin status comes from a server-set custom claim, not the email address -
        // force a refresh so a newly-granted/revoked claim is picked up right away
        const idTokenResult = await firebaseUser.getIdTokenResult(true);

        setUser(userData);
        setIsLoggedIn(true);
        setIsAdmin(idTokenResult.claims.admin === true);
        
        // Load user's cart and wishlist using the actual Firebase UID
        try {
          const userCart = await getCart(firebaseUser.uid);
          const userWishlist = await getWishlist(firebaseUser.uid);
          setCartItems(userCart);
          setWishlistItems(userWishlist);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        // User is signed out
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUser(null);
        setCartItems([]);
        setWishlistItems([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load products from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToProductsUpdates((fetchedProducts) => {
      setProducts(fetchedProducts);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Load admin-added custom categories from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToCategoryList((fetchedCategories) => {
      setCustomCategories(fetchedCategories);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Load category images from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToCategoryImages((images) => {
      setCategoryImages(images);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Load orders from Firebase - admin sees all orders, a signed-in customer sees only
  // their own (Firestore rules only allow reading your own order docs otherwise, so an
  // unfiltered query would be denied and silently return nothing for non-admin sessions)
  useEffect(() => {
    if (isAdmin) {
      const unsubscribe = subscribeToOrdersUpdates((fetchedOrders) => {
        setOrders(fetchedOrders);
      });
      return () => unsubscribe && unsubscribe();
    }

    if (user?.uid) {
      const unsubscribe = subscribeToCustomerOrders(user.uid, (fetchedOrders) => {
        setOrders(fetchedOrders);
      });
      return () => unsubscribe && unsubscribe();
    }

    setOrders([]);
  }, [isAdmin, user?.uid]);

  // Load customers from Firebase - admin only, since Firestore rules don't allow
  // anyone else to list the full users collection
  useEffect(() => {
    if (!isAdmin) {
      setCustomers([]);
      return;
    }

    const unsubscribe = subscribeToCustomersUpdates((fetchedCustomers) => {
      setCustomers(fetchedCustomers);
    });

    return () => unsubscribe && unsubscribe();
  }, [isAdmin]);

  // Load store settings from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToStoreSettings((settings) => {
      setStoreSettings(settings);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Load shipping rates from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToShippingRates((rates) => {
      setShippingRates(rates);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Add this useEffect in App.js
useEffect(() => {
  const handleBackButton = () => {
    console.log('Back button pressed, current view:', currentView);
    
    switch (currentView) {
      case 'product-details':
        handleBackToProducts();
        break;
      case 'cart':
      case 'wishlist':
      case 'orders':
        setCurrentView('products');
        break;
      case 'register':
        setCurrentView('login');
        break;
      case 'admin-products':
      case 'admin-orders':
      case 'admin-customers':
      case 'admin-reports':
      case 'admin-settings':
      case 'admin-categories':
      case 'admin-shipping':
        setCurrentView('admin-dashboard');
        break;
      case 'products':
      case 'login':
      case 'admin-dashboard':
        setCurrentView('home');
        break;
      case 'home':
        // Let browser handle normally (exit app)
        return;
      default:
        setCurrentView('home');
    }
    
    // Prevent default browser back behavior since we handled it
    window.history.pushState(null, '', window.location.href);
  };

  // Initialize history
  window.history.pushState(null, '', window.location.href);
  
  // Add event listener
  window.addEventListener('popstate', handleBackButton);
  
  return () => {
    window.removeEventListener('popstate', handleBackButton);
  };
}, [currentView]);


  const showAlert = (title, message, type = 'info') => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  // Handle user login with Firebase Auth
  const handleLogin = async (email, password, isGoogleAuth = false, googleUser = null) => {
    try {
      let userData;
      let userUid;

      if (isGoogleAuth) {
        // Google Auth - user data comes from Google
        userData = {
          ...googleUser,
          uid: googleUser.uid
        };
        userUid = googleUser.uid;
      } else {
        // Email/password login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || email.split('@')[0],
          isGoogleAuth: false
        };
        userUid = firebaseUser.uid;
      }

      // Admin status comes from a server-set custom claim, not the email address
      const idTokenResult = await auth.currentUser.getIdTokenResult(true);
      const adminUser = idTokenResult.claims.admin === true;

      setUser(userData);
      setIsLoggedIn(true);
      setIsAdmin(adminUser);

      // Load user's cart and wishlist using the actual Firebase UID
      try {
        const userCart = await getCart(userUid);
        const userWishlist = await getWishlist(userUid);
        setCartItems(userCart);
        setWishlistItems(userWishlist);
      } catch (error) {
        console.error('Error loading user data after login:', error);
      }
      
      // Check if there's a product to add to cart after login
      if (selectedProductId) {
        const productToAdd = products.find(p => p.id === selectedProductId);
        if (productToAdd) {
          handleAddToCart(productToAdd);
        }
        setSelectedProductId(null);
      }
      
      // Redirect based on role
      setCurrentView(adminUser ? 'admin-dashboard' : 'home');
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      showAlert('Login Failed', error.message, 'error');
      return false;
    }
  };

  // Handle user registration with Firebase Auth
  const handleRegister = async (formData, isGoogleAuth = false) => {
    try {
      let userData;

      if (isGoogleAuth) {
        // Google Auth registration
        userData = {
          ...formData,
          uid: formData.uid
        };
      } else {
        // Email/password registration
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const firebaseUser = userCredential.user;

        userData = {
          uid: firebaseUser.uid,
          name: formData.name,
          email: formData.email,
          isGoogleAuth: false
        };
      }

      // Admin status comes from a server-set custom claim, not the email address
      // (a brand-new registration will never have it - that's intentional)
      const idTokenResult = await auth.currentUser.getIdTokenResult(true);
      const adminUser = idTokenResult.claims.admin === true;

      setUser(userData);
      setIsLoggedIn(true);
      setIsAdmin(adminUser);

      // Redirect based on role
      setCurrentView(adminUser ? 'admin-dashboard' : 'home');
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      showAlert('Registration Failed', error.message, 'error');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will handle the state cleanup
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

 const handleProductClick = (productId) => {
  setSelectedProductId(productId);
  setCurrentView('product-details');
  window.history.pushState({ view: 'product-details' }, '', `/product/${productId}`);
};

  const handleBackToProducts = () => {
  setSelectedProductId(null);
  setCurrentView('products');
  window.history.pushState({ view: 'products' }, '', '/products');
};

  const handleAddProduct = async (productData) => {
    try {
      const productId = await addProduct(productData);
      
      // Handle featured products
      if (productData.isFeatured) {
        await addToFeaturedProducts({ ...productData, id: productId });
      }
      
      return true;
    } catch (error) {
      console.error('Error adding product:', error);
      showAlert('Error', 'Error adding product. Please try again.', 'error');
      return false;
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      await updateProduct(id, productData);
      
      // Handle featured products
      if (productData.isFeatured) {
        await addToFeaturedProducts({ ...productData, id: id });
      } else {
        await removeFromFeaturedProducts(id);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      showAlert('Error', 'Error updating product. Please try again.', 'error');
      return false;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      await removeFromFeaturedProducts(id); // Remove from featured too
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      showAlert('Error', 'Error deleting product. Please try again.', 'error');
      return false;
    }
  };

  const handleAddCategory = async (categoryData) => {
    try {
      await addCategory(categoryData);
      return true;
    } catch (error) {
      console.error('Error adding category:', error);
      showAlert('Error', error.message || 'Error adding category. Please try again.', 'error');
      return false;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      showAlert('Error', 'Error deleting category. Please try again.', 'error');
      return false;
    }
  };

  const handleUpdateCategoryImage = async (categoryId, imageUrl) => {
    try {
      await updateCategoryImage(categoryId, imageUrl);
      return true;
    } catch (error) {
      console.error('Error updating category image:', error);
      showAlert('Error', 'Error updating category image. Please try again.', 'error');
      return false;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatusInFirestore(orderId, status);
    } catch (error) {
      console.error('Error updating order status:', error);
      showAlert('Error', 'Error updating order status. Please try again.', 'error');
    }
  };

  const handleUpdateStoreSettings = async (settingsData) => {
    try {
      await updateStoreSettings(settingsData);
      showAlert('Success', 'Store settings updated successfully.', 'success');
      return true;
    } catch (error) {
      console.error('Error updating store settings:', error);
      showAlert('Error', 'Error updating store settings. Please try again.', 'error');
      return false;
    }
  };

  const handleUpdateShippingRates = async (ratesData) => {
    try {
      await updateShippingRates(ratesData);
      showAlert('Success', 'Shipping rates updated successfully.', 'success');
      return true;
    } catch (error) {
      console.error('Error updating shipping rates:', error);
      showAlert('Error', 'Error updating shipping rates. Please try again.', 'error');
      return false;
    }
  };

  const handleAddToCart = async (product) => {
    // Check if size is required but not selected (skip for Hair Accessories and Return Gifts)
    const sizeRequired = product.sizes && product.sizes.length > 0 && 
                        product.category !== 'Hair Accessories' && 
                        product.category !== 'Return Gifts';
    
    if (sizeRequired && !product.selectedSize) {
      showAlert(
        'Size Required', 
        'Please select a size before adding to cart', 
        'warning'
      );
      return;
    }

    if (!isLoggedIn || !user?.uid) {
      setSelectedProductId(product.id);
      setCurrentView('login');
      return;
    }

    try {
      // Create a clean product object without undefined fields
      const cleanProduct = {
        ...product,
        selectedSize: product.selectedSize || null // Convert undefined to null for Firebase
      };
      
      // Use the actual Firebase UID as document ID
      await addToCart(user.uid, cleanProduct);
      
      // Update local state
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => 
          item.id === cleanProduct.id && item.selectedSize === cleanProduct.selectedSize
        );
        if (existingItem) {
          return prevItems.map(item =>
            item.id === cleanProduct.id && item.selectedSize === cleanProduct.selectedSize
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
        } else {
          return [...prevItems, { ...cleanProduct, quantity: 1 }];
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      showAlert('Error', 'Error adding product to cart', 'error');
    }
  };

  // Add function to update size in cart
  const handleUpdateCartSize = async (productId, newSize) => {
    if (!isLoggedIn || !user?.uid) return;
    
    try {
      await updateCartSize(user.uid, productId, newSize);
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, selectedSize: newSize } : item
        )
      );
    } catch (error) {
      console.error('Error updating cart size:', error);
      showAlert('Error', 'Error updating product size', 'error');
    }
  };

  const handleUpdateCartQuantity = async (productId, quantity) => {
    if (!isLoggedIn || !user?.uid) return;
    
    try {
      await updateCartQuantity(user.uid, productId, quantity);
      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        ).filter(item => item.quantity > 0)
      );
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      showAlert('Error', 'Error updating cart quantity', 'error');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!isLoggedIn || !user?.uid) return;
    
    try {
      await removeFromCart(user.uid, productId);
      // Update local state
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      showAlert('Error', 'Error removing product from cart', 'error');
    }
  };

  const handleAddToWishlist = async (product) => {
    // Check if size is required but not selected (skip for Hair Accessories and Return Gifts)
    const sizeRequired = product.sizes && product.sizes.length > 0 && 
                        product.category !== 'Hair Accessories' && 
                        product.category !== 'Return Gifts';
    
    if (sizeRequired && !product.selectedSize) {
      showAlert(
        'Size Required', 
        'Please select a size before adding to wishlist', 
        'warning'
      );
      return;
    }

    if (!isLoggedIn || !user?.uid) {
      setSelectedProductId(product.id);
      setCurrentView('login');
      return;
    }

    try {
      // Create a clean product object without undefined fields
      const cleanProduct = {
        ...product,
        selectedSize: product.selectedSize || null // Convert undefined to null for Firebase
      };
      
      // Use the actual Firebase UID as document ID
      await addToWishlist(user.uid, cleanProduct);
      
      // Update local state
      setWishlistItems(prevItems => {
        if (prevItems.some(item => item.id === cleanProduct.id && item.selectedSize === cleanProduct.selectedSize)) {
          return prevItems;
        }
        return [...prevItems, cleanProduct];
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showAlert('Error', 'Error adding product to wishlist', 'error');
    }
  };

  const handleRemoveFromWishlist = async (productId, selectedSize = null) => {
    if (!isLoggedIn || !user?.uid) return;
    
    try {
      await removeFromWishlist(user.uid, productId);
      // Update local state - FIX: Remove based on both ID and size
      setWishlistItems(prevItems => 
        prevItems.filter(item => 
          !(item.id === productId && 
            (selectedSize !== undefined ? item.selectedSize === selectedSize : true))
        )
      );
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showAlert('Error', 'Error removing product from wishlist', 'error');
    }
  };

  const handleClearWishlist = async () => {
    if (!isLoggedIn || !user?.uid) return;
    
    try {
      await clearWishlist(user.uid);
      setWishlistItems([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      showAlert('Error', 'Error clearing wishlist', 'error');
    }
  };

  const handleMoveToCart = (product) => {
    handleAddToCart(product);
    handleRemoveFromWishlist(product.id);
  };

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    
    switch (currentView) {
      case 'home':
        return <HomePage
          setCurrentView={handleViewChange}
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
          storeSettings={storeSettings}
          customCategories={customCategories}
          categoryImages={categoryImages}
        />;
      case 'products':
        return <ProductsPage
          products={products}
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
          setCurrentView={handleViewChange}
          initialCategory={selectedCategory}
          customCategories={customCategories}
          categoryImages={categoryImages}
        />;
      case 'product-details':
        const selectedProduct = products.find(p => p.id === selectedProductId);
        return <ProductDetailsPage 
          product={selectedProduct} 
          onBack={handleBackToProducts}
          onAddToWishlist={handleAddToWishlist}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateCartQuantity}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
          navigateToCart={() => setCurrentView('cart')}
          onProductClick={handleProductClick}
          storeSettings={storeSettings}
          currentUserId={user?.uid}
          customerOrders={orders}
        />;
      case 'login':
        return <LoginPage 
          onLogin={handleLogin} 
          onSwitchToRegister={switchToRegister} 
        />;
      case 'register':
        return <RegisterPage 
          onRegister={handleRegister} 
          onSwitchToLogin={switchToLogin} 
        />;
      case 'cart':
        return <CartPage 
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onBack={() => setCurrentView('products')}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
          onUpdateCartSize={handleUpdateCartSize}
          currentUserId={user?.uid}
          storeSettings={storeSettings}
          shippingRates={shippingRates}
          showAlert={showAlert}
        />;
      case 'wishlist':
        return <WishlistPage
          wishlistItems={wishlistItems}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCart={handleMoveToCart}
          onProductClick={handleProductClick}
          onBack={() => setCurrentView('products')}
          cartItems={cartItems}
          onClearWishlist={handleClearWishlist}
        />;
      case 'orders':
        return isLoggedIn ? (
          <MyOrdersPage
            orders={orders}
            currentUserId={user?.uid}
            onBack={() => setCurrentView('products')}
            onProductClick={handleProductClick}
            storeSettings={storeSettings}
          />
        ) : <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={switchToRegister}
        />;
      case 'admin-dashboard':
        return isAdmin ? (
          <AdminDashboard
            products={products}
            orders={orders}
            customers={customers}
            setCurrentView={setCurrentView}
          />
        ) : <HomePage
          setCurrentView={setCurrentView}
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
        />;
      case 'admin-products':
        return isAdmin ? (
          <ManageProducts
            products={products}
            onAdd={handleAddProduct}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
            setCurrentView={setCurrentView}
            customCategories={customCategories}
          />
        ) : <HomePage 
          setCurrentView={setCurrentView} 
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
        />;
      case 'admin-orders':
        return isAdmin ? (
          <ManageOrders
            orders={orders}
            onStatusUpdate={updateOrderStatus}
            setCurrentView={setCurrentView}
            storeSettings={storeSettings}
          />
        ) : <HomePage
          setCurrentView={setCurrentView}
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
        />;
      case 'admin-customers':
        return isAdmin ? (
          <ManageCustomers
            customers={customers}
            orders={orders}
            setCurrentView={setCurrentView}
          />
        ) : <HomePage
          setCurrentView={setCurrentView}
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
        />;
      case 'admin-reports':
        return isAdmin ? (
          <AdminReports
            products={products}
            orders={orders}
            customers={customers}
            setCurrentView={setCurrentView}
          />
        ) : <HomePage
          setCurrentView={setCurrentView}
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
        />;
      case 'admin-settings':
        return isAdmin ? (
          <AdminSettings
            storeSettings={storeSettings}
            onUpdateSettings={handleUpdateStoreSettings}
            setCurrentView={setCurrentView}
          />
        ) : <HomePage
          setCurrentView={setCurrentView}
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
        />;
      case 'admin-categories':
        return isAdmin ? (
          <ManageCategories
            customCategories={customCategories}
            categoryImages={categoryImages}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateCategoryImage={handleUpdateCategoryImage}
            setCurrentView={setCurrentView}
          />
        ) : <HomePage
          setCurrentView={setCurrentView}
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
        />;
      case 'admin-shipping':
        return isAdmin ? (
          <ManageShipping
            shippingRates={shippingRates}
            onUpdateShippingRates={handleUpdateShippingRates}
            setCurrentView={setCurrentView}
          />
        ) : <HomePage
          setCurrentView={setCurrentView}
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
        />;
      default:
        return <HomePage 
          setCurrentView={setCurrentView} 
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
        />;
    }
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        user={user}
        handleLogout={handleLogout}
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistItemsCount={wishlistItems.length}
        myOrdersCount={user?.uid ? orders.filter(o => o.customerId === user.uid).length : 0}
      />
      <main className="min-h-screen">
        {renderCurrentView()}
      </main>
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
      <Footer settings={storeSettings} />
    </div>
  );
}

export default App;