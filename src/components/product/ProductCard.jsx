// components/product/ProductCard.jsx
import React from 'react';
import { Star, ShoppingCart, Heart, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const ProductCard = ({ 
  product, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onProductClick, 
  onAddToWishlist, 
  onRemoveFromWishlist,
  onAddToCart,
  isInWishlist = false,
  isInCart = false,
  wishlistItems,
  cartItems,
  navigateToCart // ADD THIS PROP FOR NAVIGATION
}) => {
  const handleCardClick = (e) => {
    // Prevent navigation if clicking on admin buttons or action buttons
    if (e.target.closest('.admin-buttons') || e.target.closest('.action-button')) {
      return;
    }
    
    // Call the onProductClick function if it exists
    if (onProductClick) {
      onProductClick(product.id);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    
    // Check if product is already in wishlist
    const productInWishlist = wishlistItems ? wishlistItems.some(item => item.id === product.id) : isInWishlist;
    
    if (productInWishlist) {
      // If already in wishlist, remove it
      if (onRemoveFromWishlist) {
        onRemoveFromWishlist(product.id);
      }
    } else {
      // If not in wishlist, add it
      if (onAddToWishlist) {
        onAddToWishlist(product);
      }
    }
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    
    // Check if product is already in cart
    const productInCart = cartItems ? cartItems.some(item => item.id === product.id) : isInCart;
    
    if (productInCart) {
      // If already in cart, navigate to cart page
      if (navigateToCart) {
        navigateToCart();
      }
    } else {
      // If not in cart, add it
      if (onAddToCart) {
        onAddToCart(product);
      }
    }
  };

  // Check if product is in wishlist
  const productInWishlist = wishlistItems ? wishlistItems.some(item => item.id === product.id) : isInWishlist;
  
  // Check if product is in cart
  const productInCart = cartItems ? cartItems.some(item => item.id === product.id) : isInCart;

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        !isAdmin ? 'cursor-pointer' : ''
      } ${!product.inStock && !isAdmin ? 'opacity-75' : ''}`}
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <img
              src={product.images && product.images.length > 0 ? product.images[0] : product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          
          {/* Stock Status Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Out of Stock
              </div>
            </div>
          )}
        </div>
        
        {/* Wishlist button for non-admin view */}
        {!isAdmin && (
          <button 
            className={`action-button absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-300 ${
              productInWishlist 
                ? 'bg-red-500 text-white scale-110' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            onClick={handleWishlistClick}
          >
            <Heart className={`w-4 h-4 ${productInWishlist ? 'fill-current text-white' : ''}`} />
          </button>
        )}
        
        {/* Stock Status Badge */}
        {product.inStock !== false && (
          <div className="absolute top-2 left-2">
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              In Stock
            </span>
          </div>
        )}
        
        {/* Admin buttons */}
        {isAdmin && (
          <div className="admin-buttons absolute top-2 right-2 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(product);
              }}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-md"
              aria-label="Edit product"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(product.id);
              }}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
              aria-label="Delete product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-lg mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-xs sm:text-sm">{product.category}</p>
        </div>

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-600 text-xs sm:text-sm ml-2">({product.rating})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg sm:text-xl font-bold text-yellow-600">₹{product.price.toLocaleString()}</span>
            <span className="text-gray-500 text-xs sm:text-sm line-through ml-2">₹{(product.price * 1.2).toLocaleString()}</span>
          </div>
          
          {!isAdmin && product.inStock !== false && (
            <button
              onClick={handleCartClick}
              className={`action-button p-2 rounded-full transition-all duration-300 ${
                productInCart 
                  ? 'bg-green-500 text-white' 
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
              aria-label={productInCart ? 'In cart - View cart' : 'Add to cart'}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>

        {!isAdmin && (
          <>
            {/* Add to Cart Button for Mobile */}
            {product.inStock !== false ? (
              <button
                onClick={handleCartClick}
                className={`action-button w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center text-sm ${
                  productInCart 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {productInCart ? 'View Cart' : 'Add to Cart'}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2 px-4 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed flex items-center justify-center text-sm"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Out of Stock
              </button>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-gray-600 text-xs">Free delivery • Easy returns</p>
            </div>
          </>
        )}

        {/* Admin-specific information */}
        {isAdmin && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Stock Status:</span>
              <span className={`font-medium ${product.inStock !== false ? 'text-green-600' : 'text-red-600'}`}>
                {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            {product.stock && (
              <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                <span>Quantity:</span>
                <span className="font-medium">{product.stock} units</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;