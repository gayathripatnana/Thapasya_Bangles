// // pages/HomePage.jsx
// import React, { useState, useEffect } from 'react';
// import { Star, Heart, Award, Truck, ShoppingBag, Phone, MapPin, Clock, Shield, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// const HomePage = ({ setCurrentView, featuredProducts, onProductClick, onAddToWishlist, onAddToCart, wishlistItems, cartItems }) => {
//   const [currentTestimonial, setCurrentTestimonial] = useState(0);
//   const [currentCollection, setCurrentCollection] = useState(0);
//   const [currentFeatured, setCurrentFeatured] = useState(0);

//   // Sample products for demonstration
//   const sampleProducts = featuredProducts || [
//     {
//       id: 1,
//       name: "Royal Kundan Bangles Set",
//       category: "Kundan Bangles",
//       price: 1299,
//       rating: 4.8,
//       image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop",
//       inStock: true,
//       description: "Exquisite royal kundan bangles with intricate gold work and traditional craftsmanship."
//     },
//     {
//       id: 2,
//       name: "Traditional Glass Bangles",
//       category: "Glass Bangles",
//       price: 299,
//       rating: 4.6,
//       image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
//       inStock: true,
//       description: "Colorful traditional glass bangles perfect for festivals and daily wear."
//     },
//     {
//       id: 3,
//       name: "Designer Pearl Bangles",
//       category: "Designer",
//       price: 899,
//       rating: 4.9,
//       image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop",
//       inStock: true,
//       description: "Elegant designer bangles with pearl accents and modern styling."
//     },
//     {
//       id: 4,
//       name: "Bridal Gold Bangles",
//       category: "Bridal",
//       price: 2499,
//       rating: 4.7,
//       image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
//       inStock: true,
//       description: "Premium bridal collection with intricate gold work and gemstone details."
//     },
//     {
//       id: 5,
//       name: "Antique Silver Bangles",
//       category: "Traditional",
//       price: 799,
//       rating: 4.5,
//       image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop",
//       inStock: true,
//       description: "Antique finish silver bangles with traditional motifs and patterns."
//     },
//     {
//       id: 6,
//       name: "Modern Minimalist Set",
//       category: "Designer",
//       price: 599,
//       rating: 4.4,
//       image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
//       inStock: true,
//       description: "Contemporary minimalist bangles for the modern woman."
//     }
//   ];

//   const displayProducts = featuredProducts || sampleProducts;

//   const features = [
//     {
//       icon: <Award className="w-6 h-6 text-pink-500" />,
//       title: "Premium Quality",
//       description: "Handcrafted with finest materials",
//       gradient: "from-pink-100 to-rose-100"
//     },
//     {
//       icon: <Heart className="w-6 h-6 text-red-500" />,
//       title: "Made with Love",
//       description: "Crafted with passion and care",
//       gradient: "from-red-100 to-pink-100"
//     },
//     {
//       icon: <Truck className="w-6 h-6 text-blue-500" />,
//       title: "Fast Delivery",
//       description: "2-5 days across India",
//       gradient: "from-blue-100 to-indigo-100"
//     },
//     {
//       icon: <Shield className="w-6 h-6 text-green-500" />,
//       title: "100% Authentic",
//       description: "Quality guarantee always",
//       gradient: "from-green-100 to-emerald-100"
//     }
//   ];

//   const categories = [
//     {
//       id: 'all',
//       title: "All",
//       image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=120&h=120&fit=crop",
//       gradient: "from-gray-400 to-gray-500"
//     },
//     {
//       id: 'kundan',
//       title: "Kundan Bangles",
//       image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=120&h=120&fit=crop",
//       gradient: "from-yellow-400 to-orange-500"
//     },
//     {
//       id: 'glass',
//       title: "Glass Bangles",
//       image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=120&h=120&fit=crop",
//       gradient: "from-blue-400 to-cyan-500"
//     },
//     {
//       id: 'traditional',
//       title: "Traditional",
//       image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120&h=120&fit=crop",
//       gradient: "from-amber-400 to-orange-500"
//     },
//     {
//       id: 'designer',
//       title: "Designer",
//       image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=120&h=120&fit=crop",
//       gradient: "from-purple-400 to-pink-500"
//     },
//     {
//       id: 'bridal',
//       title: "Bridal",
//       image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120&h=120&fit=crop",
//       gradient: "from-rose-400 to-pink-500"
//     }
//   ];

