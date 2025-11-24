// pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Clock, 
  Truck, 
  CheckCircle,
  IndianRupee,
  Eye,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminDashboard = ({ products, orders, setCurrentView }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Calculate statistics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const inStockProducts = products.filter(p => p.inStock !== false).length;
  const outOfStockProducts = totalProducts - inStockProducts;
  
  // Order statistics
  const processingOrders = orders.filter(o => o.status === 'Processing').length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  
  // Revenue calculation
  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, order) => sum + order.amount, 0);
  
  const pendingRevenue = orders
    .filter(o => o.status !== 'Delivered')
    .reduce((sum, order) => sum + order.amount, 0);

  // Recent orders
  const recentOrders = orders
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    .slice(0, 5);

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: <Package className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'bg-blue-500',
      trend: '+12%',
      subtitle: `${inStockProducts} in stock`
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'bg-green-500',
      trend: '+23%',
      subtitle: 'This month'
    },
    {
      title: 'Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'bg-purple-500',
      trend: '+18%',
      subtitle: 'Completed orders'
    },
    {
      title: 'Customers',
      value: orders.length,
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'bg-yellow-500',
      trend: '+8%',
      subtitle: 'Active customers'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Shipped': return <Truck className="w-4 h-4 text-blue-600" />;
      case 'Delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                  currentView="admin-dashboard" 
                  setCurrentView={(view) => {
                    setCurrentView(view);
                    setShowMobileSidebar(false);
                  }} 
                />
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <AdminSidebar currentView="admin-dashboard" setCurrentView={setCurrentView} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
              <p className="text-gray-600 text-sm sm:text-base">Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {statsCards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className={`${card.color} text-white p-2 sm:p-3 rounded-lg`}>
                      {card.icon}
                    </div>
                    <div className="text-green-600 text-xs sm:text-sm font-medium">
                      {card.trend}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">{card.value}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">{card.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Order Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 sm:mb-8">
              {/* Order Status Chart */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Order Status Distribution
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded"></div>
                      <span className="text-gray-700 text-sm sm:text-base">Processing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm sm:text-base">{processingOrders}</span>
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: totalOrders > 0 ? `${(processingOrders/totalOrders)*100}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-700 text-sm sm:text-base">Shipped</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm sm:text-base">{shippedOrders}</span>
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: totalOrders > 0 ? `${(shippedOrders/totalOrders)*100}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-700 text-sm sm:text-base">Delivered</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm sm:text-base">{deliveredOrders}</span>
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: totalOrders > 0 ? `${(deliveredOrders/totalOrders)*100}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setCurrentView('admin-products')}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 sm:p-4 rounded-lg text-left transition-colors flex items-center space-x-3"
                  >
                    <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Manage Products</span>
                  </button>
                  
                  <button 
                    onClick={() => setCurrentView('admin-orders')}
                    className="w-full bg-green-50 hover:bg-green-100 text-green-700 p-3 sm:p-4 rounded-lg text-left transition-colors flex items-center space-x-3"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">View Orders</span>
                  </button>
                  
                  <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 sm:p-4 rounded-lg text-left transition-colors flex items-center space-x-3">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">View Analytics</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Orders</h3>
                <button 
                  onClick={() => setCurrentView('admin-orders')}
                  className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center space-x-1 text-sm sm:text-base"
                >
                  <span>View All</span>
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              
              {/* Mobile View - Card Layout */}
              <div className="block sm:hidden space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">#{order.id.toString().padStart(4, '0')}</div>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Customer: {order.customerName}</div>
                    <div className="text-sm text-gray-600 mb-1">Product: {order.productName}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">{order.orderDate}</div>
                      <div className="font-semibold text-yellow-600">₹{order.amount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Order</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-sm">#{order.id.toString().padStart(4, '0')}</div>
                            <div className="text-xs text-gray-500">{order.orderDate}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-sm">{order.customerName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">{order.productName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-sm">₹{order.amount.toLocaleString()}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {recentOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No recent orders to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;