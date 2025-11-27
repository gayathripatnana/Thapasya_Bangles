// components/product/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, Upload, Star, Plus } from 'lucide-react';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    images: [],
    description: '',
    category: '',
    rating: 4.5,
    inStock: true,
    sizes: ['2.0', '2.2', '2.4', '2.6', '2.8', '2.10', 'Children'],
    sizeChart: {
      '2.0': 'Small - Fits wrist circumference 13-14cm',
      '2.2': 'Small-Medium - Fits wrist circumference 14-15cm', 
      '2.4': 'Medium - Fits wrist circumference 15-16cm',
      '2.6': 'Medium-Large - Fits wrist circumference 16-17cm',
      '2.8': 'Large - Fits wrist circumference 17-18cm',
      '2.10': 'Extra Large - Fits wrist circumference 18-19cm',
      'Children': 'Kids Size - Fits wrist circumference 10-12cm'
    },
    isFeatured: false,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

const getGoogleDriveImageUrl = (url, size = 'preview') => {
  if (typeof url !== 'string' || !url) {
    return null;
  }
  
  try {
    let fileId = null;
    
    // Handle all Google Drive URL formats
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
      // Much smaller sizes for faster loading
      const sizes = {
        'tiny': `https://lh3.googleusercontent.com/d/${fileId}=w100-h100`, // 100x100 - ultra fast
        'preview': `https://lh3.googleusercontent.com/d/${fileId}=w200-h200`, // 200x200 - for form preview
        'thumbnail': `https://lh3.googleusercontent.com/d/${fileId}=w300-h300`, // 300x300 - for listings
        'medium': `https://lh3.googleusercontent.com/d/${fileId}=w500-h500`, // 500x500 - for product pages
        'large': `https://lh3.googleusercontent.com/d/${fileId}=w800` // 800px width - maximum needed
      };
      
      return sizes[size] || sizes.preview;
    }
    
    return url;
  } catch (e) {
    console.error('Error converting Google Drive URL:', e);
    return url;
  }
};

  // Check if URL is a valid Google Drive URL
  const isValidGoogleDriveUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    const drivePatterns = [
      /drive\.google\.com\/file\/d\/([^\/]+)/,
      /uc\?export=view&id=([^&]+)/,
      /\/open\?id=([^&]+)/,
      /\/view\?usp=(drive_link|sharing)/
    ];
    
    return drivePatterns.some(pattern => pattern.test(url));
  };

  // Check if URL is valid
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        isFeatured: product.isFeatured || false,
        price: product.price.toString(),
        images: product.images || [product.image],
        sizes: product.sizes || ['2.0', '2.2', '2.4', '2.6', '2.8', '2.10', 'Children'],
        sizeChart: product.sizeChart || {
          '2.0': 'Small - Fits wrist circumference 13-14cm',
          '2.2': 'Small-Medium - Fits wrist circumference 14-15cm',
          '2.4': 'Medium - Fits wrist circumference 15-16cm',
          '2.6': 'Medium-Large - Fits wrist circumference 16-17cm',
          '2.8': 'Large - Fits wrist circumference 17-18cm',
          '2.10': 'Extra Large - Fits wrist circumference 18-19cm',
          'Children': 'Kids Size - Fits wrist circumference 10-12cm'
        }
      });
    }
  }, [product]);