//   const collections = [
//     {
//       title: "Traditional",
//       description: "Classic timeless designs",
//       image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=300&h=200&fit=crop",
//       color: "from-amber-400 to-orange-500",
//       price: "₹299+",
//       items: "50+"
//     },
//     {
//       title: "Designer",
//       description: "Exclusive special pieces",
//       image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop",
//       color: "from-blue-400 to-indigo-500",
//       price: "₹599+",
//       items: "25+"
//     },
//     {
//       title: "Bridal",
//       description: "Wedding special collection",
//       image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=200&fit=crop",
//       color: "from-rose-400 to-pink-500",
//       price: "₹899+",
//       items: "20+"
//     }
//   ];

//   const testimonials = [
//     {
//       name: "Priya Sharma",
//       location: "Mumbai",
//       rating: 5,
//       text: "Amazing quality bangles! Perfect packaging and fast delivery. Highly recommended!",
//       image: "https://images.unsplash.com/photo-1494790108755-2616b612b672?w=60&h=60&fit=crop&crop=face"
//     },
//     {
//       name: "Anita Patel",
//       location: "Delhi",
//       rating: 5,
//       text: "Beautiful traditional designs! Perfect for weddings. Great customer service.",
//       image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
//     },
//     {
//       name: "Meera Gupta",
//       location: "Bangalore",
//       rating: 5,
//       text: "Love the contemporary collection! Exactly what I wanted. Will order again!",
//       image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=60&h=60&fit=crop&crop=face"
//     }
//   ];

//   const processSteps = [
//     {
//       step: "1",
//       title: "Browse",
//       description: "Explore our collections",
//       icon: <ShoppingBag className="w-5 h-5" />
//     },
//     {
//       step: "2",
//       title: "WhatsApp",
//       description: "Send us your selection",
//       icon: <Phone className="w-5 h-5" />
//     },
//     {
//       step: "3",
//       title: "Delivery",
//       description: "Receive in 2-5 days",
//       icon: <Truck className="w-5 h-5" />
//     }
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
//     }, 4000);
//     return () => clearInterval(timer);
//   }, []);

//   const whatsappNumber = "+919876543210";
//   const whatsappMessage = "Hi! I'm interested in your bangles collection. Can you help me?";

//   const handleWhatsAppOrder = () => {
//     window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
//   };

//   const handleCategoryClick = (categoryId) => {
//     if (setCurrentView) {
//       setCurrentView('products', { category: categoryId });
//     }
//   };

//   const nextCollection = () => {
//     setCurrentCollection((prev) => (prev + 1) % collections.length);
//   };

//   const prevCollection = () => {
//     setCurrentCollection((prev) => (prev - 1 + collections.length) % collections.length);
//   };

//   const nextFeatured = () => {
//     if (displayProducts && displayProducts.length > 0) {
//       setCurrentFeatured((prev) => (prev + 1) % displayProducts.length);
//     }
//   };

//   const prevFeatured = () => {
//     if (displayProducts && displayProducts.length > 0) {
//       setCurrentFeatured((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
//     }
//   };

//   const isInWishlist = (productId) => {
//     return wishlistItems && wishlistItems.some(item => item.id === productId);
//   };

//   const isInCart = (productId) => {
//     return cartItems && cartItems.some(item => item.id === productId);
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Hero Section */}
//       <section className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8 sm:py-12 lg:py-16 overflow-hidden">
//         <div className="absolute inset-0 opacity-5">
//           <div className="absolute inset-0" style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//           }}></div>
//         </div>

//         <div className="container mx-auto px-4 relative">
//           <div className="text-center mb-6 sm:mb-8">
//             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 leading-tight">
//               Beautiful <br />
//               <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
//                 Bangles Collection
//               </span>
//             </h1>
            
//             <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto mb-4 leading-relaxed px-4">
//               Handcrafted bangles blending traditional artistry with modern elegance. 
//               Each piece is carefully crafted to make you shine.
//             </p>
//           </div>

