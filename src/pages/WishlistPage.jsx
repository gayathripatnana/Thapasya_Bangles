// pages/WishlistPage.jsx
import React from 'react';
import { Heart, ShoppingCart, ArrowLeft, Star, Trash2, Share2 } from 'lucide-react';

const WishlistPage = ({ 
  wishlistItems, 
  onRemoveFromWishlist, 
  onAddToCart, 
  onProductClick, 
  onBack,
  cartItems = [],
  onClearWishlist
}) => {
  
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const handleShare = () => {
    const wishlistText = wishlistItems.map(item => 
      `${item.name} - ₹${item.price.toLocaleString()}`
    ).join('\n');
    
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist - Thapasya Bangles',
        text: wishlistText,
      });
    } else {
      navigator.clipboard.writeText(wishlistText);
      alert('Wishlist copied to clipboard!');
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Continue Shopping</span>
          </button>

          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <Heart className="w-20 h-20 sm:w-24 sm:h-24 mx-auto" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 px-4">Save items you love by clicking the heart icon</p>
            <button
              onClick={onBack}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Continue Shopping</span>
        </button>

        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center space-x-3">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 fill-current" />
              <span>My Wishlist</span>
            </h1>
            <p className="text-gray-600 mt-2">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved for later</p>
          </div>
          
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 sm:p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            aria-label="Share wishlist"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative">
                <div 
                  className="aspect-square overflow-hidden cursor-pointer"
                  onClick={() => onProductClick && onProductClick(item.id)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                
                <button
                  onClick={() => onRemoveFromWishlist(item.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors group"
                  aria-label="Remove from wishlist"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current group-hover:text-red-500" />
                </button>

                {/* Stock Status */}
                <div className="absolute top-2 left-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.inStock !== false 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <div className="mb-3">
                  <h3 
                    className="font-semibold text-gray-800 text-sm sm:text-lg mb-1 line-clamp-2 cursor-pointer hover:text-yellow-600 transition-colors"
                    onClick={() => onProductClick && onProductClick(item.id)}
                  >
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{item.category}</p>
                </div>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 text-xs sm:text-sm ml-2">({item.rating})</span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg sm:text-xl font-bold text-yellow-600">₹{item.price.toLocaleString()}</span>
                    <span className="text-gray-500 text-xs sm:text-sm line-through">₹{(item.price * 1.2).toLocaleString()}</span>
                    <span className="text-green-600 text-xs sm:text-sm font-medium">17% off</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  {item.inStock !== false ? (
                    <button
                      onClick={() => onAddToCart(item)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm ${
                        isInCart(item.id) ? 'bg-green-500 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{isInCart(item.id) ? 'Added to Cart' : 'Add to Cart'}</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 px-4 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed flex items-center justify-center text-sm"
                    >
                      Out of Stock
                    </button>
                  )}
                  
                  <button
                    onClick={() => onRemoveFromWishlist(item.id)}
                    className="w-full py-2 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-gray-600 text-xs">Free delivery • Easy returns</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 sm:mt-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                const availableItems = wishlistItems.filter(item => item.inStock !== false);
                availableItems.forEach(item => onAddToCart(item));
                if (availableItems.length > 0) {
                  alert(`${availableItems.length} item${availableItems.length !== 1 ? 's' : ''} added to cart!`);
                } else {
                  alert('No items available to add to cart.');
                }
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              Add All Available to Cart
            </button>
            
<button
  onClick={() => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      onClearWishlist && onClearWishlist(); // Use the new prop
    }
  }}
  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm"
>
  Clear Wishlist
</button>
            
            <button
              onClick={handleShare}
              className="border border-yellow-500 text-yellow-500 hover:bg-yellow-50 px-4 py-3 rounded-lg font-medium transition-colors text-sm flex items-center justify-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Wishlist</span>
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-gray-50 rounded-lg p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{wishlistItems.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Items</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-yellow-700">
                {wishlistItems.filter(item => item.inStock !== false).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Available</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-gray-600">
                ₹{Math.min(...wishlistItems.map(item => item.price)).toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Lowest Price</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                ₹{wishlistItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total Value</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;