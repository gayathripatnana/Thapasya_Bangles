// components/admin/AdminSidebar.jsx
import React from 'react';
import { BarChart3, Package, Truck, Settings, Users, FileText } from 'lucide-react';

const AdminSidebar = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { 
      id: 'admin-dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      description: 'Overview & Analytics'
    },
    { 
      id: 'admin-products', 
      label: 'Products', 
      icon: Package,
      description: 'Manage Inventory'
    },
    { 
      id: 'admin-orders', 
      label: 'Orders', 
      icon: Truck,
      description: 'Order Management'
    },
    { 
      id: 'admin-customers', 
      label: 'Customers', 
      icon: Users,
      description: 'Customer Database'
    },
    { 
      id: 'admin-reports', 
      label: 'Reports', 
      icon: FileText,
      description: 'Sales & Analytics'
    },
    { 
      id: 'admin-settings', 
      label: 'Settings', 
      icon: Settings,
      description: 'App Configuration'
    }
  ];

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 h-fit sticky top-24">
      {/* Sidebar Header */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Admin Panel</h3>
        <p className="text-sm text-gray-600">Manage your store</p>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${
                    isActive ? 'text-white' : 'text-gray-800'
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-xs truncate ${
                    isActive ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full opacity-80"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="mt-8 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Active Products</span>
            <span className="font-semibold text-gray-800">24</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pending Orders</span>
            <span className="font-semibold text-orange-600">3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Today's Revenue</span>
            <span className="font-semibold text-green-600">₹8,500</span>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Need Help?</h4>
        <p className="text-xs text-blue-600 mb-3">
          Check our admin guide for detailed instructions.
        </p>
        <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors">
          View Guide
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;