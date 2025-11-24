// pages/CartPage.jsx - Updated with WhatsApp Checkout Integration
import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Tag, Truck, Shield, RotateCcw, Star, Phone, User, Mail, MapPin } from 'lucide-react';
import { proceedToWhatsAppCheckout } from '../utils/whatsappCheckout';

const CartPage = ({ cartItems, onUpdateQuantity, onRemoveItem, onBack }) => {
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

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharges = subtotal > 1500 ? 0 : 99;
  const total = subtotal - discount + deliveryCharges;

  const promoCodes = {
    'SAVE10': { type: 'percentage', value: 0.1, description: '10% off' },
    'WELCOME20': { type: 'percentage', value: 0.2, description: '20% off' },
    'FIRST50': { type: 'fixed', value: 50, description: '₹50 off' },
    'FREE100': { type: 'fixed', value: 100, description: '₹100 off' }
  };

  const handleApplyPromo = () => {
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
  };

  const handleRemovePromo = () => {
    setDiscount(0);
    setAppliedPromoCode('');
  };

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckout = () => {
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
  };

  const handleQuickCheckout = () => {
    // Direct checkout without customer form
    const orderSummary = {
      subtotal,
      discount,
      deliveryCharges,
      total
    };

    proceedToWhatsAppCheckout(cartItems, orderSummary, null);
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.category}</p>
                        
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
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md sticky top-24">
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
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
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
                          {appliedPromoCode} applied ({promoCodes[appliedPromoCode]?.description})
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-yellow-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm">Delivery Information</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {deliveryCharges === 0 
                      ? 'Free delivery on orders above ₹1,500' 
                      : `Add ₹${(1500 - subtotal).toLocaleString()} more for free delivery`
                    }
                  </p>
                </div>

                {/* Customer Information Form */}
                {showCustomerForm && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
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
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-6 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center space-x-2"
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
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Shield className="w-4 h-4 text-yellow-600" />
                      </div>
                      <span>Secure Payment</span>
                    </div>
                    <div>
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <RotateCcw className="w-4 h-4 text-gray-600" />
                      </div>
                      <span>Easy Returns</span>
                    </div>
                    <div>
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Star className="w-4 h-4 text-yellow-600" />
                      </div>
                      <span>Quality Assured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Summary for Mobile */}
            <div className="mt-6 bg-gradient-to-r from-yellow-50 to-gray-50 rounded-lg p-4 lg:hidden">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-yellow-600">{cartItems.length}</div>
                  <div className="text-xs text-gray-600">Items</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-700">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Quantity</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">You might also like</h3>
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Recommended products will appear here based on your cart items</p>
          </div>
        </div>

        {/* Order Notes */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Notes (Optional)</h3>
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
    </div>
  );
};

export default CartPage;