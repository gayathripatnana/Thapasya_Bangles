// App.jsx - Main Application Component
import React, { useState } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from './pages/ManageProducts';
import ManageOrders from './pages/ManageOrders';
import { initialProducts, initialOrders } from './data/mockData';
import { ADMIN_CREDENTIALS } from './utils/constants';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);

  const handleAdminLogin = (username, password) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAdmin(true);
      setCurrentView('admin-dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentView('home');
  };

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
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'products':
        return <ProductsPage products={products} />;
      case 'admin-login':
        return <AdminLoginPage onLogin={handleAdminLogin} />;
      case 'admin-dashboard':
        return <AdminDashboard products={products} orders={orders} />;
      case 'admin-products':
        return (
          <ManageProducts
            products={products}
            onAdd={addProduct}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
          />
        );
      case 'admin-orders':
        return (
          <ManageOrders
            orders={orders}
            onStatusUpdate={updateOrderStatus}
          />
        );
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
        handleLogout={handleLogout}
      />
      <main className="min-h-screen">
        {renderCurrentView()}
      </main>
      <Footer />
    </div>
  );
}

export default App;