//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//             {[
//               { number: "1000+", label: "Happy Customers", color: "text-pink-600" },
//               { number: "150+", label: "Unique Designs", color: "text-purple-600" },
//               { number: "100+", label: "Cities Served", color: "text-indigo-600" },
//               { number: "4.9★", label: "Customer Rating", color: "text-yellow-600" }
//             ].map((stat, index) => (
//               <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 hover:-translate-y-1">
//                 <div className={`text-lg sm:text-2xl font-bold ${stat.color} mb-1`}>{stat.number}</div>
//                 <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Categories Section */}
//       <section className="py-8 sm:py-12 bg-white">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-6">
//             <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Shop by Category</h2>
//             <p className="text-sm sm:text-base text-gray-600">Find your perfect style</p>
//           </div>

//           {/* Mobile Grid - 3 columns */}
//           <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:hidden">
//             {categories.map((category, index) => (
//               <div
//                 key={category.id}
//                 onClick={() => handleCategoryClick(category.id)}
//                 className="flex flex-col items-center cursor-pointer group"
//               >
//                 <div className="relative w-full aspect-square mb-2">
//                   <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
//                     <img
//                       src={category.image}
//                       alt={category.title}
//                       className="w-full h-full object-cover"
//                       loading="lazy"
//                     />
//                     <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20 group-hover:opacity-10 transition-opacity duration-300`}></div>
//                   </div>
//                 </div>
//                 <h3 className="text-xs sm:text-sm font-semibold text-gray-800 text-center leading-tight group-hover:text-pink-600 transition-colors">
//                   {category.title}
//                 </h3>
//               </div>
//             ))}
//           </div>

//           {/* Desktop Grid - 6 columns */}
//           <div className="hidden lg:grid lg:grid-cols-6 gap-6">
//             {categories.map((category, index) => (
//               <div
//                 key={category.id}
//                 onClick={() => handleCategoryClick(category.id)}
//                 className="flex flex-col items-center cursor-pointer group"
//               >
//                 <div className="relative w-24 h-24 mb-3">
//                   <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
//                     <img
//                       src={category.image}
//                       alt={category.title}
//                       className="w-full h-full object-cover"
//                       loading="lazy"
//                     />
//                     <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20 group-hover:opacity-10 transition-opacity duration-300`}></div>
//                   </div>
//                 </div>
//                 <h3 className="text-sm font-semibold text-gray-800 text-center group-hover:text-pink-600 transition-colors">
//                   {category.title}
//                 </h3>
//               </div>
//             ))}
//           </div>

//           <div className="text-center mt-6">
//             <button 
//               onClick={() => setCurrentView && setCurrentView('products')}
//               className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center mx-auto text-sm sm:text-base"
//             >
//               View All Products
//               <ArrowRight className="w-4 h-4 ml-2" />
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Featured Products Section */}
//       <section className="py-8 sm:py-12 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-6">
//             <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Featured Products</h2>
//             <p className="text-sm sm:text-base text-gray-600">Handpicked bestsellers just for you</p>
//           </div>

//           {/* Mobile Carousel */}
//           <div className="relative lg:hidden">
//             <div className="overflow-hidden">
//               <div 
//                 className="flex transition-transform duration-300 ease-in-out"
//                 style={{ transform: `translateX(-${currentFeatured * 100}%)` }}
//               >
//                 {displayProducts.map((product, index) => (
//                   <div key={product.id} className="w-full flex-shrink-0 px-2">
//                     <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
//                       <div className="relative">
//                         <div 
//                           className="aspect-square overflow-hidden cursor-pointer"
//                           onClick={() => onProductClick && onProductClick(product.id)}
//                         >
//                           <img
//                             src={product.image}
//                             alt={product.name}
//                             className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//                             loading="lazy"
//                           />
//                         </div>
                        
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             onAddToWishlist && onAddToWishlist(product);
//                           }}
//                           className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
//                             isInWishlist(product.id) 
//                               ? 'bg-pink-500 text-white' 
//                               : 'bg-white text-gray-600 hover:bg-gray-50'
//                           }`}
//                         >
//                           <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
//                         </button>
//                       </div>
                      
//                       <div className="p-4">
//                         <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate">{product.name}</h3>
//                         <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                        
//                         <div className="flex items-center mb-3">
//                           <div className="flex items-center">
//                             {[...Array(5)].map((_, i) => (
//                               <Star
//                                 key={i}
//                                 className={`w-4 h-4 ${
//                                   i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
//                                 }`}
//                               />
//                             ))}
//                           </div>
//                           <span className="text-gray-600 text-sm ml-2">({product.rating})</span>
//                         </div>

