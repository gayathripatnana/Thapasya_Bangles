// pages/ManageShipping.jsx
import React, { useState, useEffect } from 'react';
import { Save, Menu, X, Truck, Search } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { INDIAN_STATES } from '../utils/indianStates';
import { DEFAULT_SHIPPING_SETTINGS } from '../utils/shippingHelpers';

const ManageShipping = ({ shippingRates = DEFAULT_SHIPPING_SETTINGS, onUpdateShippingRates, setCurrentView }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [defaultRate, setDefaultRate] = useState(shippingRates.defaultRatePerKg);
  const [rateDrafts, setRateDrafts] = useState(shippingRates.rates || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDefaultRate(shippingRates.defaultRatePerKg);
    setRateDrafts(shippingRates.rates || {});
  }, [shippingRates]);

  const handleRateChange = (state, value) => {
    setRateDrafts(prev => ({ ...prev, [state]: value === '' ? '' : parseFloat(value) }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const cleanedRates = {};
    Object.entries(rateDrafts).forEach(([state, rate]) => {
      if (rate !== '' && rate !== null && !isNaN(rate)) {
        cleanedRates[state] = rate;
      }
    });

    const success = await onUpdateShippingRates({
      rates: cleanedRates,
      defaultRatePerKg: defaultRate === '' || isNaN(defaultRate) ? DEFAULT_SHIPPING_SETTINGS.defaultRatePerKg : defaultRate
    });

    setIsSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const filteredStates = INDIAN_STATES.filter(state =>
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const configuredCount = Object.keys(shippingRates.rates || {}).length;

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
                  currentView="admin-shipping"
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
            <AdminSidebar currentView="admin-shipping" setCurrentView={setCurrentView} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Shipping Rates</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Shipping is calculated as total order weight (kg) &times; the rate for the customer's state
              </p>
            </div>

            {/* Default Rate */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="font-semibold text-gray-800 mb-1">Default Rate</h3>
              <p className="text-sm text-gray-500 mb-3">Used for any state below that's left blank</p>
              <div className="flex items-center gap-2 max-w-xs">
                <span className="text-gray-600">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={defaultRate}
                  onChange={(e) => { setDefaultRate(e.target.value === '' ? '' : parseFloat(e.target.value)); setSaved(false); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <span className="text-gray-600 text-sm whitespace-nowrap">per kg</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{configuredCount} of {INDIAN_STATES.length} states have a specific rate set</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                />
              </div>
            </div>

            {/* State Rates */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
                {filteredStates.map(state => (
                  <div key={state} className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
                    <span className="text-sm sm:text-base text-gray-800">{state}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder={String(defaultRate || DEFAULT_SHIPPING_SETTINGS.defaultRatePerKg)}
                        value={rateDrafts[state] ?? ''}
                        onChange={(e) => handleRateChange(state, e.target.value)}
                        className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                      />
                      <span className="text-gray-500 text-xs whitespace-nowrap">/kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 sm:px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                  isSaving
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-gray-600 text-white hover:shadow-lg'
                }`}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              {saved && (
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  <Truck className="w-4 h-4" /> Rates updated
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageShipping;
