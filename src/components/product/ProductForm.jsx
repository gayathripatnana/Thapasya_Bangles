// components/product/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, Upload, Star } from 'lucide-react';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: '',
    rating: 4.5,
    inStock: true
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: product.price.toString()
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
    
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    } else if (!isValidUrl(formData.image)) {
      newErrors.image = 'Please enter a valid image URL';
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        rating: parseFloat(formData.rating)
      });
      
      if (!product) {
        setFormData({
          name: '',
          price: '',
          image: '',
          description: '',
          category: '',
          rating: 4.5,
          inStock: true
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
                  : 'border-gray-300 focus:ring-pink-500'
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
                  : 'border-gray-300 focus:ring-pink-500'
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
                  : 'border-gray-300 focus:ring-pink-500'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select Category</option>
              <option value="Traditional">Traditional</option>
              <option value="Contemporary">Contemporary</option>
              <option value="Designer">Designer</option>
              <option value="Bridal">Bridal</option>
              <option value="Antique">Antique</option>
              <option value="Kundan Bangles">Kundan Bangles</option>
              <option value="Glass Bangles">Glass Bangles</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>
          
          {/* Image URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL *
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.image 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-pink-500'
                }`}
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
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
                className="w-20 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                  className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
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
                  className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
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
                : 'border-gray-300 focus:ring-pink-500'
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
        
        {/* Image Preview */}
        {formData.image && isValidUrl(formData.image) && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Preview
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <img
                src={formData.image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
        
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
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-1'
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