// utils/categoryConstants.js
// Single source of truth for the categories that ship with the app. Admin-added
// categories (Firestore `categories` collection) get merged on top of this list
// everywhere it's used - see ManageCategories.jsx.
export const BUILT_IN_CATEGORIES = [
  { id: 'bridal', title: 'Bridal Bangles', gradient: 'from-yellow-600 to-yellow-700' },
  { id: 'semi_bridal', title: 'Semi Bridal', gradient: 'from-yellow-700 to-yellow-800' },
  { id: 'side', title: 'Side Bangles', gradient: 'from-yellow-500 to-yellow-600' },
  { id: 'hair_accessories', title: 'Hair Accessories', gradient: 'from-yellow-400 to-yellow-500' },
  { id: 'return_gifts', title: 'Return Gifts', gradient: 'from-yellow-300 to-yellow-400' },
  {
    id: 'combos',
    title: 'Combos',
    gradient: 'from-amber-600 to-amber-700',
    // TODO: replace with a real uploaded category image via Admin -> Categories, then remove this
    fallbackImage: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=200&h=200&fit=crop'
  },
  {
    id: 'glass_bangles',
    title: 'Glass Bangles',
    gradient: 'from-sky-500 to-sky-600',
    // TODO: replace with a real uploaded category image via Admin -> Categories, then remove this
    fallbackImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop'
  }
];

export const GRADIENT_OPTIONS = [
  { label: 'Amber', value: 'from-amber-600 to-amber-700' },
  { label: 'Yellow', value: 'from-yellow-500 to-yellow-600' },
  { label: 'Sky Blue', value: 'from-sky-500 to-sky-600' },
  { label: 'Rose', value: 'from-rose-500 to-rose-600' },
  { label: 'Emerald', value: 'from-emerald-500 to-emerald-600' },
  { label: 'Purple', value: 'from-purple-500 to-purple-600' },
  { label: 'Gray', value: 'from-gray-600 to-gray-700' }
];

/**
 * Turn a category title into a Firestore-safe, URL-safe id.
 * e.g. "Kids' Anklets" -> "kids_anklets"
 */
export const slugifyCategory = (title) => {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

/**
 * Merge built-in categories with admin-added custom ones (from Firestore),
 * sorted for consistent display. Custom entries never shadow a built-in id.
 */
export const mergeCategories = (customCategories = []) => {
  const customOnly = customCategories.filter(
    custom => !BUILT_IN_CATEGORIES.some(builtIn => builtIn.id === custom.id)
  );
  return [...BUILT_IN_CATEGORIES, ...customOnly];
};
