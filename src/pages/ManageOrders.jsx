// pages/ManageOrders.jsx
import React, { useState } from 'react';
import { Search, Download, Eye, Phone, Mail, Clock, Truck, CheckCircle, Package, Menu, X } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { getOrderDisplayNumber } from '../utils/orderHelpers';
import { getAddressLines } from '../utils/addressHelpers';
import { convertGoogleDriveUrl } from '../utils/helpers';
import { handleImageFallback } from '../utils/imagePlaceholder';
import { downloadOrderInvoice } from '../utils/invoiceHelpers';
import { DEFAULT_STORE_SETTINGS } from '../utils/settingsHelpers';

const getOrderItemsSummary = (order) => {
  const items = order.items || [];
  if (items.length === 0) return '—';
  const firstName = items[0].name || 'Item';
  return items.length > 1 ? `${firstName} +${items.length - 1} more` : firstName;
};

const OrderItemThumb = ({ image, alt, size = 40 }) => {
  const src = image ? convertGoogleDriveUrl(image) : null;
  const style = { width: size, height: size };

  if (!src) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0" style={style}>
        <Package className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="object-cover rounded-lg flex-shrink-0 bg-gray-100"
      style={style}
      loading="lazy"
      onError={(e) => handleImageFallback(e, size, '')}
    />
  );
};

const ManageOrders = ({ orders, onStatusUpdate, setCurrentView, storeSettings = DEFAULT_STORE_SETTINGS }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statuses = ['All', 'Processing', 'Shipped', 'Delivered'];

  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (order.customerName || '').toLowerCase().includes(search) ||
      (order.items || []).some(item => (item.name || '').toLowerCase().includes(search)) ||
      order.id.toLowerCase().includes(search);

    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

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

  const handleStatusUpdate = (orderId, newStatus) => {
    onStatusUpdate(orderId, newStatus);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleWhatsAppContact = (order) => {
    const message = `Hi ${order.customerName}, regarding your order #${getOrderDisplayNumber(order.id)} (${getOrderItemsSummary(order)}). Current status: ${order.status}`;
    const whatsappUrl = `https://wa.me/${(order.customerPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const orderStats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    revenue: orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (o.total || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200"
            >
              <Menu className="w-5 h-5" />
              <span className="font-medium">Menu</span>
            </button>
          </div>

          {/* Mobile Sidebar Overlay */}
          {showMobileSidebar && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Admin Menu</h2>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <AdminSidebar
                  currentView="admin-orders"
                  setCurrentView={(view) => {
                    setCurrentView(view);
                    setShowMobileSidebar(false);
                  }}
                  orders={orders}
                />
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <AdminSidebar currentView="admin-orders" setCurrentView={setCurrentView} orders={orders} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Order Management</h1>
                <p className="text-gray-600 text-sm sm:text-base">Track and manage all customer orders</p>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Export Orders</span>
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-800">{orderStats.total}</h3>
                    <p className="text-gray-600 text-xs sm:text-base">Total Orders</p>
                  </div>
                  <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-yellow-600">{orderStats.processing}</h3>
                    <p className="text-gray-600 text-xs sm:text-base">Processing</p>
                  </div>
                  <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-blue-600">{orderStats.shipped}</h3>
                    <p className="text-gray-600 text-xs sm:text-base">Shipped</p>
                  </div>
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-green-600">{orderStats.delivered}</h3>
                    <p className="text-gray-600 text-xs sm:text-base">Delivered</p>
                  </div>
                  <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders, customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                  />
                </div>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">
                    {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('All');
                    }}
                    className="text-yellow-600 hover:text-yellow-700 font-medium text-sm sm:text-base"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <div className="text-gray-400 mb-4">
                  <Package className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">No orders found</h3>
                <p className="text-gray-500 px-4">
                  {orders.length === 0
                    ? 'Orders placed at checkout will show up here automatically.'
                    : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Card Layout */}
                <div className="block sm:hidden space-y-3">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-800">#{getOrderDisplayNumber(order.id)}</div>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">{order.customerName}</div>
                      <div className="flex items-center space-x-2 mb-1">
                        <OrderItemThumb image={(order.items || [])[0]?.image} alt={getOrderItemsSummary(order)} size={32} />
                        <div className="text-sm text-gray-500">{getOrderItemsSummary(order)}</div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</div>
                        <div className="font-semibold text-gray-800">₹{(order.total || 0).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium border ${getStatusColor(order.status)} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsAppContact(order)}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                          title="Contact via WhatsApp"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View - Table Layout */}
                <div className="hidden sm:block bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Order</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Items</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Amount</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div>
                                <div className="font-semibold text-gray-800">
                                  #{getOrderDisplayNumber(order.id)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(order.orderDate).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <div className="font-medium text-gray-800">{order.customerName}</div>
                                <div className="text-sm text-gray-500">{order.customerPhone}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <OrderItemThumb image={(order.items || [])[0]?.image} alt={getOrderItemsSummary(order)} size={40} />
                                <div className="text-sm text-gray-800">{getOrderItemsSummary(order)}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-semibold text-gray-800">
                                ₹{(order.total || 0).toLocaleString()}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewDetails(order)}
                                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleWhatsAppContact(order)}
                                  className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                                  title="Contact via WhatsApp"
                                >
                                  <Phone className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Order #{getOrderDisplayNumber(selectedOrder.id)}
                      </h3>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Customer Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Name:</span>
                            <span>{selectedOrder.customerName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{selectedOrder.customerPhone}</span>
                          </div>
                          {selectedOrder.customerEmail && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span>{selectedOrder.customerEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Order Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">Subtotal:</span>
                            <span>₹{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Delivery:</span>
                            <span>{selectedOrder.deliveryCharges ? `₹${selectedOrder.deliveryCharges}` : 'FREE'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Total:</span>
                            <span className="font-semibold">₹{(selectedOrder.total || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Status:</span>
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                              {getStatusIcon(selectedOrder.status)}
                              <span>{selectedOrder.status}</span>
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Order Date:</span>
                            <span>{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
                      <div className="space-y-2">
                        {(selectedOrder.items || []).map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg text-sm">
                            <div className="flex items-center space-x-3 min-w-0">
                              <OrderItemThumb image={item.image} alt={item.name} size={48} />
                              <div className="min-w-0">
                                <div className="font-medium text-gray-800 truncate">{item.name}</div>
                                <div className="text-xs text-gray-500">
                                  {item.selectedSize ? `Size: ${item.selectedSize} · ` : ''}Qty: {item.quantity}
                                </div>
                              </div>
                            </div>
                            <div className="font-semibold text-gray-800 flex-shrink-0 ml-2">₹{(item.price * item.quantity).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Delivery Address</h4>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg space-y-0.5">
                        {getAddressLines(selectedOrder.address).map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8">
                      <button
                        onClick={() => downloadOrderInvoice(selectedOrder, storeSettings)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Invoice</span>
                      </button>
                      <button
                        onClick={() => handleWhatsAppContact(selectedOrder)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Contact Customer</span>
                      </button>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Summary */}
            {filteredOrders.length > 0 && (
              <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Revenue Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      ₹{orderStats.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Completed Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                      ₹{orders.filter(o => o.status !== 'Delivered').reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Pending Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      ₹{orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;
