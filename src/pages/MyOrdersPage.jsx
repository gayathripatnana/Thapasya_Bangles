// pages/MyOrdersPage.jsx
import React, { useMemo } from 'react';
import { ArrowLeft, Package, Clock, Truck, CheckCircle, MapPin, Phone } from 'lucide-react';
import { getOrderDisplayNumber } from '../utils/orderHelpers';
import { getAddressLines } from '../utils/addressHelpers';

const STATUS_STEPS = ['Processing', 'Shipped', 'Delivered'];

const getStatusColor = (status) => {
  switch (status) {
    case 'Processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Processing': return <Clock className="w-4 h-4" />;
    case 'Shipped': return <Truck className="w-4 h-4" />;
    case 'Delivered': return <CheckCircle className="w-4 h-4" />;
    default: return <Package className="w-4 h-4" />;
  }
};

const OrderProgress = ({ status }) => {
  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {STATUS_STEPS.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                index <= currentIndex ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentIndex ? '✓' : index + 1}
            </div>
            <span className={`text-[10px] sm:text-xs mt-1 ${index <= currentIndex ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {index < STATUS_STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-4 ${index < currentIndex ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const MyOrdersPage = ({ orders, currentUserId, onBack, onProductClick }) => {
  const myOrders = useMemo(() => {
    return orders
      .filter(order => order.customerId === currentUserId)
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  }, [orders, currentUserId]);

  if (myOrders.length === 0) {
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
              <Package className="w-20 h-20 sm:w-24 sm:h-24 mx-auto" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8 px-4">Your orders will show up here once you check out</p>
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
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Continue Shopping</span>
        </button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center space-x-3">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            <span>My Orders</span>
          </h1>
          <p className="text-gray-600 mt-2">{myOrders.length} order{myOrders.length !== 1 ? 's' : ''} placed</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {myOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-gray-800">Order #{getOrderDisplayNumber(order.id)}</div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </span>
                </div>

                {order.status !== 'Delivered' && <OrderProgress status={order.status} />}
              </div>

              <div className="p-4 sm:p-6 space-y-3">
                {(order.items || []).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={() => onProductClick && item.productId && onProductClick(item.productId)}
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {item.selectedSize ? `Size: ${item.selectedSize} · ` : ''}Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">₹{(order.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-gray-800">{order.deliveryCharges ? `₹${order.deliveryCharges}` : 'FREE'}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-yellow-600">₹{(order.total || 0).toLocaleString()}</span>
                </div>

                <div className="flex items-start space-x-2 pt-3 border-t border-gray-200 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    {getAddressLines(order.address).map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
