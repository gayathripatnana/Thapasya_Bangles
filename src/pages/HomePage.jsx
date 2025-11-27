// pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Star, Heart, Award, Truck, ShoppingBag, Phone, MapPin, Shield, ArrowRight, ChevronLeft, ChevronRight, Ruler } from 'lucide-react';
import { db, COLLECTIONS, DOCUMENTS } from '../firebase/config';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { 
  convertGoogleDriveUrl, 
  subscribeToCategoriesUpdates,
  fetchCategoryImages 
} from '../utils/helpers';
import CustomAlert from '../components/common/CustomAlert';
const HomePage = ({ setCurrentView, onProductClick, onAddToWishlist, onRemoveFromWishlist, onAddToCart, wishlistItems, cartItems }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentFeatured, setCurrentFeatured] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [customerReviews, setCustomerReviews] = useState([]);
  const [alertState, setAlertState] = useState({
  isOpen: false,
  title: '',
  message: '',
  type: 'info'
});

  // Default fallback images
  const defaultHeroImages = [
    "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop"
  ];

  // Update feature icons and gradients:
  const features = [
    {
      icon: <Award className="w-6 h-6 text-yellow-500" />,
      title: "Premium Quality",
      description: "Handcrafted with finest materials",
      gradient: "from-yellow-100 to-yellow-200"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: "Made with Love",
      description: "Crafted with passion and care",
      gradient: "from-gray-100 to-gray-200"
    },
    {
      icon: <Truck className="w-6 h-6 text-yellow-600" />,
      title: "Fast Delivery",
      description: "2-5 days across India",
      gradient: "from-yellow-50 to-yellow-100"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-500" />,
      title: "100% Authentic",
      description: "Quality guarantee always",
      gradient: "from-gray-50 to-gray-100"
    }
  ];

  const processSteps = [
    {
      step: "1",
      title: "Browse",
      description: "Explore our collections",
      icon: <ShoppingBag className="w-5 h-5" />
    },
    {
      step: "2",
      title: "WhatsApp",
      description: "Send us your selection",
      icon: <Phone className="w-5 h-5" />
    },
    {
      step: "3",
      title: "Delivery",
      description: "Receive in 2-5 days",
      icon: <Truck className="w-5 h-5" />
    }
  ];

  // Load carousel images from Firebase
  useEffect(() => {
    let unsubscribe;

    const loadCarouselImages = async () => {
      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, COLLECTIONS.INTRO_PICTURES, DOCUMENTS.CAROUSEL_PICTURES);
        
        unsubscribe = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const images = data.images || [];
              
              if (images.length > 0) {
                const convertedImages = images.map(url => convertGoogleDriveUrl(url)).filter(url => url !== null);
                
                if (convertedImages.length > 0) {
                  setHeroImages(convertedImages);
                } else {
                  setHeroImages(defaultHeroImages);
                }
              } else {
                setHeroImages(defaultHeroImages);
              }
            } else {
              setHeroImages(defaultHeroImages);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error loading carousel images:', error);
            setError(error.message);
            setHeroImages(defaultHeroImages);
            setLoading(false);
          }
        );

      } catch (error) {
        console.error('Error setting up carousel listener:', error);
        setError(error.message);
        setHeroImages(defaultHeroImages);
        setLoading(false);
      }
    };

    loadCarouselImages();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Load categories from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToCategoriesUpdates((fetchedCategories) => {
      setCategories(fetchedCategories);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Load category images from Firebase
  useEffect(() => {
    let unsubscribe;

    const loadCategoryImages = async () => {
      try {
        const docRef = doc(db, COLLECTIONS.CATEGORY_PICTURES, DOCUMENTS.IMAGES);
        
        unsubscribe = onSnapshot(
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
      } catch (error) {
        console.error('Error setting up category images listener:', error);
      }
    };

    loadCategoryImages();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Load featured products from Firebase
  useEffect(() => {
    let unsubscribe;

    const loadFeaturedProducts = async () => {
      try {
        const docRef = doc(db, COLLECTIONS.FEATURED_PRODUCTS, DOCUMENTS.PRODUCTS);
        
        unsubscribe = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const products = data.products || [];
              
              const convertedProducts = products.map(product => ({
                ...product,
                image: convertGoogleDriveUrl(product.image)
              }));
              
              setFeaturedProducts(convertedProducts);
            }
          },
          (error) => {
            console.error('Error loading featured products:', error);
          }
        );

      } catch (error) {
        console.error('Error setting up featured products listener:', error);
      }
    };

    loadFeaturedProducts();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Load customer reviews from Firebase
  useEffect(() => {
    const loadCustomerReviews = async () => {
      try {
        const reviewsCollection = collection(db, 'reviews');
        const reviewsSnapshot = await getDocs(reviewsCollection);
        const reviewsList = [];
        
        reviewsSnapshot.forEach((doc) => {
          const reviewData = doc.data();
          // If it's an array of reviews, add them all
          if (Array.isArray(reviewData.reviews)) {
            reviewsList.push(...reviewData.reviews);
          } else {
            // If it's a single review object, add it
            reviewsList.push(reviewData);
          }
        });
        
        // Sort by date or rating and take top reviews
        const sortedReviews = reviewsList
          .sort((a, b) => {
            const dateA = a.reviewDate?.toDate?.() || new Date(a.reviewDate || 0);
            const dateB = b.reviewDate?.toDate?.() || new Date(b.reviewDate || 0);
            return dateB - dateA;
          })
          .slice(0, 10); // Take top 10 reviews
        
        setCustomerReviews(sortedReviews);
      } catch (error) {
        console.error('Error loading customer reviews:', error);
        // Fallback to default testimonials if no reviews in database
        setCustomerReviews([
          {
            name: "Priya Sharma",
            location: "Mumbai",
            rating: 5,
            text: "Amazing quality bangles! Perfect packaging and fast delivery. Highly recommended!",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b672?w=60&h=60&fit=crop&crop=face"
          },
          {
            name: "Anita Patel",
            location: "Delhi",
            rating: 5,
            text: "Beautiful traditional designs! Perfect for weddings. Great customer service.",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
          },
          {
            name: "Meera Gupta",
            location: "Bangalore",
            rating: 5,
            text: "Love the contemporary collection! Exactly what I wanted. Will order again!",
            image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=60&h=60&fit=crop&crop=face"
          }
        ]);
      }
    };

    loadCustomerReviews();
  }, []);

  // Pre-select sizes for products already in wishlist or cart
  useEffect(() => {
    const newSelectedSizes = {};
    
    // Set sizes from wishlist
    if (wishlistItems && wishlistItems.length > 0) {
      wishlistItems.forEach(item => {
        if (item.selectedSize) {
          newSelectedSizes[item.id] = item.selectedSize;
        }
      });
    }
    
    // Set sizes from cart (cart takes priority)
    if (cartItems && cartItems.length > 0) {
      cartItems.forEach(item => {
        if (item.selectedSize) {
          newSelectedSizes[item.id] = item.selectedSize;
        }
      });
    }
    
    setSelectedSizes(newSelectedSizes);
  }, [wishlistItems, cartItems]);

  // Auto scroll for hero images
  useEffect(() => {
    if (heroImages.length === 0) return;
    
    const heroTimer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    
    return () => clearInterval(heroTimer);
  }, [heroImages.length]);

  // Auto scroll for testimonials
  useEffect(() => {
    if (customerReviews.length === 0) return;
    
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % customerReviews.length);
    }, 5000);
    
    return () => clearInterval(testimonialTimer);
  }, [customerReviews.length]);

  const whatsappNumber = "+918074086883";
  const whatsappMessage = "Hi! I'm interested in your bangles collection. Can you help me?";

  const handleWhatsAppOrder = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  };

  const handleCategoryClick = (categoryId) => {
    if (setCurrentView) {
      // Map category IDs to display names for filtering
      const categoryMap = {
        'all': 'all',
        'bridal': 'Bridal Bangles',
        'semi_bridal': 'Semi Bridal', 
        'side': 'Side Bangles',
        'hair_accessories': 'Hair Accessories',
        'return_gifts': 'Return Gifts'
      };
      
      setCurrentView('products', { category: categoryMap[categoryId] || categoryId });
    }
  };


  const showAlert = (title, message, type = 'info') => {
  setAlertState({
    isOpen: true,
    title,
    message,
    type
  });
};

