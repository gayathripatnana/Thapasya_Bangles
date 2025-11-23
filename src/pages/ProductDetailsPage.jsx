// pages/ProductDetailsPage.jsx - Product Details with WhatsApp Integration
import React, { useState } from 'react';
import { ArrowLeft, Heart, ShoppingCart, Star, Phone, Share2, Minus, Plus, Truck, Shield, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

const ProductDetailsPage = ({ 
  product, 
  onBack, 
  onAddToCart, 
  onAddToWishlist, 
  isInWishlist = false,
  isInCart = false,
  wishlistItems,
  cartItems,
  relatedProducts = [],
  onProductClick
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Sample products if no product is provided
  const sampleProduct = product || {
    id: 1,
    name: "Royal Kundan Bangles Set",
    category: "Kundan Bangles",
    price: 1299,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop",
    inStock: true,
    description: "Exquisite royal kundan bangles with intricate gold work and traditional craftsmanship. Each piece is carefully crafted using traditional techniques and finest materials, ensuring premium quality and timeless elegance. Perfect for special occasions or daily wear, this bangle combines classic design with modern appeal."
  };

  // Sample related products if none provided
  const sampleRelatedProducts = relatedProducts.length > 0 ? relatedProducts : [
    {
      id: 2,
      name: "Traditional Glass Bangles",
      category: "Glass Bangles",
      price: 299,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
      inStock: true
    },
    {
      id: 3,
      name: "Designer Pearl Bangles",
      category: "Designer",
      price: 899,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop",
      inStock: true
    },
    {
      id: 4,
      name: "Bridal Gold Bangles",
      category: "Bridal",
      price: 2499,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
      inStock: true
    },
    {
      id: 5,
      name: "Antique Silver Bangles",
      category: "Traditional",
      price: 799,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop",
      inStock: true
    }
  ];

  const currentProduct = product || sampleProduct;
  const displayRelatedProducts = relatedProducts.length > 0 ? relatedProducts : sampleRelatedProducts;

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <button
            onClick={onBack}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Mock multiple images (in real app, product would have multiple images)
  const productImages = [
    currentProduct.image,
    currentProduct.image, // You can replace with actual multiple images
    currentProduct.image,
    currentProduct.image
  ];

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(currentProduct);
    }
  };

  const orderProductViaWhatsApp = (product, quantity) => {
    const whatsappNumber = "+919876543210";
    const message = `Hi! I would like to order:
    
Product: ${product.name}
Category: ${product.category}
Price: ₹${product.price.toLocaleString()}
Quantity: ${quantity}
Total: ₹${(product.price * quantity).toLocaleString()}

Please confirm availability and share payment details. Thank you!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleWhatsAppOrder = () => {
    orderProductViaWhatsApp(currentProduct, quantity);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentProduct.name,
        text: `Check out this beautiful bangle: ${currentProduct.name} - ₹${currentProduct.price.toLocaleString()}`,
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
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if product is in wishlist
  const productInWishlist = wishlistItems ? wishlistItems.some(item => item.id === currentProduct.id) : isInWishlist;
  
  // Check if product is in cart
  const productInCart = cartItems ? cartItems.some(item => item.id === currentProduct.id) : isInCart;

  const totalPrice = currentProduct.price * quantity;
  const originalPrice = Math.round(currentProduct.price * 1.2);
  const discountPercentage = Math.round(((originalPrice - currentProduct.price) / originalPrice) * 100);

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
                alt={currentProduct.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Stock Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                  currentProduct.inStock !== false 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {currentProduct.inStock !== false ? (
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
                onClick={() => onAddToWishlist && onAddToWishlist(currentProduct)}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 ${
                  productInWishlist 
                    ? 'bg-pink-500 text-white scale-110' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                aria-label={productInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${productInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-pink-500 ring-2 ring-pink-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${currentProduct.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="text-sm text-gray-500 mb-2">{currentProduct.category}</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">{currentProduct.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(currentProduct.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({currentProduct.rating}/5)</span>
                <span className="text-sm text-gray-500">• 125 reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-pink-600">₹{currentProduct.price.toLocaleString()}</span>
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

            {/* Action Buttons */}
            <div className="space-y-3">
              {currentProduct.inStock !== false ? (
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
                    onClick={handleAddToCart}
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center space-x-2 ${
                      productInCart 
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
                    }`}
                    disabled={productInCart}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{productInCart ? 'Added to Cart' : 'Add to Cart'}</span>
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
                <div className="text-xs text-gray-500">2-5 days</div>
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
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-sm font-medium text-gray-800">Easy Returns</div>
                <div className="text-xs text-gray-500">7 days</div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <div className={`text-gray-600 leading-relaxed ${showFullDescription ? '' : 'line-clamp-3'}`}>
                {currentProduct.description || `Exquisite handcrafted ${currentProduct.name.toLowerCase()} from our ${currentProduct.category.toLowerCase()} collection. Each piece is carefully crafted using traditional techniques and finest materials, ensuring premium quality and timeless elegance. Perfect for special occasions or daily wear, this bangle combines classic design with modern appeal.`}
              </div>
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-pink-600 hover:text-pink-700 font-medium text-sm mt-2"
              >
                {showFullDescription ? 'Show Less' : 'Read More'}
              </button>
            </div>

            {/* Specifications */}
            <div className="border-t border-gray-200 pt-6">
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
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {displayRelatedProducts && displayRelatedProducts.length > 0 && (
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
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-pink-600 font-bold text-sm sm:text-base">
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
                  