// components/common/Header.jsx
import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Home, 
  Grid, 
  BarChart3, 
  User, 
  LogOut, 
  ShoppingCart, 
  Heart, 
  Menu, 
  X 
} from 'lucide-react';
import { 
  convertGoogleDriveUrl, 
  subscribeToCategoriesUpdates,
  fetchCategoryImages 
} from '../../utils/helpers';
const Header = ({ 
  currentView, 
  setCurrentView, 
  isAdmin, 
  isLoggedIn,
  user,
  handleLogout, 
  cartItemsCount = 0, 
  wishlistItemsCount = 0 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const NavButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    children, 
    badge = null,
    className = "" 
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 relative ${
        isActive 
          ? 'bg-yellow-500/20 text-yellow-400 shadow-md'
          : 'hover:bg-yellow-500/10 text-gray-300 hover:text-yellow-400'
      } ${className}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="font-medium">{children}</span>
      {badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-yellow-500 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold min-w-[20px]">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 flex-shrink-0 cursor-pointer"
            onClick={() => handleNavigation('home')}
          >
            {/* Replace ShoppingBag with your logo */}
            <img 
                src={convertGoogleDriveUrl("https://drive.google.com/file/d/11Q3MrC8W2U9L5q97g3I-s5IfTfGmVC3u/view?usp=sharing")}
                alt="Thapasya Bangles Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-yellow-500"
              />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold leading-tight text-yellow-500">
                Thapasya Bangles
              </h1>
              <p className="text-xs sm:text-sm opacity-90 hidden xs:block">
                Handcrafted with Love
              </p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavButton
              onClick={() => handleNavigation('home')}
              isActive={currentView === 'home'}
              icon={Home}
            >
              Home
            </NavButton>
            
            <NavButton
              onClick={() => handleNavigation('products')}
              isActive={currentView === 'products' || currentView === 'product-details'}
              icon={Grid}
            >
              Products
            </NavButton>

            {/* Cart and Wishlist - only show for non-admin users */}
            {!isAdmin && (
              <>
                <NavButton
                  onClick={() => handleNavigation('wishlist')}
                  isActive={currentView === 'wishlist'}
                  icon={Heart}
                  badge={wishlistItemsCount > 0 ? wishlistItemsCount : null}
                >
                  Wishlist
                </NavButton>

                <NavButton
                  onClick={() => handleNavigation('cart')}
                  isActive={currentView === 'cart'}
                  icon={ShoppingCart}
                  badge={cartItemsCount > 0 ? cartItemsCount : null}
                >
                  Cart
                </NavButton>
              </>
            )}
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 ml-2">
                {isAdmin && (
                  <NavButton
                    onClick={() => handleNavigation('admin-dashboard')}
                    isActive={currentView.includes('admin')}
                    icon={BarChart3}
                  >
                    Dashboard
                  </NavButton>
                )}
                
                {/* User Profile Circle with Name */}
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium hidden xl:block">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <NavButton
                onClick={() => handleNavigation('login')}
                isActive={currentView === 'login'}
                icon={User}
                className="bg-yellow-500/20 hover:bg-yellow-500/30"
              >
                Login
              </NavButton>
            )}
          </nav>

          {/* Mobile Quick Actions + Hamburger */}
          <div className="flex items-center space-x-2 lg:hidden">
            {/* Mobile Cart & Wishlist Icons - only show for non-admin users */}
            {!isAdmin && (
              <>
                <button
                  onClick={() => handleNavigation('wishlist')}
                  className={`p-2 rounded-lg transition-colors relative ${
                    currentView === 'wishlist' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                      {wishlistItemsCount > 9 ? '9+' : wishlistItemsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNavigation('cart')}
                  className={`p-2 rounded-lg transition-colors relative ${
                    currentView === 'cart' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                      {cartItemsCount > 9 ? '9+' : cartItemsCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <div className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-yellow-900 to-gray-900
          transform transition-transform duration-300 ease-in-out z-50 lg:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
\            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <div className="flex items-center space-x-2">
                {/* Replace ShoppingBag with your logo in mobile menu too */}
                <img 
                  src={convertGoogleDriveUrl("https://drive.google.com/file/d/11Q3MrC8W2U9L5q97g3I-s5IfTfGmVC3u/view?usp=sharing")} 
                  alt="Thapasya Bangles Logo" 
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-lg font-bold">Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Section - Show when logged in */}
            {isLoggedIn && (
              <div className="p-4 border-b border-white/20">
                <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-xs text-white/80 truncate">
                      {user?.email || ''}
                    </div>
                    {isAdmin && (
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 bg-yellow-500 text-gray-900 text-xs font-semibold rounded">
                          Admin
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Items */}
            <nav className="flex flex-col p-4 space-y-2 flex-1 overflow-y-auto">
              <NavButton
                onClick={() => handleNavigation('home')}
                isActive={currentView === 'home'}
                icon={Home}
                className="w-full justify-start py-3"
              >
                Home
              </NavButton>
              
              <NavButton
                onClick={() => handleNavigation('products')}
                isActive={currentView === 'products' || currentView === 'product-details'}
                icon={Grid}
                className="w-full justify-start py-3"
              >
                Products
              </NavButton>

              {/* Admin or User specific menu items */}
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <NavButton
                      onClick={() => handleNavigation('admin-dashboard')}
                      isActive={currentView.includes('admin')}
                      icon={BarChart3}
                      className="w-full justify-start py-3"
                    >
                      Admin Dashboard
                    </NavButton>
                  )}
                  
                  {!isAdmin && (
                    <>
                      <NavButton
                        onClick={() => handleNavigation('wishlist')}
                        isActive={currentView === 'wishlist'}
                        icon={Heart}
                        badge={wishlistItemsCount > 0 ? wishlistItemsCount : null}
                        className="w-full justify-start py-3"
                      >
                        Wishlist
                      </NavButton>

                      <NavButton
                        onClick={() => handleNavigation('cart')}
                        isActive={currentView === 'cart'}
                        icon={ShoppingCart}
                        badge={cartItemsCount > 0 ? cartItemsCount : null}
                        className="w-full justify-start py-3"
                      >
                        Shopping Cart
                      </NavButton>
                    </>
                  )}
                  
                  <div className="pt-4 mt-4 border-t border-white/20">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-3 py-3 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2 text-red-200 hover:text-red-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <NavButton
                    onClick={() => handleNavigation('wishlist')}
                    isActive={currentView === 'wishlist'}
                    icon={Heart}
                    badge={wishlistItemsCount > 0 ? wishlistItemsCount : null}
                    className="w-full justify-start py-3"
                  >
                    Wishlist
                  </NavButton>

                  <NavButton
                    onClick={() => handleNavigation('cart')}
                    isActive={currentView === 'cart'}
                    icon={ShoppingCart}
                    badge={cartItemsCount > 0 ? cartItemsCount : null}
                    className="w-full justify-start py-3"
                  >
                    Shopping Cart
                  </NavButton>

                  <div className="pt-4 mt-4 border-t border-white/20">
                    <NavButton
                      onClick={() => handleNavigation('login')}
                      isActive={currentView === 'login'}
                      icon={User}
                      className="w-full justify-start py-3 bg-white/10"
                    >
                      Login
                    </NavButton>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;