const closeAlert = () => {
  setAlertState(prev => ({ ...prev, isOpen: false }));
};

  const nextFeatured = () => {
    if (featuredProducts && featuredProducts.length > 0) {
      setCurrentFeatured((prev) => (prev + 1) % featuredProducts.length);
    }
  };

  const prevFeatured = () => {
    if (featuredProducts && featuredProducts.length > 0) {
      setCurrentFeatured((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems && wishlistItems.some(item => item.id === productId);
  };

  const isInCart = (productId) => {
    return cartItems && cartItems.some(item => item.id === productId);
  };

  const getCartSelectedSize = (productId) => {
    const cartItem = cartItems && cartItems.find(item => item.id === productId);
    return cartItem ? cartItem.selectedSize : '';
  };

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

const handleAddToCart = (product) => {
  const selectedSize = selectedSizes[product.id];
  
  // Check if size is required but not selected (skip for Hair Accessories and Return Gifts)
  const sizeRequired = product.sizes && product.sizes.length > 0 && 
                      product.category !== 'Hair Accessories' && 
                      product.category !== 'Return Gifts';
  
  if (sizeRequired && !selectedSize) {
    showAlert(
      'Size Required', 
      'Please select a size before adding to cart', 
      'warning'
    );
    return;
  }

  onAddToCart && onAddToCart({
    ...product,
    selectedSize: selectedSize
  });
};

const handleWishlistClick = (product) => {
  const productInWishlist = isInWishlist(product.id);
  
  if (productInWishlist) {
    onRemoveFromWishlist && onRemoveFromWishlist(product.id);
  } else {
    // Check if size is required but not selected (skip for Hair Accessories and Return Gifts)
    const sizeRequired = product.sizes && product.sizes.length > 0 && 
                        product.category !== 'Hair Accessories' && 
                        product.category !== 'Return Gifts';
    
    if (sizeRequired && !selectedSizes[product.id]) {
      showAlert(
        'Size Required', 
        'Please select a size before adding to wishlist', 
        'warning'
      );
      return;
    }
    onAddToWishlist && onAddToWishlist({
      ...product,
      selectedSize: selectedSizes[product.id]
    });
  }
};

const staticCategories = [
  { id: 'all', title: 'All', gradient: 'from-gray-600 to-gray-700' },
  { id: 'bridal', title: 'Bridal Bangles', gradient: 'from-yellow-600 to-yellow-700' },
  { id: 'semi_bridal', title: 'Semi Bridal', gradient: 'from-yellow-700 to-yellow-800' },
  { id: 'side', title: 'Side Bangles', gradient: 'from-yellow-500 to-yellow-600' },
  { id: 'hair_accessories', title: 'Hair Accessories', gradient: 'from-yellow-400 to-yellow-500' },
  { id: 'return_gifts', title: 'Return Gifts', gradient: 'from-yellow-300 to-yellow-400' }
];

  const visibleCategories = staticCategories.filter(cat => 
    cat.id === 'all' || categoryImages[cat.id]
  );

  return (
    <div className="min-h-screen bg-white">
{/* Hero Section - Text Overlay on Image */}
<div className="relative w-full overflow-hidden">
  {/* Background Image */}
  <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px]">
    <img 
      src={heroImages[0] || defaultHeroImages[0]} 
      alt="Bridal bangles background"
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.src = defaultHeroImages[0];
      }}
    />
    
    {/* Dark Overlay for better text readability */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
    
    {/* Text Content Overlay */}
    <div className="absolute inset-0 container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
      <div className="max-w-xl lg:max-w-2xl space-y-3 sm:space-y-4 lg:space-y-6">
        
        {/* Main Heading */}
        <h1 className="font-serif leading-tight">
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[#D4AF37] font-normal">
            Grace That
          </span>
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[#D4AF37] font-normal">
            Speaks Tradition
          </span>
        </h1>
        
        {/* Description */}
        <p className="text-white text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed">
          Handcrafted bridal bangles<br/>
          that elevate every moment.
        </p>
        
      </div>
    </div>
    
    {/* Small Preview Image in Corner */}
<div className="absolute top-7 right-10 sm:top-16 sm:right-6 lg:top-20 lg:right-10 w-24 h-32 sm:w-32 sm:h-40 lg:w-40 lg:h-52 xl:w-48 xl:h-60 border-3 sm:border-4 border-white rounded-lg overflow-hidden shadow-2xl">
      <img 
        src={heroImages[1] || defaultHeroImages[1]} 
        alt="Bangles preview"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = defaultHeroImages[1];
        }}
      />
    </div>
  </div>
</div>

      {/* Categories Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Shop by Category</h2>
            <p className="text-sm sm:text-base text-gray-600">Find your perfect style</p>
          </div>

          {visibleCategories.length > 0 ? (
            <>
              <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide hide-scrollbar">
                <div className="flex space-x-6 sm:space-x-8 mx-auto">
                  {visibleCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="flex flex-col items-center cursor-pointer group flex-shrink-0"
                    >
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3">
                        <div className="w-full h-full rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                          {category.id === 'all' ? (
                            <div className="w-full h-full rounded-full overflow-hidden">
                              <img 
                                src={convertGoogleDriveUrl("https://drive.google.com/file/d/11Q3MrC8W2U9L5q97g3I-s5IfTfGmVC3u/view?usp=sharing")} 
                                alt="All Categories" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <img
                              src={categoryImages[category.id] || "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=120&h=120&fit=crop"}
                              alt={category.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              loading="lazy"
                            />
                          )}
                        </div>
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-800 text-center leading-tight group-hover:text-yellow-600 transition-colors max-w-[80px] sm:max-w-none">
                        {category.title}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center mt-6">
                <button 
                  onClick={() => setCurrentView && setCurrentView('products', { category: 'all' })}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center mx-auto text-sm sm:text-base"
                >
                  View All Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories available. Please add categories in admin panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Featured Products</h2>
            <p className="text-sm sm:text-base text-gray-600">Handpicked bestsellers just for you</p>
          </div>

          {featuredProducts && featuredProducts.length > 0 ? (
            <>
              {/* Mobile Carousel */}
              <div className="relative lg:hidden">
                <div className="overflow-hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentFeatured * 100}%)` }}
                  >
                    {featuredProducts.map((product) => {
                      const cartSelectedSize = getCartSelectedSize(product.id);
                      const productInCart = isInCart(product.id);
                      const productInWishlist = isInWishlist(product.id);
                      
                      return (
                      <div key={product.id} className="w-full flex-shrink-0 px-2">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                          <div className="relative">
                            <div 
                              className="aspect-square overflow-hidden cursor-pointer"
                              onClick={() => onProductClick && onProductClick(product.id)}
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                loading="lazy"
                              />
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWishlistClick(product);
                              }}
                              className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-300 ${
                                productInWishlist 
                                  ? 'bg-red-500 text-white scale-110' 
                                  : 'bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${productInWishlist ? 'fill-current text-white' : ''}`} />
                            </button>

                            {/* Size Indicator - Show if product is in cart with size */}
                            {productInCart && cartSelectedSize && (
                              <div className="absolute bottom-2 left-2">
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 w-fit">
                                  <Ruler className="w-3 h-3" />
                                  <span>In Cart: {cartSelectedSize}</span>
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate">{product.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                            
                            <div className="flex items-center mb-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-600 text-sm ml-2">({product.rating})</span>
                            </div>

                            {/* Size Selection */}
                            {product.sizes && product.sizes.length > 0 && (
                              <div className="mb-3">
                                <label className="block text-xs text-gray-600 mb-1">Select Size:</label>
                                <div className="flex overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                                  {product.sizes.map(size => (
                                    <button
                                      key={size}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSizeSelect(product.id, size);
                                      }}
                                      className={`flex-shrink-0 text-xs px-3 py-2 rounded border transition-colors mx-1 min-w-[50px] ${
                                        selectedSizes[product.id] === size
                                          ? 'bg-yellow-500 text-white border-yellow-500'
                                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                      }`}
                                    >
                                      {size}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <span className="text-xl font-bold text-yellow-600">₹{product.price.toLocaleString()}</span>
                                <span className="text-gray-500 text-sm line-through ml-2">₹{(product.price * 1.2).toLocaleString()}</span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isInCart(product.id)) {
                                  // Navigate to cart if already in cart
                                  setCurrentView && setCurrentView('cart');
                                } else {
                                  handleAddToCart(product);
                                }
                              }}
                              className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                                isInCart(product.id)
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                              }`}
                            >
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              {isInCart(product.id) ? 'View Cart' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
                
                {/* Mobile Navigation Arrows */}
                {featuredProducts.length > 1 && (
                  <>
                    <button 
                      onClick={prevFeatured}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={nextFeatured}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {featuredProducts.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeatured(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentFeatured ? 'bg-yellow-500 w-6' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Grid */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-4 gap-6">
                  {featuredProducts.slice(0, 4).map((product) => {
                    const cartSelectedSize = getCartSelectedSize(product.id);
                    const productInCart = isInCart(product.id);
                    const productInWishlist = isInWishlist(product.id);
                    
                    return (
                    <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="relative">
                        <div 
                          className="aspect-square overflow-hidden cursor-pointer"
                          onClick={() => onProductClick && onProductClick(product.id)}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlistClick(product);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-300 ${
                            productInWishlist 
                              ? 'bg-red-500 text-white scale-110' 
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${productInWishlist ? 'fill-current text-white' : ''}`} />
                        </button>

                        {/* Size Indicator - Show if product is in cart with size */}
                        {productInCart && cartSelectedSize && (
                          <div className="absolute bottom-2 left-2">
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 w-fit">
                              <Ruler className="w-3 h-3" />
                              <span>In Cart: {cartSelectedSize}</span>
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                        
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-600 text-sm ml-2">({product.rating})</span>
                        </div>

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="mb-3">
                            <label className="block text-xs text-gray-600 mb-1">Select Size:</label>
                            <div className="flex overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                              {product.sizes.map(size => (
                                <button
                                  key={size}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSizeSelect(product.id, size);
                                  }}
                                  className={`flex-shrink-0 text-xs px-3 py-2 rounded border transition-colors mx-1 min-w-[50px] ${
                                    selectedSizes[product.id] === size
                                      ? 'bg-yellow-500 text-white border-yellow-500'
                                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xl font-bold text-yellow-600">₹{product.price.toLocaleString()}</span>
                            <span className="text-gray-500 text-sm line-through ml-2">₹{(product.price * 1.2).toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isInCart(product.id)) {
                              // Navigate to cart if already in cart
                              setCurrentView && setCurrentView('cart');
                            } else {
                              handleAddToCart(product);
                            }
                          }}
                          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                            isInCart(product.id)
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          {isInCart(product.id) ? 'View Cart' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              </div>

              <div className="text-center mt-6">
                <button 
                  onClick={() => setCurrentView && setCurrentView('products', { category: 'all' })}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center mx-auto text-sm sm:text-base"
                >
                  View All Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No featured products available</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-br ${feature.gradient} rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex justify-center mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-8 sm:py-12 bg-white" id="testimonials">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Customer Love</h2>
            <p className="text-sm sm:text-base text-gray-600">
              What our customers say about us
            </p>
          </div>

          {customerReviews.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="text-center">
                  <img
                    src={customerReviews[currentTestimonial].image || customerReviews[currentTestimonial].customerImage || "https://images.unsplash.com/photo-1494790108755-2616b612b672?w=60&h=60&fit=crop&crop=face"}
                    alt={customerReviews[currentTestimonial].name || customerReviews[currentTestimonial].customerName}
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-4 border-yellow-100"
                    loading="lazy"
                  />
                  <div className="flex justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < (customerReviews[currentTestimonial].rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <blockquote className="text-base sm:text-lg text-gray-700 mb-4 italic leading-relaxed">
                    "{customerReviews[currentTestimonial].text || customerReviews[currentTestimonial].reviewText}"
                  </blockquote>
                  <div className="font-semibold text-gray-800 mb-1">
                    {customerReviews[currentTestimonial].name || customerReviews[currentTestimonial].customerName}
                  </div>
                  <div className="text-gray-500 text-sm flex items-center justify-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {customerReviews[currentTestimonial].location || customerReviews[currentTestimonial].customerLocation || "India"}
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6 space-x-2">
                {customerReviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-yellow-500 w-6' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading customer reviews...</p>
            </div>
          )}
        </div>
      </section>

      {/* Process Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">How It Works</h2>
            <p className="text-sm sm:text-base text-gray-600">Simple steps to get your favorite bangles</p>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">{step.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CustomAlert
  isOpen={alertState.isOpen}
  onClose={closeAlert}
  title={alertState.title}
  message={alertState.message}
  type={alertState.type}
/>

      {/* Floating WhatsApp Button */}
      <button
        onClick={handleWhatsAppOrder}
        className="fixed bottom-4 right-4 w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center"
        aria-label="Order on WhatsApp"
      >
        <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default HomePage;