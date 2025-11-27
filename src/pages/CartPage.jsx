// pages/CartPage.jsx - Optimized for Performance and Responsiveness
import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Tag, Truck, Shield, RotateCcw, Star, Phone, User, Mail, MapPin, Ruler } from 'lucide-react';
import { proceedToWhatsAppCheckout } from '../utils/whatsappCheckout';
import { getProductsByCategory } from '../utils/helpers';

// Lazy load heavy components
// Google Drive URL conversion function
const convertGoogleDriveUrl = (url) => {
  if (typeof url !== 'string' || !url) {
    console.error('Invalid URL provided to convertGoogleDriveUrl:', url);
    return null;
  }
  
  try {
    let fileId = null;
    
    // Handle different Google Drive URL formats
    if (url.includes('uc?export=view&id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    } else if (url.includes('drive.google.com/file/d/')) {
      fileId = url.split('/d/')[1].split('/')[0];
    } else if (url.includes('/open?id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    } else if (url.includes('/view?usp=drive_link') || url.includes('/view?usp=sharing')) {
      fileId = url.split('/d/')[1].split('/view')[0];
    }
    
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}=s300`;
    }
    
    return url;
  } catch (e) {
    console.error('Error converting URL:', url, e);
    return url;
  }
};

const CartPage = ({ cartItems, onUpdateQuantity, onRemoveItem, onBack, onProductClick, onAddToCart, onUpdateCartSize }) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showSizeModal, setShowSizeModal] = useState(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Memoized calculations for performance
  const { subtotal, deliveryCharges, total } = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharges = subtotal > 1500 ? 0 : 99;
    const total = subtotal - discount + deliveryCharges;
    
    return { subtotal, deliveryCharges, total };
  }, [cartItems, discount]);

  // Process cart items with optimized images
  const processedCartItems = useMemo(() => {
    return cartItems.map(item => ({
      ...item,
      image: convertGoogleDriveUrl(item.image)
    }));
  }, [cartItems]);

  // Promo codes
  const promoCodes = useMemo(() => ({
    'SAVE10': { type: 'percentage', value: 0.1, description: '10% off' },
    'WELCOME20': { type: 'percentage', value: 0.2, description: '20% off' },
    'FIRST50': { type: 'fixed', value: 50, description: '₹50 off' },
    'FREE100': { type: 'fixed', value: 100, description: '₹100 off' }
  }), []);

  // Load related products with optimization
  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (cartItems.length > 0) {
        setLoadingRelated(true);
        try {
          // Get categories from cart items and pick the most common one
          const categories = cartItems.map(item => item.category);
          const categoryCount = {};
          categories.forEach(category => {
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          });
          
          const mostCommonCategory = Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b
          );
          
          if (mostCommonCategory) {
            const related = await getProductsByCategory(mostCommonCategory);
            // Filter out products already in cart and limit to 4 for better performance
            const filteredRelated = related
              .filter(p => !cartItems.some(item => item.id === p.id))
              .slice(0, 4)
              .map(product => ({
                ...product,
                image: convertGoogleDriveUrl(product.image)
              }));
            setRelatedProducts(filteredRelated);
          }
        } catch (error) {
          console.error('Error loading related products:', error);
        } finally {
          setLoadingRelated(false);
        }
      } else {
        setRelatedProducts([]);
      }
    };

    loadRelatedProducts();
  }, [cartItems]);

  // Optimized event handlers
  const handleApplyPromo = useCallback(() => {
    const upperPromoCode = promoCode.toUpperCase();
    if (promoCodes[upperPromoCode]) {
      const promo = promoCodes[upperPromoCode];
      const promoDiscount = promo.type === 'percentage' 
        ? subtotal * promo.value
        : promo.value;
      
      setDiscount(promoDiscount);
      setAppliedPromoCode(upperPromoCode);
      setPromoCode('');
    } else {
      alert('Invalid promo code');
    }
  }, [promoCode, promoCodes, subtotal]);

  const handleRemovePromo = useCallback(() => {
    setDiscount(0);
    setAppliedPromoCode('');
  }, []);

  const handleCustomerInfoChange = useCallback((field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCheckout = useCallback(() => {
    const orderSummary = {
      subtotal,
      discount,
      deliveryCharges,
      total
    };

    // Check if customer wants to provide info
    if (!showCustomerForm && !customerInfo.name) {
      setShowCustomerForm(true);
      return;
    }

    // Proceed with WhatsApp checkout
    const finalCustomerInfo = customerInfo.name ? customerInfo : null;
    proceedToWhatsAppCheckout(cartItems, orderSummary, finalCustomerInfo);
  }, [cartItems, customerInfo, deliveryCharges, discount, showCustomerForm, subtotal, total]);

  const handleQuickCheckout = useCallback(() => {
    // Direct checkout without customer form
    const orderSummary = {
      subtotal,
      discount,
      deliveryCharges,
      total
    };

    proceedToWhatsAppCheckout(cartItems, orderSummary, null);
  }, [cartItems, deliveryCharges, discount, subtotal, total]);

  const handleRelatedProductClick = useCallback((productId) => {
    if (onProductClick) {
      onProductClick(productId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onProductClick]);

  const handleAddRelatedToCart = useCallback((product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  }, [onAddToCart]);

  const handleSizeChange = useCallback((productId, newSize) => {
    if (onUpdateCartSize) {
      onUpdateCartSize(productId, newSize);
    }
    setShowSizeModal(null);
  }, [onUpdateCartSize]);

  // Loading skeleton for cart items
  const CartItemSkeleton = () => (
    <div className="p-4 sm:p-6 border-b border-gray-200 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-4"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Continue Shopping</span>
          </button>

          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <ShoppingCart className="w-20 h-20 sm:w-24 sm:h-24 mx-auto" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 px-4">Looks like you haven't added anything to your cart yet</p>
            <button
              onClick={onBack}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Continue Shopping</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cart Items - Takes 2/3 on desktop */}
          <div className="lg:flex-1 lg:max-w-[66.666%]">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {processedCartItems.map((item) => (
                  <div 
                    key={`${item.id}-${item.selectedSize}`} 
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div 
                        className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 cursor-pointer"
                        onClick={() => handleRelatedProductClick(item.id)}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                          onError={(e) => {
                            console.error('Failed to load cart item image:', item.image);
                            e.target.src = 'https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=Image+Error';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.category}</p>
                        
                        {/* Size Display and Edit */}
                        {item.sizes && item.sizes.length > 0 && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-gray-500">Size:</span>
                            <button
                              onClick={() => setShowSizeModal(item.id)}
                              className="flex items-center space-x-1 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded px-2 py-1 bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                              <Ruler className="w-3 h-3" />
                              <span>{item.selectedSize || 'Select Size'}</span>
                            </button>
                          </div>
                        )}
                        
                        {/* Rating */}
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-600 text-xs ml-1">({item.rating})</span>
                        </div>
                        
                        <p className="text-lg sm:text-xl font-bold text-yellow-600">₹{item.price.toLocaleString()}</p>
                      </div>

                      <div className="flex flex-col items-end space-y-3">
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <span className="px-3 py-2 border-x border-gray-300 min-w-[40px] text-center text-sm sm:text-base">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        <p className="text-base sm:text-lg font-semibold text-gray-800">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 sm:p-6 border-t border-gray-200">
                <button
                  onClick={onBack}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add More Items</span>
                </button>
              </div>
            </div>

            {/* Enhanced Recommended Products Section */}
            {relatedProducts.length > 0 && (
              <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Recommended for You</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">Products you might like based on your cart</p>
                  </div>
                  <div className="hidden sm:flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>Curated just for you</span>
                  </div>
                </div>
                
                {loadingRelated ? (
  <div className="flex justify-center items-center py-8 sm:py-12">
    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-yellow-500"></div>
    <span className="ml-3 text-gray-600 text-sm">Loading recommendations...</span>
  </div>
) : (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
    {relatedProducts.map((product) => (
      <div
        key={product.id}
        className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
      >
        <div 
          className="relative aspect-square overflow-hidden rounded-t-lg cursor-pointer"
          onClick={() => handleRelatedProductClick(product.id)}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              console.error('Failed to load related product image:', product.image);
              e.target.src = 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=Image+Error';
            }}
          />
          {/* Quick Add Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddRelatedToCart(product);
            }}
            className="absolute bottom-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
            aria-label="Add to cart"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          {/* Rating Badge */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span>{product.rating}</span>
          </div>
        </div>
        
        <div className="p-3">
          <h4 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
            {product.name}
          </h4>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold text-yellow-600">₹{product.price.toLocaleString()}</span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full hidden sm:inline-block">
              {Math.round(20)}% off
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="truncate">{product.category}</span>
            <span className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span>{product.rating}</span>
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
              </div>
            )}

            {/* Order Notes */}
            <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Order Notes (Optional)</h3>
              <textarea
                placeholder="Any special instructions for your order..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-sm"
              ></textarea>
              <p className="text-xs text-gray-500 mt-2">
                Note: These instructions will be included in your WhatsApp order message
              </p>
            </div>
          </div>

          {/* Order Summary - Takes 1/3 on desktop, fixed positioning */}
          <div className="lg:w-1/3 lg:max-w-[33.333%]">
            <div className="bg-white rounded-lg shadow-md sticky top-4 lg:top-8 z-10 max-h-[85vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Order Summary</h3>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {/* Promo Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>
                  
                  {/* Available Promo Codes */}
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Available codes:</div>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(promoCodes).map(([code, details]) => (
                        <button
                          key={code}
                          onClick={() => setPromoCode(code)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors truncate"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {appliedPromoCode && (
                    <div className="mt-2 flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                          {appliedPromoCode} applied
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-yellow-600 text-sm sm:text-base">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className={`font-medium ${deliveryCharges === 0 ? 'text-yellow-600' : ''}`}>
                      {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-yellow-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Truck className="w-4 h-4" />
                    <span className="font-medium text-sm">Delivery Information</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {deliveryCharges === 0 
                      ? 'Free delivery on orders above ₹1,500' 
                      : `Add ₹${(1500 - subtotal).toLocaleString()} more for free delivery`
                    }
                  </p>
                </div>

                {/* Customer Information Form */}
                {showCustomerForm && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center text-sm">
                      <User className="w-4 h-4 mr-2" />
                      Customer Information (Optional)
                    </h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={customerInfo.name}
                        onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={customerInfo.phone}
                        onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Email (Optional)"
                        value={customerInfo.email}
                        onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                      />
                      <textarea
                        placeholder="Delivery Address (Optional)"
                        value={customerInfo.address}
                        onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Checkout Buttons */}
                <div className="space-y-3">
                  {/* Main WhatsApp Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-6 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{showCustomerForm ? 'Complete Order on WhatsApp' : 'Checkout via WhatsApp'}</span>
                  </button>

                  {/* Quick Checkout Option */}
                  {!showCustomerForm && (
                    <button
                      onClick={handleQuickCheckout}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors text-sm flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Quick Order (Skip Details)</span>
                    </button>
                  )}

                  {/* Toggle Customer Form */}
                  {!showCustomerForm && (
                    <button
                      onClick={() => setShowCustomerForm(true)}
                      className="w-full text-yellow-600 hover:text-yellow-700 py-2 px-4 rounded-lg font-medium transition-colors text-sm flex items-center justify-center space-x-2 border border-yellow-200 hover:border-yellow-300"
                    >
                      <User className="w-4 h-4" />
                      <span>Add Customer Details</span>
                    </button>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 text-center">
                    <div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                      </div>
                      <span className="text-xs">Secure</span>
                    </div>
                    <div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </div>
                      <span className="text-xs">Returns</span>
                    </div>
                    <div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                      </div>
                      <span className="text-xs">Quality</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Selection Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Change Size</h3>
            <p className="text-gray-600 text-sm mb-4">Select a new size for this product</p>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {cartItems.find(item => item.id === showSizeModal)?.sizes?.map(size => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(showSizeModal, size)}
                  className={`py-2 px-3 rounded border transition-colors text-sm ${
                    cartItems.find(item => item.id === showSizeModal)?.selectedSize === size
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowSizeModal(null)}
              className="w-full py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CartPage);