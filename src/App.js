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
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CustomAlert from './components/common/CustomAlert';
import { 
  fetchProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  subscribeToProductsUpdates,
  subscribeToCategoriesUpdates,
  addToFeaturedProducts, 
  removeFromFeaturedProducts
} from './utils/helpers';

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
        
        setUser(userData);
        setIsLoggedIn(true);
        setIsAdmin(userData.email === 'thapasyabangles@gmail.com');
        
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
        setCurrentView('products');
        break;
      case 'register':
        setCurrentView('login');
        break;
      case 'admin-products':
      case 'admin-orders':
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

      // Check if admin (based on email)
      const adminUser = userData.email === 'thapasyabangles@gmail.com';
      
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
      let userUid;

      if (isGoogleAuth) {
        // Google Auth registration
        userData = {
          ...formData,
          uid: formData.uid
        };
        userUid = formData.uid;
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
        userUid = firebaseUser.uid;
      }

      // Check if admin (based on email)
      const adminUser = userData.email === 'thapasyabangles@gmail.com';
      
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

  const updateOrderStatus = (orderId, status) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
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
      case 'admin-dashboard':
        return isAdmin ? (
          <AdminDashboard 
            products={products} 
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
      case 'admin-products':
        return isAdmin ? (
          <ManageProducts
            products={products}
            onAdd={handleAddProduct}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
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
      case 'admin-orders':
        return isAdmin ? (
          <ManageOrders
            orders={orders}
            onStatusUpdate={updateOrderStatus}
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
      <Footer />
    </div>
  );
}

export default App;