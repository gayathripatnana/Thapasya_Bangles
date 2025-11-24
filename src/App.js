// App.js - Updated with Firebase integration
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
      userData = googleUser;
    } else {
      // Email/password login
      userData = {
        email: email,
        name: email.split('@')[0],
        isGoogleAuth: false
      };
    }

    // Check if admin (based on email)
    const adminUser = email === 'thapasyabangles@gmail.com';
    
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(adminUser);
    
    // Save to localStorage
    localStorage.setItem('thapasyaUser', JSON.stringify(userData));
    
    // Redirect based on role
    setCurrentView(adminUser ? 'admin-dashboard' : 'home');
    
    return true;
  };

  // Handle user registration
  const handleRegister = (formData, isGoogleAuth = false) => {
    let userData;
    
    if (isGoogleAuth) {
      userData = formData;
    } else {
      userData = {
        name: formData.name,
        email: formData.email,
        isGoogleAuth: false
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

  // Cart functions
  const handleAddToCart = (product) => {
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
  };

  const handleUpdateCartQuantity = (productId, quantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Wishlist functions
  const handleAddToWishlist = (product) => {
    setWishlistItems(prevItems => {
      if (prevItems.some(item => item.id === product.id)) {
        return prevItems;
      }
      return [...prevItems, product];
    });
  };

  const handleRemoveFromWishlist = (productId) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
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
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
        />;
      case 'product-details':
        const selectedProduct = products.find(p => p.id === selectedProductId);
        return <ProductDetailsPage 
          product={selectedProduct} 
          onBack={handleBackToProducts}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
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