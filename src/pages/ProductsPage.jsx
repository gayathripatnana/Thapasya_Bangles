// pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';

const ProductsPage = ({ products, onProductClick, onAddToWishlist, onAddToCart, wishlistItems, cartItems, initialCategory = 'All' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  // Update category when initialCategory changes
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);
  
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = () => {
        switch (priceRange) {
          case 'under-500':
            return product.price < 500;
          case '500-1000':
            return product.price >= 500 && product.price <= 1000;
          case '1000-2000':
            return product.price >= 1000 && product.price <= 2000;
          case 'above-2000':
            return product.price > 2000;
          default:
            return true;
        }
      };
      
      return matchesSearch && matchesCategory && matchesPrice();
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt || '2024-01-01') - new Date(a.createdAt || '2024-01-01');
        default:
          return 0;
      }
    });

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceRange('all');
    setSortBy('name');
  };

  const isInWishlist = (productId) => {
    return wishlistItems && wishlistItems.some(item => item.id === productId);
  };

  const isInCart = (productId) => {
    return cartItems && cartItems.some(item => item.id === productId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Mobile-First Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
            Our Product Collection
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover our handcrafted bangles, each piece telling a unique story of elegance and tradition
          </p>
        </div>

        {/* Mobile Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {(selectedCategory !== 'All' || priceRange !== 'all' || sortBy !== 'name') && (
              <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">•</span>
            )}
          </button>
          
          <div className="text-sm text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border">
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                >
                  <option value="all">All Prices</option>
                  <option value="under-500">Under ₹500</option>
                  <option value="500-1000">₹500 - ₹1,000</option>
                  <option value="1000-2000">₹1,000 - ₹2,000</option>
                  <option value="above-2000">Above ₹2,000</option>
                </select>
              </div>
              
              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={clearAllFilters}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors text-sm"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Desktop Filters Section */}
        <div className="hidden lg:block bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search - takes 2 columns on large screens */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            {/* Price Range Filter */}
            <div>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="under-500">Under ₹500</option>
                <option value="500-1000">₹500 - ₹1,000</option>
                <option value="1000-2000">₹1,000 - ₹2,000</option>
                <option value="above-2000">Above ₹2,000</option>
              </select>
            </div>
            
            {/* Sort Filter */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
          
          {/* Filter Results Info */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-gray-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </span>
            <div className="flex items-center space-x-4">
              {(selectedCategory !== 'All' || priceRange !== 'all' || sortBy !== 'name') && (
                <button
                  onClick={clearAllFilters}
                  className="text-pink-600 hover:text-pink-700 font-medium text-sm"
                >
                  Clear Filters
                </button>
              )}
              <div className="flex items-center space-x-2 text-gray-500">
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Package className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6 px-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={clearAllFilters}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isAdmin={false}
                onProductClick={onProductClick}
                onAddToWishlist={onAddToWishlist}
                onAddToCart={onAddToCart}
                isInWishlist={isInWishlist(product.id)}
                isInCart={isInCart(product.id)}
                wishlistItems={wishlistItems}
                cartItems={cartItems}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredProducts.length > 0 && filteredProducts.length >= 12 && (
          <div className="text-center mt-8 sm:mt-12">
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 sm:px-8 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
              Load More Products
            </button>
          </div>
        )}

        {/* Quick Stats */}
        {filteredProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg sm:text-2xl font-bold text-pink-600">{filteredProducts.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-purple-600">
                  ₹{Math.min(...filteredProducts.map(p => p.price)).toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Starting Price</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-indigo-600">
                  {Math.max(...filteredProducts.map(p => p.rating)).toFixed(1)}★
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Top Rated</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {filteredProducts.filter(p => p.inStock !== false).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">In Stock</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;