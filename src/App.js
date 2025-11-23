// App.js - Updated with Cart and Wishlist functionality
import React, { useState } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from './pages/ManageProducts';
import ManageOrders from './pages/ManageOrders';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import { initialProducts, initialOrders } from './data/mockData';
import { ADMIN_CREDENTIALS } from './utils/constants';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

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

  const handleProductClick = (productId) => {
    setSelectedProductId(productId);
    setCurrentView('product-details');
  };

  const handleBackToProducts = () => {
    setSelectedProductId(null);
    setCurrentView('products');
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
    switch (currentView) {
      case 'home':
        return <HomePage 
          setCurrentView={setCurrentView} 
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
        />;
      case 'products':
        return <ProductsPage 
          products={products} 
          onProductClick={handleProductClick}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
        />;
      case 'product-details':
        const selectedProduct = products.find(p => p.id === selectedProductId);
        return <ProductDetailsPage 
          product={selectedProduct} 
          onBack={handleBackToProducts}
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
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
      case 'admin-login':
        return <AdminLoginPage onLogin={handleAdminLogin} />;
      case 'admin-dashboard':
        return <AdminDashboard 
          products={products} 
          orders={orders} 
          setCurrentView={setCurrentView}
        />;
      case 'admin-products':
        return (
          <ManageProducts
            products={products}
            onAdd={addProduct}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
            setCurrentView={setCurrentView}
          />
        );
      case 'admin-orders':
        return (
          <ManageOrders
            orders={orders}
            onStatusUpdate={updateOrderStatus}
            setCurrentView={setCurrentView}
          />
        );
      default:
        return <HomePage 
          setCurrentView={setCurrentView} 
          onAddToWishlist={handleAddToWishlist}
          onAddToCart={handleAddToCart}
        />;
    }
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        isAdmin={isAdmin}
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