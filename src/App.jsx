// App.jsx - Main Application Component
import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage'; // Changed from AdminLoginPage
import RegisterPage from './pages/RegisterPage'; // New import
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from './pages/ManageProducts';
import ManageOrders from './pages/ManageOrders';
import { initialProducts, initialOrders } from './data/mockData';
import { ADMIN_CREDENTIALS } from './utils/constants';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // New state
  const [user, setUser] = useState(null); // New state
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [cartItemsCount, setCartItemsCount] = useState(0); // Keep cart functionality
  const [wishlistItemsCount, setWishlistItemsCount] = useState(0); // Keep wishlist functionality

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
  }, []);

  // Handle user login (replaces handleAdminLogin)
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

  // Keep your existing product and order management functions
  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: Math.max(...products.map(p => p.id)) + 1
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id, productData) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...productData } : p));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const renderCurrentView = () => {
    console.log('Current View:', currentView);
    switch (currentView) {
      case 'home':
       return <HomePage setCurrentView={setCurrentView} />;
      case 'products':
        return <ProductsPage products={products} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} onSwitchToRegister={switchToRegister} />;
      case 'register':
        return <RegisterPage onRegister={handleRegister} onSwitchToLogin={switchToLogin} />;
      case 'admin-dashboard':
        return isAdmin ? <AdminDashboard products={products} orders={orders} /> : <HomePage />;
      case 'admin-products':
        return isAdmin ? (
          <ManageProducts
            products={products}
            onAdd={addProduct}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
          />
        ) : <HomePage />;
      case 'admin-orders':
        return isAdmin ? (
          <ManageOrders
            orders={orders}
            onStatusUpdate={updateOrderStatus}
          />
        ) : <HomePage />;
      // Add cases for cart and wishlist if needed
      case 'cart':
        // You can implement CartPage component here
        return <div>Cart Page - To be implemented</div>;
      case 'wishlist':
        // You can implement WishlistPage component here
        return <div>Wishlist Page - To be implemented</div>;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn} // Pass new prop
        user={user} // Pass new prop
        handleLogout={handleLogout}
        cartItemsCount={cartItemsCount} // Keep cart functionality
        wishlistItemsCount={wishlistItemsCount} // Keep wishlist functionality
      />
      <main className="min-h-screen">
        {renderCurrentView()}
      </main>
      <Footer />
    </div>
  );
}

export default App;