//                         <div className="flex items-center justify-between mb-3">
//                           <div>
//                             <span className="text-xl font-bold text-pink-600">₹{product.price.toLocaleString()}</span>
//                             <span className="text-gray-500 text-sm line-through ml-2">₹{(product.price * 1.2).toLocaleString()}</span>
//                           </div>
//                         </div>

//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             onAddToCart && onAddToCart(product);
//                           }}
//                           className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
//                             isInCart(product.id)
//                               ? 'bg-green-500 text-white'
//                               : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
//                           }`}
//                         >
//                           <ShoppingBag className="w-4 h-4 mr-2" />
//                           {isInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Carousel Navigation */}
//             <button 
//               onClick={prevFeatured}
//               className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
//             >
//               <ChevronLeft className="w-5 h-5 text-gray-600" />
//             </button>
//             <button 
//               onClick={nextFeatured}
//               className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
//             >
//               <ChevronRight className="w-5 h-5 text-gray-600" />
//             </button>

//             {/* Dots Indicator */}
//             <div className="flex justify-center mt-4 space-x-2">
//               {displayProducts.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentFeatured(index)}
//                   className={`w-2 h-2 rounded-full transition-all duration-300 ${
//                     index === currentFeatured ? 'bg-pink-500 w-6' : 'bg-gray-300'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Desktop Grid */}
//           <div className="hidden lg:grid lg:grid-cols-4 gap-6">
//             {displayProducts.slice(0, 4).map((product) => (
//               <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
//                 <div className="relative">
//                   <div 
//                     className="aspect-square overflow-hidden cursor-pointer"
//                     onClick={() => onProductClick && onProductClick(product.id)}
//                   >
//                     <img
//                       src={product.image}
//                       alt={product.name}
//                       className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//                       loading="lazy"
//                     />
//                   </div>
                  
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onAddToWishlist && onAddToWishlist(product);
//                     }}
//                     className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
//                       isInWishlist(product.id) 
//                         ? 'bg-pink-500 text-white' 
//                         : 'bg-white text-gray-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
//                   </button>
//                 </div>
                
//                 <div className="p-4">
//                   <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate">{product.name}</h3>
//                   <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                  
//                   <div className="flex items-center mb-3">
//                     <div className="flex items-center">
//                       {[...Array(5)].map((_, i) => (
//                         <Star
//                           key={i}
//                           className={`w-4 h-4 ${
//                             i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
//                           }`}
//                         />
//                       ))}
//                     </div>
//                     <span className="text-gray-600 text-sm ml-2">({product.rating})</span>
//                   </div>

//                   <div className="flex items-center justify-between mb-3">
//                     <div>
//                       <span className="text-xl font-bold text-pink-600">₹{product.price.toLocaleString()}</span>
//                       <span className="text-gray-500 text-sm line-through ml-2">₹{(product.price * 1.2).toLocaleString()}</span>
//                     </div>
//                   </div>

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onAddToCart && onAddToCart(product);
//                     }}
//                     className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
//                       isInCart(product.id)
//                         ? 'bg-green-500 text-white'
//                         : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
//                     }`}
//                   >
//                     <ShoppingBag className="w-4 h-4 mr-2" />
//                     {isInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="text-center mt-6">
//             <button 
//               onClick={() => setCurrentView && setCurrentView('products')}
//               className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center mx-auto text-sm sm:text-base"
//             >
//               View All Products
//               <ArrowRight className="w-4 h-4 ml-2" />
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Collections Section */}
//       <section className="py-8 sm:py-12 bg-white" id="collections">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-6">
//             <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Our Collections</h2>
//             <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
//               Traditional classics to modern masterpieces
//             </p>
//           </div>

//           {/* Mobile Carousel */}
//           <div className="relative lg:hidden">
//             <div className="overflow-hidden">
//               <div 
//                 className="flex transition-transform duration-300 ease-in-out"
//                 style={{ transform: `translateX(-${currentCollection * 100}%)` }}
//               >
//                 {collections.map((collection, index) => (
//                   <div key={index} className="w-full flex-shrink-0 px-2">
//                     <div className="group cursor-pointer">
//                       <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-500 bg-white">
//                         <div className="relative overflow-hidden">
//                           <img
//                             src={collection.image}
//                             alt={collection.title}
//                             className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
//                             loading="lazy"
//                           />
//                           <div className={`absolute inset-0 bg-gradient-to-t ${collection.color} opacity-60 group-hover:opacity-40 transition-opacity duration-300`}></div>
//                           <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold text-gray-800">
//                             {collection.items}
//                           </div>
//                         </div>
                        
