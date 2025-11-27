// pages/ProductsPage.jsx
import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Search, Filter, Package, SlidersHorizontal } from 'lucide-react';
import { db, COLLECTIONS, DOCUMENTS } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
// Lazy load ProductCard for better performance
const ProductCard = lazy(() => import('../components/product/ProductCard'));

// Google Drive URL conversion function
const convertGoogleDriveUrl = (url) => {
  if (typeof url !== 'string' || !url) {
    console.error('Invalid URL provided to convertGoogleDriveUrl:', url);
    return null;
  }
  
  try {
    let fileId = null;
    
    // Handle different Google Drive URL formats
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
    console.error('Error converting URL:', url, e);
    return url;
  }
};

const ProductsPage = ({ products, onProductClick, onAddToWishlist, onAddToCart, wishlistItems, onRemoveFromWishlist, cartItems, initialCategory = 'all', setCurrentView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryImages, setCategoryImages] = useState({});

      useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
  // Process products with Google Drive URL conversion
  const processedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      image: convertGoogleDriveUrl(product.image),
      images: product.images ? product.images.map(img => convertGoogleDriveUrl(img)) : [convertGoogleDriveUrl(product.image)]
    }));
  }, [products]);

  // Update category when initialCategory changes
  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      setSelectedCategory(initialCategory);
      setShowFilters(false);
    } else {
      setSelectedCategory('all');
    }
  }, [initialCategory]);

  // Load category images from Firebase
useEffect(() => {
  const loadCategoryImages = async () => {
    try {
      
      const docRef = doc(db, COLLECTIONS.CATEGORY_PICTURES, DOCUMENTS.IMAGES);
      
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const imagesData = data.images || {};
            
            const convertedImages = {};
            Object.keys(imagesData).forEach(category => {
              const url = imagesData[category];
              if (typeof url === 'string' && url) {
                convertedImages[category] = convertGoogleDriveUrl(url);
              }
            });
            
            setCategoryImages(convertedImages);
          }
        },
        (error) => {
          console.error('Error loading category images:', error);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up category images listener:', error);
    }
  };

  loadCategoryImages();
}, []);

  // Memoized filtered products for performance
  const filteredProducts = useMemo(() => {
    return processedProducts
      .filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = () => {
          if (selectedCategory === 'all' || selectedCategory === 'All') return true;
          return product.category === selectedCategory;
        };
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
        
        return matchesSearch && matchesCategory() && matchesPrice();
      })
      .sort((a, b) => {
          const idSort = b.id - a.id;
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
            return idSort;
          default:
            return idSort;
        }
      });
  }, [processedProducts, searchTerm, selectedCategory, priceRange, sortBy]);

  // Memoized statistics
  const statistics = useMemo(() => {
    if (filteredProducts.length === 0) {
      return {
        minPrice: 0,
        maxRating: 0,
        inStockCount: 0
      };
    }
    
    return {
      minPrice: Math.min(...filteredProducts.map(p => p.price)),
      maxRating: Math.max(...filteredProducts.map(p => p.rating)),
      inStockCount: filteredProducts.filter(p => p.inStock !== false).length
    };
  }, [filteredProducts]);

  // Optimized event handlers
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('name');
  }, []);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems && wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  const isInCart = useCallback((productId) => {
    return cartItems && cartItems.some(item => item.id === productId);
  }, [cartItems]);

  // Helper function to get correct category image
