// pages/CartPage.jsx - Complete with address saving and cart clearing
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Truck, Shield, RotateCcw, Star, User, Ruler, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import { getProductsByCategory } from '../utils/helpers';
import { EMPTY_ADDRESS, normalizeAddress, isAddressComplete } from '../utils/addressHelpers';
import { createRazorpayOrder, verifyRazorpayPayment, openRazorpayCheckout } from '../utils/paymentHelpers';
import { handleImageFallback } from '../utils/imagePlaceholder';
import { calculateShippingCost, calculateTotalWeight, DEFAULT_SHIPPING_SETTINGS, MIN_BILLABLE_WEIGHT_KG } from '../utils/shippingHelpers';
import { INDIAN_STATES } from '../utils/indianStates';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

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

const CartPage = ({ cartItems, onUpdateQuantity, onRemoveItem, onBack, onProductClick, onAddToCart, onUpdateCartSize, currentUserId, shippingRates = DEFAULT_SHIPPING_SETTINGS, showAlert }) => {
  
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' -> 'address' -> 'review'
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: { ...EMPTY_ADDRESS }
  });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showSizeModal, setShowSizeModal] = useState(null);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState('');
  const [isSavingData, setIsSavingData] = useState(false);
  const [dataSaved, setDataSaved] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  // Jump to the top on mount, and again whenever the checkout step changes,
  // so the newly-shown step is visible instead of staying scrolled to
  // wherever the triggering button happened to be.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [checkoutStep]);

  // Memoized calculations for performance
  const { subtotal, deliveryCharges, total, totalWeight, billableWeight } = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalWeight = calculateTotalWeight(cartItems);
    const billableWeight = Math.max(totalWeight, MIN_BILLABLE_WEIGHT_KG);
    const deliveryCharges = calculateShippingCost(cartItems, customerInfo.address.state, shippingRates);
    const total = subtotal + deliveryCharges;

    return { subtotal, deliveryCharges, total, totalWeight, billableWeight };
  }, [cartItems, customerInfo.address.state, shippingRates]);

  // Process cart items with optimized images
  const processedCartItems = useMemo(() => {
    return cartItems.map(item => ({
      ...item,
      image: convertGoogleDriveUrl(item.image)
    }));
  }, [cartItems]);

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

  // Load user data and prefill form - UPDATED VERSION
  useEffect(() => {
    const loadUserData = async () => {
      // Only load if we have a valid user ID and user is logged in
      if (currentUserId && currentUserId !== 'undefined' && currentUserId !== 'null') {
        try {
          console.log('Loading user data for:', currentUserId);
          const userDocRef = doc(db, 'users', currentUserId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Loaded user data:', userData);
            
            setCustomerInfo({
              name: userData.name || '',
              phone: userData.phone || '',
              email: userData.email || '',
              address: normalizeAddress(userData.address) // ✅ Load saved address
            });

            // If user has all required data, mark as saved
            if (userData.phone && isAddressComplete(userData.address)) {
              setDataSaved(true);
            }
          } else {
            console.log('User document not found for ID:', currentUserId);
            // Create initial user document if it doesn't exist
            await setDoc(userDocRef, {
              name: '',
              phone: '',
              email: '',
              address: { ...EMPTY_ADDRESS }, // ✅ Initialize empty address
              createdAt: new Date()
            });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        console.log('No valid user ID available:', currentUserId);
      }
    };

    loadUserData();
  }, [currentUserId]);

  const handleCustomerInfoChange = useCallback((field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
    // Reset data saved status when user makes changes
    if (dataSaved) {
      setDataSaved(false);
    }
  }, [dataSaved]);

  const handleAddressChange = useCallback((field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
    if (dataSaved) {
      setDataSaved(false);
    }
  }, [dataSaved]);

  // Save user data to database
  const saveUserData = async () => {
    if (!currentUserId) {
      setError('User not logged in');
      return false;
    }

    // Validate required fields
    if (!customerInfo.phone) {
      setError('Phone number is required');
      return false;
    }

    if (!isAddressComplete(customerInfo.address)) {
      setError('Please complete your delivery address, including a valid 6-digit pincode');
      return false;
    }

    setIsSavingData(true);
    setError('');

    try {
      const userDocRef = doc(db, 'users', currentUserId);
      const userDoc = await getDoc(userDocRef);
      
      const userData = {
        name: customerInfo.name || '',
        phone: customerInfo.phone,
        email: customerInfo.email || '',
        address: customerInfo.address,
        updatedAt: new Date()
      };

      if (userDoc.exists()) {
        await updateDoc(userDocRef, userData);
      } else {
        await setDoc(userDocRef, {
          ...userData,
          createdAt: new Date()
        });
      }

      console.log('User data saved successfully');
      setDataSaved(true);
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      setError('Failed to save data. Please try again.');
      return false;
    } finally {
      setIsSavingData(false);
    }
  };

  // Clear cart after successful checkout
  const clearCartAfterCheckout = async () => {
    if (!currentUserId) return;
    
    try {
      // Remove all items from cart one by one
      for (const item of cartItems) {
        await onRemoveItem(item.id);
      }
      console.log('Cart cleared after checkout');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Step 1 (cart) -> Step 2 (address)
  const handleProceedToCheckout = () => {
    setError('');
    if (dataSaved && isAddressComplete(customerInfo.address)) {
      // Returning customer with a complete saved address - skip straight to review
      setCheckoutStep('review');
    } else {
      setCheckoutStep('address');
    }
  };

  // Step 2 (address) -> Step 3 (review)
  const handleContinueFromAddress = async () => {
    const saved = await saveUserData();
    if (saved) {
      setCheckoutStep('review');
    }
  };

  const handleBackStep = () => {
    setError('');
    if (checkoutStep === 'review') {
      setCheckoutStep('address');
    } else if (checkoutStep === 'address') {
      setCheckoutStep('cart');
    }
  };

  const handlePayOnline = async () => {
    if (!currentUserId || !auth.currentUser) {
      setError('Please log in to pay online');
      return;
    }

    if (!isAddressComplete(customerInfo.address) || !customerInfo.phone) {
      setError('Please save your delivery details first');
      setCheckoutStep('address');
      return;
    }

    setIsProcessingPayment(true);
    setError('');

    try {
      const idToken = await auth.currentUser.getIdToken();

      const orderData = {
        customerId: currentUserId,
        customerName: customerInfo.name || '',
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email || '',
        address: normalizeAddress(customerInfo.address),
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          category: item.category || '',
          image: item.image || '',
          selectedSize: item.selectedSize || null,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const { order_id: orderId, key_id: keyId, amount } = await createRazorpayOrder(orderData, idToken);

      openRazorpayCheckout({
        orderId,
        amount,
        keyId,
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone,
        onSuccess: async (response) => {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            await clearCartAfterCheckout();
            setCheckoutStep('cart');
            showAlert && showAlert('Payment Successful', 'Your payment was received and your order has been placed!', 'success');
          } catch (verifyError) {
            console.error('Error verifying payment:', verifyError);
            setError(`Payment received but confirmation failed. Please contact us with payment ID: ${response.razorpay_payment_id}`);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onFailure: (err) => {
          setError(err.message);
          setIsProcessingPayment(false);
        }
      });
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(err.message || 'Unable to start payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

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

  const STEP_LABELS = [
    { key: 'cart', label: 'Cart' },
    { key: 'address', label: 'Delivery Address' },
    { key: 'review', label: 'Review & Pay' }
  ];
  const stepIndex = STEP_LABELS.findIndex(s => s.key === checkoutStep);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={checkoutStep === 'cart' ? onBack : handleBackStep}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>
            {checkoutStep === 'cart' ? 'Continue Shopping' : checkoutStep === 'address' ? 'Back to Cart' : 'Back to Address'}
          </span>
        </button>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          {STEP_LABELS.map((step, idx) => (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base transition-colors ${
                    idx < stepIndex
                      ? 'bg-green-500 text-white'
                      : idx === stepIndex
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx < stepIndex ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
                </div>
                <span className={`mt-1 text-[10px] sm:text-xs text-center max-w-[70px] sm:max-w-none ${idx === stepIndex ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
              {idx < STEP_LABELS.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mb-4 sm:mb-5 ${idx < stepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {checkoutStep === 'cart' && (
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
                            handleImageFallback(e, 100, 'Image Error');
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
                            disabled={typeof item.stock === 'number' && item.quantity >= item.stock}
                            className="p-2 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        {typeof item.stock === 'number' && item.quantity >= item.stock && (
                          <p className="text-xs text-orange-600">Max available: {item.stock}</p>
                        )}

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
                              handleImageFallback(e, 300, 'Image Error');
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
                Note: If you need to add special instructions, please mention them to us after checkout
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

                {/* Subtotal (shipping is not known yet - calculated after the address step) */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base text-gray-500">
                    <span>Shipping</span>
                    <span>Calculated next step</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Truck className="w-4 h-4" />
                    <span className="font-medium text-sm">Delivery Information</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Shipping is calculated based on order weight and your delivery state - enter your address in the next step to see the final total.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mb-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-6 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Checkout</span>
                </button>

                {dataSaved && isAddressComplete(customerInfo.address) && (
                  <p className="text-xs text-center text-gray-500">
                    Using your saved address in {customerInfo.address.state}
                  </p>
                )}

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
        )}

        {checkoutStep === 'address' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Delivery Address
              </h3>
              <p className="text-sm text-gray-500 mb-4">Tell us where to deliver your order</p>

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
                  placeholder="Phone Number *"
                  value={customerInfo.phone}
                  onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                />
                <div className="pt-2 border-t border-gray-200">
                  <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Delivery Address *</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Door / House No. *"
                      value={customerInfo.address.doorNumber}
                      onChange={(e) => handleAddressChange('doorNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Apartment/Building (optional)"
                      value={customerInfo.address.apartment}
                      onChange={(e) => handleAddressChange('apartment', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Street / Area *"
                    value={customerInfo.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (optional)"
                    value={customerInfo.address.landmark}
                    onChange={(e) => handleAddressChange('landmark', e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Village / Town *"
                      value={customerInfo.address.village}
                      onChange={(e) => handleAddressChange('village', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="District *"
                      value={customerInfo.address.district}
                      onChange={(e) => handleAddressChange('district', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <select
                      value={customerInfo.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm bg-white"
                    >
                      <option value="">Select State *</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Pincode *"
                      value={customerInfo.address.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mt-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinueFromAddress}
                disabled={isSavingData || !customerInfo.phone || !isAddressComplete(customerInfo.address)}
                className={`w-full mt-4 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 text-sm sm:text-base ${
                  isSavingData || !customerInfo.phone || !isAddressComplete(customerInfo.address)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 transform hover:-translate-y-0.5 hover:shadow-lg'
                }`}
              >
                {isSavingData ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Review</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {checkoutStep === 'review' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Delivery Address
                </h3>
                <button
                  onClick={() => setCheckoutStep('address')}
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Edit
                </button>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-sm text-gray-700">
                <p className="font-medium text-gray-800">{customerInfo.name || 'N/A'} &middot; {customerInfo.phone}</p>
                <p className="mt-1">
                  {[
                    customerInfo.address.doorNumber,
                    customerInfo.address.apartment,
                    customerInfo.address.street,
                    customerInfo.address.landmark
                  ].filter(Boolean).join(', ')}
                </p>
                <p>
                  {[
                    customerInfo.address.village,
                    customerInfo.address.district,
                    customerInfo.address.state,
                    customerInfo.address.pincode
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Order Items ({cartItems.length})</h3>
              <div className="divide-y divide-gray-200">
                {processedCartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="py-3 flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                      onError={(e) => handleImageFallback(e, 100, 'Image Error')}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Qty {item.quantity}{item.selectedSize ? ` · Size ${item.selectedSize}` : ''}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Price Breakdown</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>

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

              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mt-4">
                <p className="text-xs text-gray-600">
                  Shipping to {customerInfo.address.state}: {billableWeight.toFixed(2)}kg{totalWeight < MIN_BILLABLE_WEIGHT_KG ? ' (1kg minimum)' : ''} × ₹{deliveryCharges > 0 && billableWeight > 0 ? (deliveryCharges / billableWeight).toFixed(0) : '0'}/kg = ₹{deliveryCharges.toLocaleString()}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mt-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handlePayOnline}
                disabled={isProcessingPayment}
                className={`w-full mt-4 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 text-sm sm:text-base ${
                  isProcessingPayment
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:-translate-y-1 hover:shadow-lg'
                }`}
              >
                {isProcessingPayment ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                <span>{isProcessingPayment ? 'Processing...' : 'Pay Online'}</span>
              </button>

              {/* Trust Badges */}
              <div className="pt-4 mt-4 border-t border-gray-200">
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
        )}
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