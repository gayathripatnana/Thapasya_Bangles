// App.js - Updated with Firebase integration for cart and wishlist
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
import { 
  fetchProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  subscribeToProductsUpdates,
  subscribeToCategoriesUpdates
} from './utils/helpers';

// ADD THESE CART AND WISHLIST IMPORTS
import { 
  addToCart, 
  removeFromCart, 
  updateCartQuantity, 
  getCart 
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

  // Check for existing session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('thapasyaUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsLoggedIn(true);
      // Check if admin based on email
      setIsAdmin(userData.email === 'thapasyabangles@gmail.com');
      
      // Load user's cart and wishlist if logged in
      if (userData.uid) {
        const loadUserData = async () => {
          try {
            const userCart = await getCart(userData.uid);
            const userWishlist = await getWishlist(userData.uid);
            setCartItems(userCart);
            setWishlistItems(userWishlist);
          } catch (error) {
            console.error('Error loading user data:', error);
          }
        };
        loadUserData();
      }
    }
    setLoading(false);
  }, []);

  // Load products from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToProductsUpdates((fetchedProducts) => {
      setProducts(fetchedProducts);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Handle user login
  const handleLogin = (email, password, isGoogleAuth = false, googleUser = null) => {
    let userData;
    
    if (isGoogleAuth) {
      userData = {
        ...googleUser,
        uid: googleUser.uid
      };
    } else {
      // Email/password login
      userData = {
        email: email,
        name: email.split('@')[0],
        isGoogleAuth: false,
        uid: email // Using email as UID fallback, you should get actual UID from Firebase Auth
      };
    }

    // Check if admin (based on email)
    const adminUser = email === 'thapasyabangles@gmail.com';
    
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(adminUser);
    
    // Save to localStorage
    localStorage.setItem('thapasyaUser', JSON.stringify(userData));
    
    // Load user's cart and wishlist after login
    const loadUserData = async () => {
      try {
        const userCart = await getCart(userData.uid);
        const userWishlist = await getWishlist(userData.uid);
        setCartItems(userCart);
        setWishlistItems(userWishlist);
      } catch (error) {
        console.error('Error loading user data after login:', error);
      }
    };
    loadUserData();
    
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
  };

  // Handle user registration
  const handleRegister = (formData, isGoogleAuth = false) => {
    let userData;
    
    if (isGoogleAuth) {
      userData = {
        ...formData,
        uid: formData.uid
      };
    } else {
      userData = {
        name: formData.name,
        email: formData.email,
        isGoogleAuth: false,
        uid: formData.email // Using email as UID fallback
      };
    }

    // Check if admin (based on email)
    const adminUser = userData.email === 'thapasyabangles@gmail.com';
    
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(adminUser);
    
    // Save to localStorage
    localStorage.setItem('thapasyaUser', JSON.stringify(userData));
    
    // Redirect based on role
    setCurrentView(adminUser ? 'admin-dashboard' : 'home');
    
    return true;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
    setCartItems([]);
    setWishlistItems([]);
    localStorage.removeItem('thapasyaUser');
    setCurrentView('home');
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
  };

  const handleBackToProducts = () => {
    setSelectedProductId(null);
    setCurrentView('products');
  };

  // Firebase product operations
  const handleAddProduct = async (productData) => {
    try {
      await addProduct(productData);
      // Products will be updated automatically via the subscription
      return true;
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
      return false;
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      await updateProduct(id, productData);
      // Products will be updated automatically via the subscription
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
      return false;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      // Products will be updated automatically via the subscription
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
      return false;
    }
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  // Cart functions with Firebase integration
  const handleAddToCart = async (product) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Store the product temporarily and redirect to login
      setSelectedProductId(product.id);
      setCurrentView('login');
      return;
    }

    try {
      await addToCart(user.uid, product);
      // Update local state
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        if (existingItem) {
          return prevItems.map(item =>
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
        } else {
          return [...prevItems, { ...product, quantity: 1 }];
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart');
    }
  };

  const handleUpdateCartQuantity = async (productId, quantity) => {
    if (!isLoggedIn) return;
    
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
      alert('Error updating cart quantity');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!isLoggedIn) return;
    
    try {
      await removeFromCart(user.uid, productId);
      // Update local state
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Error removing product from cart');
    }
  };

  // Wishlist functions with Firebase integration
  const handleAddToWishlist = async (product) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Store the product temporarily and redirect to login
      setSelectedProductId(product.id);
      setCurrentView('login');
      return;
    }

    try {
      await addToWishlist(user.uid, product);
      // Update local state
      setWishlistItems(prevItems => {
        if (prevItems.some(item => item.id === product.id)) {
          return prevItems;
        }
        return [...prevItems, product];
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Error adding product to wishlist');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    if (!isLoggedIn) return;
    
    try {
      await removeFromWishlist(user.uid, productId);
      // Update local state
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Error removing product from wishlist');
    }
  };

  const handleClearWishlist = async () => {
    if (!isLoggedIn) return;
    
    try {
      await clearWishlist(user.uid);
      setWishlistItems([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      alert('Error clearing wishlist');
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
          setCurrentView={setCurrentView} 
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
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
          setCurrentView={setCurrentView}
        />;
      case 'product-details':
        const selectedProduct = products.find(p => p.id === selectedProductId);
        return <ProductDetailsPage 
          product={selectedProduct} 
          onBack={handleBackToProducts}
          onAddToWishlist={handleAddToWishlist}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
          navigateToCart={() => setCurrentView('cart')}
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
      <Footer />
    </div>
  );
}

export default App;