const getCategoryHeroImage = (selectedCategory, categoryImages) => {
  // Map display categories to Firebase category IDs
  const categoryMap = {
    'all': 'all',
    'Bridal Bangles': 'bridal',
    'Side Bangles': 'side',
    'Hair Accessories': 'hair_accessories', 
    'Semi Bridal': 'semi_bridal',
    'Return Gifts': 'return_gifts'
  };

  const categoryId = categoryMap[selectedCategory];
  
  // Return bridal image for both 'all' and 'bridal' categories
  if (selectedCategory === 'all' || selectedCategory === 'Bridal Bangles') {
    return categoryImages['bridal'] || categoryImages['all'];
  }
  
  return categoryImages[categoryId];
};

  const handleNavigateToCart = useCallback(() => {
    setCurrentView('cart');
  }, [setCurrentView]);

  // Static category options
  const categoryOptions = [
    { id: 'all', title: 'All' },
    { id: 'Bridal Bangles', title: 'Bridal Bangles' },
    { id: 'Side Bangles', title: 'Side Bangles' },
    { id: 'Hair Accessories', title: 'Hair Accessories' },
    { id: 'Semi Bridal', title: 'Semi Bridal' },
    { id: 'Return Gifts', title: 'Return Gifts' }
  ];

  const categoryImageMap = {
  'all': 'all',
  'Bridal Bangles': 'bridal',
  'Side Bangles': 'side', 
  'Hair Accessories': 'hair_accessories',
  'Semi Bridal': 'semi_bridal',
  'Return Gifts': 'return_gifts'
};

  // ProductCard loading skeleton
  const ProductCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-3 sm:p-4">
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
      
{/* HERO SECTION WITH CORRECT CATEGORY IMAGES */}
<div className="relative w-full overflow-hidden rounded-xl mb-6 sm:mb-8">
  {/* Background Image */}
  <div className="relative w-full h-[200px] sm:h-[300px] lg:h-[350px]">
    <img 
      src={getCategoryHeroImage(selectedCategory, categoryImages) || "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=400&fit=crop"} 
      alt={selectedCategory}
      className="w-full h-full object-cover"
    />
    
    {/* Dark Overlay for better text readability */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
    
    {/* Text Content Overlay */}
    <div className="absolute inset-0 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl space-y-3 sm:space-y-4">
          {/* Category Title */}
          <h1 className="font-serif leading-tight">
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-normal">
              {selectedCategory === 'all' ? 'All Products' : selectedCategory}
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-white text-sm sm:text-base lg:text-lg leading-relaxed">
            Discover our beautiful collection of {selectedCategory === 'all' ? 'handcrafted products' : selectedCategory.toLowerCase()}
          </p>
          
          {/* Product Count */}
          <p className="text-yellow-200 text-sm sm:text-base">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>
    </div>
  </div>
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
            {(selectedCategory !== 'all' || priceRange !== 'all' || sortBy !== 'name') && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">•</span>
            )}
          </button>
          
          <div className="text-sm text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Mobile Filters Panel - ONLY SHOWN WHEN showFilters IS TRUE */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border">
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                >
                  {categoryOptions.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
              </div>
              
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
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
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Suspense fallback={
              <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </>
            }>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdmin={false}
                  onProductClick={onProductClick}
                  onAddToWishlist={onAddToWishlist}
                  onRemoveFromWishlist={onRemoveFromWishlist}
                  onAddToCart={onAddToCart}
                  isInWishlist={isInWishlist(product.id)}
                  isInCart={isInCart(product.id)}
                  wishlistItems={wishlistItems}
                  cartItems={cartItems}
                  navigateToCart={handleNavigateToCart}
                />
              ))}
            </Suspense>
          </div>
        )}

        {/* Load More Button */}
        {filteredProducts.length > 0 && filteredProducts.length >= 12 && (
          <div className="text-center mt-8 sm:mt-12">
            <button className="bg-gradient-to-r from-yellow-500 to-gray-600 text-white px-6 sm:px-8 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
              Load More Products
            </button>
          </div>
        )}

        {/* Quick Stats */}
        {filteredProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-yellow-50 to-gray-50 rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg sm:text-2xl font-bold text-yellow-600">{filteredProducts.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-gray-600">
                  ₹{statistics.minPrice.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Starting Price</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-indigo-600">
                  {statistics.maxRating.toFixed(1)}★
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Top Rated</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {statistics.inStockCount}
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

export default React.memo(ProductsPage);