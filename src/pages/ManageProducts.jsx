// pages/ManageProducts.jsx
import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Plus, Search, Filter, Menu, X, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';

// Lazy load heavy components
const ProductCard = lazy(() => import('../components/product/ProductCard'));
const ProductForm = lazy(() => import('../components/product/ProductForm'));

// Google Drive URL conversion function
const convertGoogleDriveUrl = (url) => {
  if (typeof url !== 'string' || !url) {
    return null;
  }
  
  try {
    let fileId = null;
    
    if (url.includes('uc?export=view&id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    } else if (url.includes('drive.google.com/file/d/')) {
      fileId = url.split('/d/')[1].split('/')[0];
    } else if (url.includes('/open?id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    } else if (url.includes('/view?usp=drive_link') || url.includes('/view?usp=sharing')) {
      fileId = url.split('/d/')[1].split('/view')[0];
    }
    
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}=s400`;
    }
    
    return url;
  } catch (e) {
    return url;
  }
};

const ManageProducts = ({ products, onAdd, onUpdate, onDelete, setCurrentView }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Static categories
  const categoryOptions = ['All', 'Bridal Bangles', 'Glass Bangles', 'Give Aways', 'Traditional', 'Hair Accessories'];

  // Memoized filtered products for performance
    // Memoized filtered products for performance
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesStock = () => {
        switch (stockFilter) {
          case 'In Stock':
            return product.inStock !== false;
          case 'Out of Stock':
            return product.inStock === false;
          default:
            return true;
        }
      };
      
      return matchesSearch && matchesCategory && matchesStock();
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  // Process products with Google Drive URL conversion - ADD THIS HERE
  const processedProducts = useMemo(() => {
    return filteredProducts.map(product => ({
      ...product,
      image: convertGoogleDriveUrl(product.image),
      images: product.images ? product.images.map(img => convertGoogleDriveUrl(img)) : [convertGoogleDriveUrl(product.image)]
    }));
  }, [filteredProducts]);

  // Memoized statistics
  const statistics = useMemo(() => {
    const inStockCount = products.filter(p => p.inStock !== false).length;
    const outOfStockCount = products.length - inStockCount;
    const filteredInStockCount = filteredProducts.filter(p => p.inStock !== false).length;
    const minPrice = filteredProducts.length > 0 ? Math.min(...filteredProducts.map(p => p.price)) : 0;
    const maxPrice = filteredProducts.length > 0 ? Math.max(...filteredProducts.map(p => p.price)) : 0;

    return {
      inStockCount,
      outOfStockCount,
      filteredInStockCount,
      minPrice,
      maxPrice
    };
  }, [products, filteredProducts]);

  // Optimized event handlers
  const handleAddProduct = useCallback(async (productData) => {
    await onAdd(productData);
    setShowForm(false);
  }, [onAdd]);

  const handleUpdateProduct = useCallback(async (productData) => {
    await onUpdate(editingProduct.id, productData);
    setEditingProduct(null);
    setShowForm(false);
  }, [editingProduct, onUpdate]);

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setShowForm(true);
  }, []);

  const handleDeleteProduct = useCallback((productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      onDelete(productId);
    }
  }, [onDelete]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingProduct(null);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('All');
    setStockFilter('All');
  }, []);

  // Debounced search (optional - uncomment if needed)
  // const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDebouncedSearchTerm(searchTerm);
  //   }, 300);
  //   return () => clearTimeout(timer);
  // }, [searchTerm]);

  // Bulk actions
  const handleBulkInStock = useCallback(() => {
    const outOfStockProducts = filteredProducts.filter(p => p.inStock === false);
    outOfStockProducts.forEach(product => {
      onUpdate(product.id, { ...product, inStock: true });
    });
    if (outOfStockProducts.length > 0) {
      alert(`${outOfStockProducts.length} product(s) marked as in stock`);
    }
  }, [filteredProducts, onUpdate]);

  const handleBulkOutOfStock = useCallback(() => {
    const inStockProducts = filteredProducts.filter(p => p.inStock !== false);
    if (window.confirm(`Mark ${inStockProducts.length} product(s) as out of stock?`)) {
      inStockProducts.forEach(product => {
        onUpdate(product.id, { ...product, inStock: false });
      });
      alert(`${inStockProducts.length} product(s) marked as out of stock`);
    }
  }, [filteredProducts, onUpdate]);

  const handleBulkDelete = useCallback(() => {
    if (window.confirm(`Delete ${filteredProducts.length} filtered product(s)? This action cannot be undone.`)) {
      filteredProducts.forEach(product => {
        onDelete(product.id);
      });
    }
  }, [filteredProducts, onDelete]);

  // Loading skeleton for ProductCard
  const ProductCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="flex justify-between">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );

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
                  currentView="admin-products" 
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
            <AdminSidebar currentView="admin-products" setCurrentView={setCurrentView} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Product Management</h1>
                <p className="text-gray-600 text-sm sm:text-base">Add, edit, and manage your product inventory</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-yellow-500 to-gray-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Product Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-4 sm:p-6">
                    <Suspense fallback={
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                      </div>
                    }>
                      <ProductForm
                        product={editingProduct}
                        onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                        onCancel={handleCancelForm}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-800">{products.length}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Total Products</p>
                  </div>
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-green-600">{statistics.inStockCount}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">In Stock</p>
                  </div>
                  <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-red-600">{statistics.outOfStockCount}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Out of Stock</p>
                  </div>
                  <div className="bg-red-100 p-2 sm:p-3 rounded-lg">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {(selectedCategory !== 'All' || stockFilter !== 'All') && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">•</span>
                )}
              </button>
              
              <div className="text-sm text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-6 border lg:hidden">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      {categoryOptions.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="All">All Products</option>
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>

                  <button
                    onClick={clearAllFilters}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Filters */}
            <div className="hidden lg:block bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="All">All Products</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={clearAllFilters}
                    className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <div className="text-gray-400 mb-4">
                  <Package className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">
                  {products.length === 0 ? 'No products yet' : 'No products found'}
                </h3>
                <p className="text-gray-500 mb-6 px-4">
                  {products.length === 0 
                    ? 'Start by adding your first product to the inventory'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <Suspense fallback={
                  <>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))}
                  </>
                }>
                  {processedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                      isAdmin={true}
                    />
                  ))}
                </Suspense>
              </div>
            )}

            {/* Bulk Actions */}
            {filteredProducts.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bulk Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button 
                    onClick={handleBulkInStock}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    Mark All In Stock
                  </button>
                  
                  <button 
                    onClick={handleBulkOutOfStock}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Mark All Out of Stock
                  </button>
                  
                  <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                    Export Products
                  </button>
                  
                  <button 
                    onClick={handleBulkDelete}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Delete Filtered
                  </button>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            {filteredProducts.length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-yellow-50 to-gray-50 rounded-lg p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-yellow-600">{filteredProducts.length}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Products</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-green-600">
                      {statistics.filteredInStockCount}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">In Stock</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-gray-600">
                      ₹{statistics.minPrice.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Lowest Price</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-indigo-600">
                      ₹{statistics.maxPrice.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Highest Price</div>
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

export default React.memo(ManageProducts);