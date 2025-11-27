// pages/ProductDetailsPage.jsx - Updated with Google Drive URL conversion
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Package, Heart, ShoppingCart, Star, Phone, Share2, Minus, Plus, Truck, Shield, RotateCcw, CheckCircle, AlertCircle, Ruler } from 'lucide-react';
import { getProductsByCategory } from '../utils/helpers';

// Add the Google Drive URL conversion function
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
      return `https://lh3.googleusercontent.com/d/${fileId}=s800`;
    }
    
    return url;
  } catch (e) {
    console.error('Error converting URL:', url, e);
    return url;
  }
};

const ProductDetailsPage = ({ 
  product, 
  onBack, 
  onAddToCart, 
  onAddToWishlist, 
  onRemoveFromWishlist,
  isInWishlist = false,
  isInCart = false,
  wishlistItems,
  cartItems,
  relatedProducts = [],
  onProductClick,
  navigateToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [dynamicRelatedProducts, setDynamicRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Convert product images to use direct Google Drive URLs
  const processedProduct = useMemo(() => {
    if (!product) return null;

    // Process main image and images array
    const processedImages = (product.images && product.images.length > 0 
      ? product.images 
      : [product.image]
    ).map(img => convertGoogleDriveUrl(img));

    return {
      ...product,
      image: convertGoogleDriveUrl(product.image),
      images: processedImages
    };
  }, [product]);

  // Load related products based on category
  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (processedProduct && processedProduct.category) {
        const related = await getProductsByCategory(processedProduct.category);
        // Filter out current product and limit to 4
        const filteredRelated = related
          .filter(p => p.id !== processedProduct.id)
          .slice(0, 4)
          .map(p => ({
            ...p,
            image: convertGoogleDriveUrl(p.image)
          }));
        setDynamicRelatedProducts(filteredRelated);
      }
    };

    if (relatedProducts && relatedProducts.length > 0) {
      // Process related products images too
      const processedRelated = relatedProducts.map(p => ({
        ...p,
        image: convertGoogleDriveUrl(p.image)
      }));
      setDynamicRelatedProducts(processedRelated);
    } else if (processedProduct) {
      loadRelatedProducts();
    }
  }, [processedProduct, relatedProducts]);

  // Pre-select size if product is in cart
  useEffect(() => {
    if (processedProduct && cartItems) {
      const cartItem = cartItems.find(item => item.id === processedProduct.id);
      if (cartItem && cartItem.selectedSize) {
        setSelectedSize(cartItem.selectedSize);
      }
    }
  }, [processedProduct, cartItems]);

  // Reactive product in cart check that updates when selectedSize changes
  const productInCart = useMemo(() => {
    if (!cartItems || !processedProduct) return isInCart;
    return cartItems.some(item => 
      item.id === processedProduct.id && item.selectedSize === selectedSize
    );
  }, [cartItems, processedProduct, selectedSize, isInCart]);

  if (!processedProduct) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <button
            onClick={onBack}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Use multiple images if available, otherwise use single image
  const productImages = processedProduct.images;

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Check if size is required but not selected
    if (processedProduct.sizes && processedProduct.sizes.length > 0 && !selectedSize) {
      alert('Please select a size before adding to cart');
      return;
    }

    // Always add as new item (different sizes = different items)
    for (let i = 0; i < quantity; i++) {
      onAddToCart({
        ...processedProduct,
        selectedSize: selectedSize
      });
    }
  };

  const handleWishlistClick = () => {
    // Check if size is required but not selected
    if (processedProduct.sizes && processedProduct.sizes.length > 0 && !selectedSize) {
      alert('Please select a size before adding to wishlist');
      return;
    }

    const productInWishlist = wishlistItems ? wishlistItems.some(item => item.id === processedProduct.id) : isInWishlist;
    
    if (productInWishlist) {
      onRemoveFromWishlist && onRemoveFromWishlist(processedProduct.id);
    } else {
      // PASS THE SELECTED SIZE TO THE PRODUCT
      onAddToWishlist && onAddToWishlist({
        ...processedProduct,
        selectedSize: selectedSize
      });
    }
  };

  const handleCartClick = () => {
    // Check if size is required but not selected
    if (processedProduct.sizes && processedProduct.sizes.length > 0 && !selectedSize) {
      alert('Please select a size before adding to cart');
      return;
    }

    if (productInCart) {
      navigateToCart && navigateToCart();
    } else {
      // PASS THE SELECTED SIZE TO THE PRODUCT
      handleAddToCart();
    }
  };