//                         <div className="p-4">
//                           <h3 className="text-xl font-bold mb-2 text-gray-800">{collection.title}</h3>
//                           <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
//                           <div className="flex items-center justify-between">
//                             <span className="text-base font-semibold text-pink-600">{collection.price}</span>
//                             <button 
//                               onClick={() => setCurrentView && setCurrentView('products')}
//                               className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center"
//                             >
//                               View
//                               <ArrowRight className="w-3 h-3 ml-1" />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <button 
//               onClick={prevCollection}
//               className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
//             >
//               <ChevronLeft className="w-5 h-5 text-gray-600" />
//             </button>
//             <button 
//               onClick={nextCollection}
//               className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
//             >
//               <ChevronRight className="w-5 h-5 text-gray-600" />
//             </button>

//             <div className="flex justify-center mt-4 space-x-2">
//               {collections.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentCollection(index)}
//                   className={`w-2 h-2 rounded-full transition-all duration-300 ${
//                     index === currentCollection ? 'bg-pink-500 w-6' : 'bg-gray-300'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Desktop Grid */}
//           <div className="hidden lg:grid lg:grid-cols-3 gap-6">
//             {collections.map((collection, index) => (
//               <div key={index} className="group cursor-pointer">
//                 <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-500 bg-white">
//                   <div className="relative overflow-hidden">
//                     <img
//                       src={collection.image}
//                       alt={collection.title}
//                       className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
//                       loading="lazy"
//                     />
//                     <div className={`absolute inset-0 bg-gradient-to-t ${collection.color} opacity-60 group-hover:opacity-40 transition-opacity duration-300`}></div>
//                     <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold text-gray-800">
//                       {collection.items}
//                     </div>
//                   </div>
                  
//                   <div className="p-4">
//                     <h3 className="text-xl font-bold mb-2 text-gray-800">{collection.title}</h3>
//                     <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
//                     <div className="flex items-center justify-between">
//                       <span className="text-base font-semibold text-pink-600">{collection.price}</span>
//                       <button 
//                         onClick={() => setCurrentView && setCurrentView('products')}
//                         className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center"
//                       >
//                         View
//                         <ArrowRight className="w-3 h-3 ml-1" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-8 sm:py-12 bg-gray-50" id="about">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-8">
//             <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Why Choose Us</h2>
//             <p className="text-sm sm:text-base text-gray-600">
//               Excellence in craft and service
//             </p>
//           </div>

//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             {features.map((feature, index) => (
//               <div key={index} className={`relative p-4 sm:p-6 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2`}>
//                 <div className="flex justify-center mb-3">
//                   <div className="p-2 bg-white rounded-full shadow-md group-hover:scale-110 transition-transform duration-300">
//                     {feature.icon}
//                   </div>
//                 </div>
//                 <h3 className="text-sm sm:text-base font-semibold mb-2 text-gray-800 text-center">{feature.title}</h3>
//                 <p className="text-gray-600 text-center text-xs sm:text-sm">{feature.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="py-8 sm:py-12 bg-white" id="testimonials">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-8">
//             <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Customer Love</h2>
//             <p className="text-sm sm:text-base text-gray-600">
//               Thousands of satisfied customers
//             </p>
//           </div>

//           <div className="max-w-3xl mx-auto">
//             <div className="relative bg-white rounded-xl shadow-lg p-6 sm:p-8">
//               <div className="text-center">
//                 <img
//                   src={testimonials[currentTestimonial].image}
//                   alt={testimonials[currentTestimonial].name}
//                   className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-4 border-pink-100"
//                   loading="lazy"
//                 />
//                 <div className="flex justify-center mb-3">
//                   {[...Array(5)].map((_, i) => (
//                     <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
//                   ))}
//                 </div>
//                 <blockquote className="text-base sm:text-lg text-gray-700 mb-4 italic leading-relaxed">
//                   "{testimonials[currentTestimonial].text}"
//                 </blockquote>
//                 <div className="font-semibold text-gray-800 mb-1">
//                   {testimonials[currentTestimonial].name}
//                 </div>
//                 <div className="text-gray-500 text-sm flex items-center justify-center">
//                   <MapPin className="w-3 h-3 mr-1" />
//                   {testimonials[currentTestimonial].location}
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-center mt-6 space-x-2">
//               {testimonials.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentTestimonial(index)}
//                   className={`w-2 h-2 rounded-full transition-all duration-300 ${
//                     index === currentTestimonial ? 'bg-pink-500 w-6' : 'bg-gray-300'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Special Offers Banner */}
//       <section className="py-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white">
//         <div className="container mx-auto px-4">
//           <div className="text-center">
//             <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">🎉 Special Launch Offer!</h3>
//             <p className="text-sm sm:text-base lg:text-lg mb-3 opacity-90">
//               20% OFF on first order. Code: WELCOME20
//             </p>
//             <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
//               <Clock className="w-3 h-3 mr-2" />
//               <span>Limited time - Order now!</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Floating WhatsApp Button */}
//       <button
//         onClick={handleWhatsAppOrder}
//         className="fixed bottom-4 right-4 w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center"
//         aria-label="Order on WhatsApp"
//       >
//         <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
//       </button>
//     </div>
//   );
// };

