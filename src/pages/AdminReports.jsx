// pages/AdminReports.jsx
import React, { useState, useMemo } from 'react';
import { IndianRupee, ShoppingCart, TrendingUp, Users, BarChart3, Menu, X } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminReports = ({ products, orders, customers, setCurrentView }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'Delivered'), [orders]);
  const totalRevenue = useMemo(() => deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0), [deliveredOrders]);
  const averageOrderValue = orders.length > 0
    ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length
    : 0;

  const statusBreakdown = useMemo(() => {
    const counts = { Processing: 0, Shipped: 0, Delivered: 0 };
    orders.forEach(o => {
      if (counts[o.status] !== undefined) counts[o.status] += 1;
    });
    return counts;
  }, [orders]);

  // Revenue for the last 7 days
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = orders.filter(o => o.orderDate && new Date(o.orderDate).toDateString() === date.toDateString());
      days.push({
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      });
    }
    return days;
  }, [orders]);
  const maxDayRevenue = Math.max(1, ...last7Days.map(d => d.revenue));

  // Top selling products by quantity
  const topProducts = useMemo(() => {
    const productSales = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const key = item.productId || item.name;
        if (!productSales[key]) {
          productSales[key] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[key].quantity += item.quantity || 0;
        productSales[key].revenue += (item.price || 0) * (item.quantity || 0);
      });
    });
    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'bg-purple-500',
      subtitle: 'From delivered orders'
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'bg-green-500',
      subtitle: 'All time'
    },
    {
      title: 'Average Order Value',
      value: `₹${Math.round(averageOrderValue).toLocaleString()}`,
      icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'bg-blue-500',
      subtitle: 'Per order'
    },
    {
      title: 'Total Customers',
      value: customers.length,
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'bg-yellow-500',
      subtitle: `${products.length} products listed`
    }
  ];

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
                  currentView="admin-reports"
                  setCurrentView={(view) => {
                    setCurrentView(view);
                    setShowMobileSidebar(false);
                  }}
                  products={products}
                  orders={orders}
                />
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <AdminSidebar currentView="admin-reports" setCurrentView={setCurrentView} products={products} orders={orders} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Sales &amp; Reports</h1>
              <p className="text-gray-600 text-sm sm:text-base">Live performance overview of your store</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {kpiCards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6">
                  <div className={`${card.color} text-white p-2 sm:p-3 rounded-lg w-fit mb-2 sm:mb-4`}>
                    {card.icon}
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">{card.value}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">{card.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 sm:mb-8">
              {/* Revenue - Last 7 Days */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Revenue — Last 7 Days
                </h3>
                <div className="flex items-end justify-between gap-2 h-40">
                  {last7Days.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full max-w-[32px] bg-yellow-500 rounded-t-md transition-all"
                        style={{ height: `${(day.revenue / maxDayRevenue) * 100}%`, minHeight: day.revenue > 0 ? '4px' : '0' }}
                        title={`₹${day.revenue.toLocaleString()}`}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Orders by Status</h3>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(statusBreakdown).map(([status, count]) => {
                    const colorMap = { Processing: 'bg-yellow-500', Shipped: 'bg-blue-500', Delivered: 'bg-green-500' };
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 ${colorMap[status]} rounded`}></div>
                          <span className="text-gray-700 text-sm sm:text-base">{status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm sm:text-base">{count}</span>
                          <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`${colorMap[status]} h-2 rounded-full`}
                              style={{ width: orders.length > 0 ? `${(count / orders.length) * 100}%` : '0%' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Top Selling Products</h3>
              {topProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">No sales data yet — top products will appear once orders come in.</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm sm:text-base">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.quantity} sold</div>
                        </div>
                      </div>
                      <div className="font-semibold text-gray-800 text-sm sm:text-base">₹{product.revenue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