const orderProductViaWhatsApp = (product, quantity) => {
  const whatsappNumber = "+918074086883";
  const message = `🛍️ *Hi! I'm interested in this PRODUCT* 🛍️

*${product.name}*
📂 Category: ${product.category}
${selectedSize ? `📏 Size: ${selectedSize}` : ''}
💰 Price: ₹${product.price.toLocaleString()}
📊 Quantity: ${quantity}
💵 Total: ₹${(product.price * quantity).toLocaleString()}
⭐ Rating: ${product.rating}/5
🔗 Product Image: ${product.image || 'Image not available'}

📋 Description:
${product.description || 'Beautiful handcrafted bangle with traditional elegance.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 *Please tell me about:*
✅ Is this product available?
✅ Delivery timeline to my location  
✅ Payment options available
✅ Any bulk discounts for this quantity

📍 I will share my delivery address once you confirm availability.

Looking forward to your response! 🙏`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};
  const handleWhatsAppOrder = () => {
    orderProductViaWhatsApp(processedProduct, quantity);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: processedProduct.name,
        text: `Check out this beautiful bangle: ${processedProduct.name} - ₹${processedProduct.price.toLocaleString()}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const handleRelatedProductClick = (productId) => {
  if (onProductClick) {
    onProductClick(productId);
  } else {
    // Fallback: reload the page with the new product ID in URL or other navigation method
    console.log('Navigate to product:', productId);
    // You might need to implement navigation logic here
    // For example: window.location.href = `/product/${productId}`;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

  // Check if product is in wishlist
  const productInWishlist = wishlistItems ? wishlistItems.some(item => item.id === processedProduct.id) : isInWishlist;

  const totalPrice = processedProduct.price * quantity;
  const originalPrice = Math.round(processedProduct.price * 1.2);
  const discountPercentage = Math.round(((originalPrice - processedProduct.price) / originalPrice) * 100);

  const displayRelatedProducts = dynamicRelatedProducts.length > 0 ? dynamicRelatedProducts : [];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            aria-label="Share product"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={productImages[selectedImage]}
                alt={processedProduct.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  console.error('Failed to load image:', productImages[selectedImage]);
                  e.target.src = 'https://via.placeholder.com/600x600/f3f4f6/9ca3af?text=Image+Not+Found';
                }}
              />
              
              {/* Stock Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                  processedProduct.inStock !== false 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {processedProduct.inStock !== false ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>In Stock</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Out of Stock</span>
                    </>
                  )}
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistClick}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 ${
                  productInWishlist 
                    ? 'bg-red-500 text-white scale-110' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                aria-label={productInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${productInWishlist ? 'fill-current text-white' : ''}`} />
              </button>

              {/* Size Indicator */}
              {selectedSize && (
                <div className="absolute bottom-4 left-4">
                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                    <Ruler className="w-3 h-3" />
                    <span>Size: {selectedSize}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-yellow-500 ring-2 ring-yellow-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${processedProduct.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        console.error('Failed to load thumbnail:', image);
                        e.target.src = 'https://via.placeholder.com/150x150/f3f4f6/9ca3af?text=Image+Error';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="text-sm text-gray-500 mb-2">{processedProduct.category}</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">{processedProduct.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(processedProduct.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({processedProduct.rating}/5)</span>
                <span className="text-sm text-gray-500">• 125 reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-yellow-600">₹{processedProduct.price.toLocaleString()}</span>
                <span className="text-xl text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  {discountPercentage}% OFF
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-3 border-x border-gray-300 min-w-[60px] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    className="p-3 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Total: ₹{totalPrice.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Size Selection */}
            {processedProduct.sizes && processedProduct.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Size *
                </label>
                {/* Add this informational text */}
                <p className="text-xs text-gray-500 mb-2">
                  Note: Different sizes will be added as separate items in your cart
                </p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {processedProduct.sizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700 font-semibold'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                
                {/* Size Chart */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setShowSizeChart(!showSizeChart)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 w-full text-left"
                  >
                    <Ruler className="w-4 h-4" />
                    <span className="text-sm font-medium">Size Guide</span>
                    <span className="ml-auto transform transition-transform">
                      {showSizeChart ? '▲' : '▼'}
                    </span>
                  </button>
                  
                  {showSizeChart && processedProduct.sizeChart && (
                    <div className="mt-3 text-sm text-gray-600 space-y-2">
                      {Object.entries(processedProduct.sizeChart).map(([size, description]) => (
                        <div key={size} className="flex justify-between items-start py-1 border-b border-gray-200 last:border-b-0">
                          <span className="font-medium text-yellow-600 min-w-[60px]">{size}:</span>
                          <span className="text-right flex-1 ml-4">{description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {processedProduct.inStock !== false ? (
                <>
                  {/* WhatsApp Order Button */}
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Order via WhatsApp</span>
                  </button>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleCartClick}
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center space-x-2 ${
                      productInCart 
                        ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-purple-700'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{productInCart ? 'View Cart' : 'Add to Cart'}</span>
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-4 px-6 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>Out of Stock</span>
                </button>
              )}
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-gray-800">Free Delivery</div>
                <div className="text-xs text-gray-500">7-10 days</div>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-sm font-medium text-gray-800">Authentic</div>
                <div className="text-xs text-gray-500">100% Genuine</div>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-sm font-medium text-gray-800">Best Packing</div>
                <div className="text-xs text-gray-500">High Quality</div>
              </div>

            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <div className={`text-gray-600 leading-relaxed ${showFullDescription ? '' : 'line-clamp-3'}`}>
                {processedProduct.description || `Exquisite handcrafted ${processedProduct.name.toLowerCase()} from our ${processedProduct.category.toLowerCase()} collection. Each piece is carefully crafted using traditional techniques and finest materials, ensuring premium quality and timeless elegance. Perfect for special occasions or daily wear, this bangle combines classic design with modern appeal.`}
              </div>
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-yellow-600 hover:text-yellow-700 font-medium text-sm mt-2"
              >
                {showFullDescription ? 'Show Less' : 'Read More'}
              </button>
            </div>

            {/* Specifications */}
            {/* <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Material:</span>
                  <span className="ml-2 font-medium">Brass/Copper</span>
                </div>
                <div>
                  <span className="text-gray-500">Finish:</span>
                  <span className="ml-2 font-medium">Gold Plated</span>
                </div>
                <div>
                  <span className="text-gray-500">Weight:</span>
                  <span className="ml-2 font-medium">25-30g</span>
                </div>
                <div>
                  <span className="text-gray-500">Images:</span>
                  <span className="ml-2 font-medium">{productImages.length}</span>
                </div>
                {processedProduct.sizes && processedProduct.sizes.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Available Sizes:</span>
                    <span className="ml-2 font-medium">{processedProduct.sizes.join(', ')}</span>
                  </div>
                )}
              </div>
            </div> */}
          </div>
        </div>

        {/* Related Products */}
        {displayRelatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {displayRelatedProducts.slice(0, 4).map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleRelatedProductClick(relatedProduct.id)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        console.error('Failed to load related product image:', relatedProduct.image);
                        e.target.src = 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=Image+Error';
                      }}
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-600 font-bold text-sm sm:text-base">
                        ₹{relatedProduct.price.toLocaleString()}
                      </span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                        <span className="text-xs sm:text-sm text-gray-600 ml-1">
                          {relatedProduct.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;