// pages/ManageCustomers.jsx
import React, { useState, useMemo } from 'react';
import { Search, Users, UserPlus, Repeat, Phone, Mail, MapPin, Menu, X, Eye, Clock, Truck, CheckCircle, Package } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { getOrderDisplayNumber } from '../utils/orderHelpers';
import { formatAddress, getAddressLines } from '../utils/addressHelpers';

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
    case 'Processing': return <Clock className="w-3 h-3" />;
    case 'Shipped': return <Truck className="w-3 h-3" />;
    case 'Delivered': return <CheckCircle className="w-3 h-3" />;
    default: return <Package className="w-3 h-3" />;
  }
};

const ManageCustomers = ({ customers, orders, setCurrentView }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Enrich each customer with order stats derived from the already-loaded orders list
  const enrichedCustomers = useMemo(() => {
    return customers.map(customer => {
      const customerOrders = orders.filter(o => o.customerId === customer.id);
      const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const lastOrder = [...customerOrders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0];

      return {
        ...customer,
        orderCount: customerOrders.length,
        totalSpent,
        lastOrderDate: lastOrder ? lastOrder.orderDate : null,
        orders: customerOrders
      };
    });
  }, [customers, orders]);

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return enrichedCustomers.filter(customer =>
      (customer.name || '').toLowerCase().includes(search) ||
      (customer.phone || '').toLowerCase().includes(search) ||
      (customer.email || '').toLowerCase().includes(search)
    );
  }, [enrichedCustomers, searchTerm]);

  const stats = useMemo(() => {
    const now = new Date();
    const newThisMonth = customers.filter(c => {
      if (!c.createdAt) return false;
      const created = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    const repeatCustomers = enrichedCustomers.filter(c => c.orderCount > 1).length;

    return {
      total: customers.length,
      newThisMonth,
      repeatCustomers
    };
  }, [customers, enrichedCustomers]);

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
                  currentView="admin-customers"
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
            <AdminSidebar currentView="admin-customers" setCurrentView={setCurrentView} orders={orders} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Customers</h1>
              <p className="text-gray-600 text-sm sm:text-base">Customers who have saved delivery details at checkout</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stats.total}</h3>
                    <p className="text-gray-600 text-sm">Total Customers</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-green-600">{stats.newThisMonth}</h3>
                    <p className="text-gray-600 text-sm">New This Month</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <UserPlus className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-purple-600">{stats.repeatCustomers}</h3>
                    <p className="text-gray-600 text-sm">Repeat Customers</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Repeat className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Customers List */}
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <div className="text-gray-400 mb-4">
                  <Users className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">No customers found</h3>
                <p className="text-gray-500 px-4">
                  {customers.length === 0
                    ? 'Customers will appear here once they save delivery details at checkout.'
                    : 'Try adjusting your search'}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Card Layout */}
                <div className="block sm:hidden space-y-3">
                  {filteredCustomers.map(customer => (
                    <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-800">{customer.name || 'Unnamed Customer'}</div>
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{customer.phone}</div>
                      <div className="text-sm text-gray-500 mb-2 truncate">{customer.email}</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{customer.orderCount} order{customer.orderCount !== 1 ? 's' : ''}</span>
                        <span className="font-semibold text-gray-800">₹{customer.totalSpent.toLocaleString()}</span>
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
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Contact</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Orders</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Total Spent</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Last Order</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map(customer => (
                          <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="font-medium text-gray-800">{customer.name || 'Unnamed Customer'}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">{formatAddress(customer.address).replace(/\n/g, ', ')}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm text-gray-800">{customer.phone}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm text-gray-800">{customer.orderCount}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-semibold text-gray-800">₹{customer.totalSpent.toLocaleString()}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm text-gray-500">
                                {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : '—'}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => setSelectedCustomer(customer)}
                                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Customer Details Modal */}
            {selectedCustomer && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                        {selectedCustomer.name || 'Unnamed Customer'}
                      </h3>
                      <button
                        onClick={() => setSelectedCustomer(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm mb-6">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedCustomer.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedCustomer.email || 'Not provided'}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div>
                          {getAddressLines(selectedCustomer.address).length > 0 ? (
                            getAddressLines(selectedCustomer.address).map((line, index) => (
                              <div key={index}>{line}</div>
                            ))
                          ) : (
                            <span>Not provided</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-gray-800">{selectedCustomer.orderCount}</div>
                        <div className="text-xs text-gray-600">Total Orders</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600">₹{selectedCustomer.totalSpent.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Total Spent</div>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-3">Order History</h4>
                    {selectedCustomer.orders.length === 0 ? (
                      <p className="text-sm text-gray-500">No orders yet</p>
                    ) : (
                      <div className="space-y-2">
                        {[...selectedCustomer.orders]
                          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                          .map(order => (
                            <div key={order.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg text-sm">
                              <div>
                                <div className="font-medium text-gray-800">#{getOrderDisplayNumber(order.id)}</div>
                                <div className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</div>
                              </div>
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span>{order.status}</span>
                              </span>
                              <div className="font-semibold text-gray-800">₹{(order.total || 0).toLocaleString()}</div>
                            </div>
                          ))}
                      </div>
                    )}
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

export default ManageCustomers;
