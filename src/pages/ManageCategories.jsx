// pages/ManageCategories.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Save, Menu, X, Tag, Image as ImageIcon } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { BUILT_IN_CATEGORIES, GRADIENT_OPTIONS, slugifyCategory, mergeCategories } from '../utils/categoryConstants';

const ManageCategories = ({ customCategories, categoryImages, onAddCategory, onDeleteCategory, onUpdateCategoryImage, setCurrentView }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [imageDrafts, setImageDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ title: '', gradient: GRADIENT_OPTIONS[0].value, imageUrl: '' });
  const [isAdding, setIsAdding] = useState(false);

  const allCategories = mergeCategories(customCategories);
  const isBuiltIn = (id) => BUILT_IN_CATEGORIES.some(cat => cat.id === id);

  const handleImageDraftChange = (id, value) => {
    setImageDrafts(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveImage = async (id) => {
    const url = imageDrafts[id];
    if (!url) return;

    setSavingId(id);
    await onUpdateCategoryImage(id, url);
    setSavingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products already assigned to it will keep the category name, but it will no longer appear as a filter option.')) {
      return;
    }
    setDeletingId(id);
    await onDeleteCategory(id);
    setDeletingId(null);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.title.trim()) return;

    setIsAdding(true);
    const id = slugifyCategory(newCategory.title);

    const success = await onAddCategory({
      id,
      title: newCategory.title.trim(),
      gradient: newCategory.gradient,
      order: allCategories.length + 1
    });

    if (success && newCategory.imageUrl) {
      await onUpdateCategoryImage(id, newCategory.imageUrl);
    }

    if (success) {
      setNewCategory({ title: '', gradient: GRADIENT_OPTIONS[0].value, imageUrl: '' });
      setShowAddForm(false);
    }
    setIsAdding(false);
  };

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
                  currentView="admin-categories"
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
            <AdminSidebar currentView="admin-categories" setCurrentView={setCurrentView} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Categories</h1>
                <p className="text-gray-600 text-sm sm:text-base">Manage product categories and their homepage images</p>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Category</span>
              </button>
            </div>

            {/* Add Category Form */}
            {showAddForm && (
              <form onSubmit={handleAddCategory} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">New Category</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={newCategory.title}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Anklets"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                      required
                    />
                    {newCategory.title.trim() && (
                      <p className="text-xs text-gray-500 mt-1">Products will use category: "{newCategory.title.trim()}"</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tile Color</label>
                    <select
                      value={newCategory.gradient}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, gradient: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    >
                      {GRADIENT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional, can add later)</label>
                    <input
                      type="url"
                      value={newCategory.imageUrl}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={isAdding || !newCategory.title.trim()}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isAdding ? 'Adding...' : 'Add Category'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Categories List */}
            <div className="space-y-3 sm:space-y-4">
              {allCategories.map(category => {
                const currentImage = categoryImages[category.id] || category.fallbackImage;
                const draftValue = imageDrafts[category.id] ?? '';

                return (
                  <div key={category.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-20 h-32 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {currentImage ? (
                          <img src={currentImage} alt={category.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.gradient}`}></span>
                            <h3 className="font-semibold text-gray-800">{category.title}</h3>
                            {isBuiltIn(category.id) && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Built-in</span>
                            )}
                          </div>
                          {!isBuiltIn(category.id) && (
                            <button
                              onClick={() => handleDelete(category.id)}
                              disabled={deletingId === category.id}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="url"
                            placeholder="Paste an image URL to update the homepage tile..."
                            value={draftValue}
                            onChange={(e) => handleImageDraftChange(category.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                          />
                          <button
                            onClick={() => handleSaveImage(category.id)}
                            disabled={!draftValue || savingId === category.id}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>{savingId === category.id ? 'Saving...' : 'Save'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {allCategories.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No categories yet</h3>
                <p className="text-gray-500">Add your first category to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;