const validateForm = () => {
  const newErrors = {};
  
  if (!formData.name.trim()) {
    newErrors.name = 'Product name is required';
  } else if (formData.name.trim().length < 3) {
    newErrors.name = 'Product name must be at least 3 characters';
  }
  
  if (!formData.price || parseFloat(formData.price) <= 0) {
    newErrors.price = 'Valid price is required';
  } else if (parseFloat(formData.price) > 100000) {
    newErrors.price = 'Price cannot exceed ₹1,00,000';
  }
  
  // Validate multiple images
  if (!formData.images || formData.images.length === 0) {
    newErrors.images = 'At least one image is required';
  } else {
    // Check each image URL
    for (let i = 0; i < formData.images.length; i++) {
      const img = formData.images[i];
      if (!img.trim()) {
        newErrors.images = `Image ${i + 1} URL is required`;
        break;
      } else if (!isValidUrl(img)) {
        newErrors.images = `Image ${i + 1} URL is invalid`;
        break;
      }
    }
  }
  
  if (!formData.description.trim()) {
    newErrors.description = 'Description is required';
  } else if (formData.description.trim().length < 10) {
    newErrors.description = 'Description must be at least 10 characters';
  }
  
  if (!formData.category) {
    newErrors.category = 'Category is required';
  }
  
  if (formData.rating < 1 || formData.rating > 5) {
    newErrors.rating = 'Rating must be between 1 and 5';
  }
  
  // REMOVE OR COMMENT OUT THIS VALIDATION BLOCK TO MAKE SIZES OPTIONAL:
  // if (!formData.sizes || formData.sizes.length === 0) {
  //   newErrors.sizes = 'At least one size must be selected';
  // }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        rating: parseFloat(formData.rating),
        image: formData.images[0] // Set first image as main image for backward compatibility
      };
      
      onSubmit(submitData);
      
      if (!product) {
        setFormData({
          name: '',
          price: '',
          image: '',
          images: [],
          description: '',
          category: '',
          rating: 4.5,
          inStock: true,
          sizes: ['2.0', '2.2', '2.4', '2.6', '2.8', '2.10', 'Children'],
          sizeChart: {
            '2.0': 'Small - Fits wrist circumference 13-14cm',
            '2.2': 'Small-Medium - Fits wrist circumference 14-15cm',
            '2.4': 'Medium - Fits wrist circumference 15-16cm',
            '2.6': 'Medium-Large - Fits wrist circumference 16-17cm',
            '2.8': 'Large - Fits wrist circumference 17-18cm',
            '2.10': 'Extra Large - Fits wrist circumference 18-19cm',
            'Children': 'Kids Size - Fits wrist circumference 10-12cm'
          },
          isFeatured: false
        });
      }
      
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    handleInputChange('images', newImages);
  };

  const addImageField = () => {
    handleInputChange('images', [...formData.images, '']);
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
  };

  // Function to handle image loading with fallbacks
  const handleImageError = (e, img, index) => {
    console.log(`Image ${index + 1} failed to load, trying fallback sizes`);
    
    // Try medium size
    e.target.src = getGoogleDriveImageUrl(img, 'medium');
    
    e.target.onerror = () => {
      // Try large size
      e.target.src = getGoogleDriveImageUrl(img, 'large');
      
      e.target.onerror = () => {
        // Try original
        e.target.src = getGoogleDriveImageUrl(img, 'original');
        
        e.target.onerror = () => {
          // Final fallback to placeholder
          e.target.src = 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Image+Not+Found';
          e.target.alt = 'Failed to load image';
          e.target.className = 'w-full h-full object-contain p-2';
        };
      };
    };
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <p className="text-gray-600 mt-1">
            {product ? 'Update product information' : 'Fill in the details to add a new product'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="Enter product name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="w-4 h-4 mr-1">⚠</span>
                {errors.name}
              </p>
            )}
          </div>
          
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.price 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.category 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select Category</option>
              <option value="Bridal Bangles">Bridal Bangles</option>
              <option value="Side Bangles">Side Bangles</option>
              <option value="Hair Accessories">Hair Accessories</option>
              <option value="Semi Bridal">Semi Bridal</option>
              <option value="Return Gifts">Return Gifts</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>
          
          {/* Available Sizes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Sizes (Optional)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['2.0', '2.2', '2.4', '2.6', '2.8', '2.10', 'Children'].map(size => (
                <label key={size} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.sizes.includes(size)}
                    onChange={(e) => {
                      const newSizes = e.target.checked
                        ? [...formData.sizes, size]
                        : formData.sizes.filter(s => s !== size);
                      handleInputChange('sizes', newSizes);
                    }}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-gray-700">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Multiple Images URLs */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images * (Add multiple image URLs)
            </label>
            <div className="space-y-3">
              {formData.images.map((img, index) => (
                <div key={index} className="flex space-x-2 items-start">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="https://drive.google.com/file/d/..."
                      disabled={isSubmitting}
                    />
                    {index === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        First image will be used as main product image
                      </p>
                    )}
                  </div>
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addImageField}
                className="flex items-center space-x-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-yellow-500 transition-colors w-full justify-center"
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Image URL</span>
              </button>
            </div>
            {errors.images && (
              <p className="text-red-500 text-sm mt-1">{errors.images}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Paste Google Drive links in any of these formats:
              <br />
              • https://drive.google.com/file/d/ID/view?usp=drive_link
              <br />
              • https://drive.google.com/file/d/ID/view?usp=sharing
              <br />
              • https://drive.google.com/file/d/ID/view
              <br />
              Make sure files have "Anyone with the link can view" permission
            </p>
          </div>
          
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', e.target.value)}
                className="w-20 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                disabled={isSubmitting}
              />
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.floor(formData.rating) ? 'fill-current' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            {errors.rating && (
              <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
            )}
          </div>
          
          {/* Stock Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Status
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="inStock"
                  checked={formData.inStock === true}
                  onChange={() => handleInputChange('inStock', true)}
                  className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700">In Stock</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="inStock"
                  checked={formData.inStock === false}
                  onChange={() => handleInputChange('inStock', false)}
                  className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700">Out of Stock</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows="4"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
              errors.description 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-yellow-500'
            }`}
            placeholder="Enter detailed product description..."
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p className="text-red-500 text-sm">{errors.description}</p>
            ) : (
              <p className="text-gray-500 text-sm">
                {formData.description.length}/500 characters
              </p>
            )}
          </div>
        </div>
        
{/* Multiple Images Preview - Using Tiny Images for Speed */}
{formData.images.some(img => img && isValidUrl(img)) && (
  <div className="mt-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Images Preview
    </label>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {formData.images.map((img, index) => (
        img && isValidUrl(img) && (
          <div key={index} className="border border-gray-200 rounded-lg p-1 bg-gray-50">
            <div className="relative w-full h-16 bg-white rounded overflow-hidden">
              <img
                src={getGoogleDriveImageUrl(img, 'tiny')} // Using tiny 100x100 images
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy" // Lazy loading
                onError={(e) => {
                  // Fallback to slightly larger if tiny fails
                  e.target.src = getGoogleDriveImageUrl(img, 'preview');
                }}
              />
              <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded-tl">
                {index + 1}
              </div>
            </div>
          </div>
        )
      ))}
    </div>
    <p className="text-xs text-gray-500 mt-2">
      Using compressed 100x100 images for fast preview. Full quality loads on product page.
    </p>
  </div>
)}

        {/* Featured Product Toggle */}
        <div className="mt-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              disabled={isSubmitting}
            />
            <span className="text-sm font-medium text-gray-700">Set as Featured Product</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Featured products will be displayed on the homepage
          </p>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
              isSubmitting
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-gray-600 text-white hover:shadow-lg transform hover:-translate-y-1'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{product ? 'Update Product' : 'Add Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;