// export default HomePage;











// pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Star, Heart, Award, Truck, ShoppingBag, Phone, MapPin, Clock, Shield, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const HomePage = ({ setCurrentView, featuredProducts, onProductClick, onAddToWishlist, onAddToCart, wishlistItems, cartItems }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentCollection, setCurrentCollection] = useState(0);
  const [currentFeatured, setCurrentFeatured] = useState(0);

  // Sample products for demonstration
  const sampleProducts = featuredProducts || [
    {
      id: 1,
      name: "Royal Kundan Bangles Set",
      category: "Kundan Bangles",
      price: 1299,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop",
      inStock: true,
      description: "Exquisite royal kundan bangles with intricate gold work and traditional craftsmanship."
    },
    {
      id: 2,
      name: "Traditional Glass Bangles",
      category: "Glass Bangles",
      price: 299,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
      inStock: true,
      description: "Colorful traditional glass bangles perfect for festivals and daily wear."
    },
    {
      id: 3,
      name: "Designer Pearl Bangles",
      category: "Designer",
      price: 899,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop",
      inStock: true,
      description: "Elegant designer bangles with pearl accents and modern styling."
    },
    {
      id: 4,
      name: "Bridal Gold Bangles",
      category: "Bridal",
      price: 2499,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
      inStock: true,
      description: "Premium bridal collection with intricate gold work and gemstone details."
    },
    {
      id: 5,
      name: "Antique Silver Bangles",
      category: "Traditional",
      price: 799,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop",
      inStock: true,
      description: "Antique finish silver bangles with traditional motifs and patterns."
    },
    {
      id: 6,
      name: "Modern Minimalist Set",
      category: "Designer",
      price: 599,
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
      inStock: true,
      description: "Contemporary minimalist bangles for the modern woman."
    }
  ];

  const displayProducts = featuredProducts || sampleProducts;

  const features = [
    {
      icon: <Award className="w-6 h-6 text-pink-500" />,
      title: "Premium Quality",
      description: "Handcrafted with finest materials",
      gradient: "from-pink-100 to-rose-100"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: "Made with Love",
      description: "Crafted with passion and care",
      gradient: "from-red-100 to-pink-100"
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-500" />,
      title: "Fast Delivery",
      description: "2-5 days across India",
      gradient: "from-blue-100 to-indigo-100"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-500" />,
      title: "100% Authentic",
      description: "Quality guarantee always",
      gradient: "from-green-100 to-emerald-100"
    }
  ];

  const categories = [
    {
      id: 'all',
      title: "All",
      image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=120&h=120&fit=crop",
      gradient: "from-gray-400 to-gray-500"
    },
    {
      id: 'kundan',
      title: "Kundan Bangles",
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=120&h=120&fit=crop",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      id: 'glass',
      title: "Glass Bangles",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=120&h=120&fit=crop",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      id: 'traditional',
      title: "Traditional",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120&h=120&fit=crop",
      gradient: "from-amber-400 to-orange-500"
    },
    {
      id: 'designer',
      title: "Designer",
      image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=120&h=120&fit=crop",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      id: 'bridal',
      title: "Bridal",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120&h=120&fit=crop",
      gradient: "from-rose-400 to-pink-500"
    }
  ];

  const collections = [
    {
      title: "Traditional",
      description: "Classic timeless designs",
      image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=300&h=200&fit=crop",
      color: "from-amber-400 to-orange-500",
      price: "₹299+",
      items: "50+"
    },
    {
      title: "Designer",
      description: "Exclusive special pieces",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop",
      color: "from-blue-400 to-indigo-500",
      price: "₹599+",
      items: "25+"
    },
    {
      title: "Bridal",
      description: "Wedding special collection",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=200&fit=crop",
      color: "from-rose-400 to-pink-500",
      price: "₹899+",
      items: "20+"
    }
  ];

  const testimonials = [
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const whatsappNumber = "+918074086883";
  const whatsappMessage = "Hi! I'm interested in your bangles collection. Can you help me?";

  const handleWhatsAppOrder = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  };

  const handleCategoryClick = (categoryId) => {
    if (setCurrentView) {
      setCurrentView('products', { category: categoryId });
    }
  };

  const nextCollection = () => {
    setCurrentCollection((prev) => (prev + 1) % collections.length);
  };

  const prevCollection = () => {
    setCurrentCollection((prev) => (prev - 1 + collections.length) % collections.length);
  };

  const nextFeatured = () => {
    if (displayProducts && displayProducts.length > 0) {
      setCurrentFeatured((prev) => (prev + 1) % displayProducts.length);
    }
  };

  const prevFeatured = () => {
    if (displayProducts && displayProducts.length > 0) {
      setCurrentFeatured((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems && wishlistItems.some(item => item.id === productId);
  };

  const isInCart = (productId) => {
    return cartItems && cartItems.some(item => item.id === productId);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8 sm:py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 leading-tight">
              Beautiful <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Bangles Collection
              </span>
            </h1>
            
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto mb-4 leading-relaxed px-4">
              Handcrafted bangles blending traditional artistry with modern elegance. 
              Each piece is carefully crafted to make you shine.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Shop by Category</h2>
            <p className="text-sm sm:text-base text-gray-600">Find your perfect style</p>
          </div>

          {/* Mobile Grid - 3 columns */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:hidden">
            {categories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="relative w-full aspect-square mb-2">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 text-center leading-tight group-hover:text-pink-600 transition-colors">
                  {category.title}
                </h3>
              </div>
            ))}
          </div>

          {/* Desktop Grid - 6 columns */}
          <div className="hidden lg:grid lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="relative w-24 h-24 mb-3">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 text-center group-hover:text-pink-600 transition-colors">
                  {category.title}
                </h3>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <button 
              onClick={() => setCurrentView && setCurrentView('products')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center mx-auto text-sm sm:text-base"
            >
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Featured Products</h2>
            <p className="text-sm sm:text-base text-gray-600">Handpicked bestsellers just for you</p>
          </div>

          {/* Mobile Carousel */}
          <div className="relative lg:hidden">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentFeatured * 100}%)` }}
              >
                {displayProducts.map((product, index) => (
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
                            onAddToWishlist && onAddToWishlist(product);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
                            isInWishlist(product.id) 
                              ? 'bg-pink-500 text-white' 
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                        </button>
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

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xl font-bold text-pink-600">₹{product.price.toLocaleString()}</span>
                            <span className="text-gray-500 text-sm line-through ml-2">₹{(product.price * 1.2).toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart && onAddToCart(product);
                          }}
                          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                            isInCart(product.id)
                              ? 'bg-green-500 text-white'
                              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          {isInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Navigation */}
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

            {/* Dots Indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {displayProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeatured(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentFeatured ? 'bg-pink-500 w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {displayProducts.slice(0, 4).map((product) => (
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
                      onAddToWishlist && onAddToWishlist(product);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
                      isInWishlist(product.id) 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>
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

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xl font-bold text-pink-600">₹{product.price.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm line-through ml-2">₹{(product.price * 1.2).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart && onAddToCart(product);
                    }}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                      isInCart(product.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {isInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <button 
              onClick={() => setCurrentView && setCurrentView('products')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center mx-auto text-sm sm:text-base"
            >
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>





      {/* Testimonials Section */}
      <section className="py-8 sm:py-12 bg-white" id="testimonials">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Customer Love</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Thousands of satisfied customers
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <div className="text-center">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-4 border-pink-100"
                  loading="lazy"
                />
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-base sm:text-lg text-gray-700 mb-4 italic leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                <div className="font-semibold text-gray-800 mb-1">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-gray-500 text-sm flex items-center justify-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {testimonials[currentTestimonial].location}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-pink-500 w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>


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