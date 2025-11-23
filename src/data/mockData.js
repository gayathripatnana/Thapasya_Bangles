// data/mockData.js - Fixed version without anonymous default export

export const initialProducts = [
  {
    id: 1,
    name: "Golden Kundan Bangles Set",
    price: 2500,
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop",
    description: "Beautiful handcrafted golden kundan bangles perfect for weddings and festivals. Made with premium quality materials and traditional craftsmanship.",
    category: "Traditional",
    rating: 4.8,
    inStock: true,
    createdAt: "2025-01-15"
  },
  {
    id: 2,
    name: "Silver Oxidized Bangles",
    price: 1200,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop",
    description: "Elegant silver oxidized bangles with intricate designs. These contemporary pieces blend modern aesthetics with traditional charm.",
    category: "Contemporary",
    rating: 4.6,
    inStock: true,
    createdAt: "2025-01-14"
  },
  {
    id: 3,
    name: "Pearl Designer Bangles",
    price: 1800,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    description: "Sophisticated pearl bangles for special occasions. Each piece is carefully crafted with genuine pearls and premium metals.",
    category: "Designer",
    rating: 4.9,
    inStock: false,
    createdAt: "2025-01-13"
  },
  {
    id: 4,
    name: "Antique Brass Bangles",
    price: 900,
    image: "https://images.unsplash.com/photo-1506629905607-ced622772858?w=400&h=400&fit=crop",
    description: "Traditional brass bangles with antique finish. Perfect for daily wear and traditional ceremonies with vintage appeal.",
    category: "Traditional",
    rating: 4.4,
    inStock: true,
    createdAt: "2025-01-12"
  },
  {
    id: 5,
    name: "Diamond Cut Gold Bangles",
    price: 3500,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    description: "Premium diamond cut gold bangles for luxury occasions. Featuring intricate patterns and superior craftsmanship.",
    category: "Designer",
    rating: 5.0,
    inStock: true,
    createdAt: "2025-01-11"
  },
  {
    id: 6,
    name: "Rose Gold Minimal Bangles",
    price: 1600,
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop",
    description: "Modern rose gold bangles with minimal design. Perfect for everyday wear and contemporary fashion statements.",
    category: "Contemporary",
    rating: 4.7,
    inStock: true,
    createdAt: "2025-01-10"
  },
  {
    id: 7,
    name: "Bridal Chooda Set",
    price: 4200,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop",
    description: "Traditional red and white bridal chooda set for weddings. Includes multiple bangles with intricate designs and sacred symbols.",
    category: "Bridal",
    rating: 4.9,
    inStock: true,
    createdAt: "2025-01-09"
  },
  {
    id: 8,
    name: "Meenakari Art Bangles",
    price: 2800,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    description: "Exquisite Meenakari art bangles with colorful enamel work. Each piece showcases traditional Indian artistry and vibrant colors.",
    category: "Traditional",
    rating: 4.8,
    inStock: true,
    createdAt: "2025-01-08"
  },
  {
    id: 9,
    name: "Temple Jewelry Bangles",
    price: 3200,
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop",
    description: "Sacred temple jewelry bangles with deity motifs. Perfect for religious ceremonies and traditional festivals.",
    category: "Traditional",
    rating: 4.9,
    inStock: false,
    createdAt: "2025-01-07"
  },
  {
    id: 10,
    name: "Crystal Studded Bangles",
    price: 2200,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop",
    description: "Glamorous crystal studded bangles that sparkle with every movement. Ideal for parties and special celebrations.",
    category: "Designer",
    rating: 4.6,
    inStock: true,
    createdAt: "2025-01-06"
  }
];

export const initialOrders = [
  {
    id: 1,
    productId: 1,
    productName: "Golden Kundan Bangles Set",
    customerName: "Priya Sharma",
    customerPhone: "+91 9876543210",
    customerEmail: "priya.sharma@email.com",
    status: "Processing",
    orderDate: "2025-01-20",
    amount: 2500,
    address: "123 MG Road, Koramangala, Bangalore, Karnataka - 560034",
    notes: "Please pack carefully as it's a gift"
  },
  {
    id: 2,
    productId: 2,
    productName: "Silver Oxidized Bangles",
    customerName: "Anita Patel",
    customerPhone: "+91 9876543211",
    customerEmail: "anita.patel@email.com",
    status: "Shipped",
    orderDate: "2025-01-19",
    amount: 1200,
    address: "456 Park Street, Bandra West, Mumbai, Maharashtra - 400050",
    notes: "Urgent delivery required"
  },
  {
    id: 3,
    productId: 4,
    productName: "Antique Brass Bangles",
    customerName: "Meera Singh",
    customerPhone: "+91 9876543212",
    customerEmail: "meera.singh@email.com",
    status: "Delivered",
    orderDate: "2025-01-18",
    amount: 900,
    address: "789 Civil Lines, Connaught Place, New Delhi - 110001",
    notes: "Regular customer, premium packaging"
  },
  {
    id: 4,
    productId: 7,
    productName: "Bridal Chooda Set",
    customerName: "Kavya Reddy",
    customerPhone: "+91 9876543213",
    customerEmail: "kavya.reddy@email.com",
    status: "Processing",
    orderDate: "2025-01-17",
    amount: 4200,
    address: "321 Jubilee Hills, Hyderabad, Telangana - 500033",
    notes: "Wedding order - deliver before Jan 25th"
  },
  {
    id: 5,
    productId: 5,
    productName: "Diamond Cut Gold Bangles",
    customerName: "Sneha Gupta",
    customerPhone: "+91 9876543214",
    customerEmail: "sneha.gupta@email.com",
    status: "Shipped",
    orderDate: "2025-01-16",
    amount: 3500,
    address: "654 Sector 18, Noida, Uttar Pradesh - 201301",
    notes: "Include care instructions"
  },
  {
    id: 6,
    productId: 6,
    productName: "Rose Gold Minimal Bangles",
    customerName: "Riya Jain",
    customerPhone: "+91 9876543215",
    customerEmail: "riya.jain@email.com",
    status: "Delivered",
    orderDate: "2025-01-15",
    amount: 1600,
    address: "987 FC Road, Pune, Maharashtra - 411016",
    notes: "Happy with previous orders"
  },
  {
    id: 7,
    productId: 8,
    productName: "Meenakari Art Bangles",
    customerName: "Divya Nair",
    customerPhone: "+91 9876543216",
    customerEmail: "divya.nair@email.com",
    status: "Processing",
    orderDate: "2025-01-14",
    amount: 2800,
    address: "147 Marine Drive, Kochi, Kerala - 682031",
    notes: "Festival order for Onam celebration"
  },
  {
    id: 8,
    productId: 10,
    productName: "Crystal Studded Bangles",
    customerName: "Pooja Agarwal",
    customerPhone: "+91 9876543217",
    customerEmail: "pooja.agarwal@email.com",
    status: "Shipped",
    orderDate: "2025-01-13",
    amount: 2200,
    address: "258 Malviya Nagar, Jaipur, Rajasthan - 302017",
    notes: "Anniversary gift - include gift card"
  }
];

// Sample customer data for analytics
export const customerData = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 9876543210",
    totalOrders: 3,
    totalSpent: 6800,
    lastOrderDate: "2025-01-20",
    preferredCategory: "Traditional",
    status: "Active"
  },
  {
    id: 2,
    name: "Anita Patel",
    email: "anita.patel@email.com",
    phone: "+91 9876543211",
    totalOrders: 2,
    totalSpent: 3400,
    lastOrderDate: "2025-01-19",
    preferredCategory: "Contemporary",
    status: "Active"
  },
  {
    id: 3,
    name: "Meera Singh",
    email: "meera.singh@email.com",
    phone: "+91 9876543212",
    totalOrders: 1,
    totalSpent: 900,
    lastOrderDate: "2025-01-18",
    preferredCategory: "Traditional",
    status: "New"
  }
];

// Sample analytics data
export const analyticsData = {
  monthlyRevenue: [
    { month: 'Jan', revenue: 45000, orders: 28 },
    { month: 'Feb', revenue: 52000, orders: 35 },
    { month: 'Mar', revenue: 48000, orders: 31 },
    { month: 'Apr', revenue: 61000, orders: 42 },
    { month: 'May', revenue: 55000, orders: 38 },
    { month: 'Jun', revenue: 67000, orders: 45 }
  ],
  categoryWiseRevenue: [
    { category: 'Traditional', revenue: 125000, percentage: 35 },
    { category: 'Designer', revenue: 105000, percentage: 30 },
    { category: 'Contemporary', revenue: 85000, percentage: 24 },
    { category: 'Bridal', revenue: 39000, percentage: 11 }
  ],
  topSellingProducts: [
    { id: 1, name: "Golden Kundan Bangles Set", unitsSold: 15, revenue: 37500 },
    { id: 4, name: "Antique Brass Bangles", unitsSold: 22, revenue: 19800 },
    { id: 6, name: "Rose Gold Minimal Bangles", unitsSold: 18, revenue: 28800 },
    { id: 8, name: "Meenakari Art Bangles", unitsSold: 12, revenue: 33600 },
    { id: 10, name: "Crystal Studded Bangles", unitsSold: 14, revenue: 30800 }
  ]
};

// Sample inventory alerts
export const inventoryAlerts = [
  {
    productId: 3,
    productName: "Pearl Designer Bangles",
    status: "Out of Stock",
    priority: "High",
    lastRestocked: "2025-01-10"
  },
  {
    productId: 9,
    productName: "Temple Jewelry Bangles",
    status: "Out of Stock",
    priority: "Medium",
    lastRestocked: "2025-01-05"
  }
];

// Sample testimonials
export const testimonials = [
  {
    id: 1,
    customerName: "Priya Sharma",
    rating: 5,
    comment: "Absolutely beautiful bangles! The quality is outstanding and the craftsmanship is exquisite. Highly recommended!",
    productName: "Golden Kundan Bangles Set",
    date: "2025-01-18"
  },
  {
    id: 2,
    customerName: "Anita Patel",
    rating: 4,
    comment: "Love the contemporary design. Perfect for daily wear and the silver quality is excellent.",
    productName: "Silver Oxidized Bangles",
    date: "2025-01-16"
  },
  {
    id: 3,
    customerName: "Meera Singh",
    rating: 5,
    comment: "The antique finish is perfect! Exactly what I was looking for. Will definitely order again.",
    productName: "Antique Brass Bangles",
    date: "2025-01-15"
  }
];

// Helper functions to generate more sample data
export const generateSampleProduct = (id) => ({
  id,
  name: `Sample Product ${id}`,
  price: Math.floor(Math.random() * 5000) + 500,
  image: `https://images.unsplash.com/photo-${1515562141207 + id}?w=400&h=400&fit=crop`,
  description: `Beautiful handcrafted bangle with unique design and premium quality materials.`,
  category: ['Traditional', 'Contemporary', 'Designer', 'Bridal'][Math.floor(Math.random() * 4)],
  rating: +(Math.random() * 2 + 3).toFixed(1),
  inStock: Math.random() > 0.2,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
});

export const generateSampleOrder = (id) => ({
  id,
  productId: Math.floor(Math.random() * 10) + 1,
  productName: `Sample Product ${Math.floor(Math.random() * 10) + 1}`,
  customerName: ['Priya', 'Anita', 'Meera', 'Kavya', 'Sneha'][Math.floor(Math.random() * 5)] + ' ' + 
                ['Sharma', 'Patel', 'Singh', 'Reddy', 'Gupta'][Math.floor(Math.random() * 5)],
  customerPhone: `+91 987654${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
  customerEmail: `customer${id}@email.com`,
  status: ['Processing', 'Shipped', 'Delivered'][Math.floor(Math.random() * 3)],
  orderDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  amount: Math.floor(Math.random() * 4000) + 500,
  address: `${Math.floor(Math.random() * 999) + 1} Sample Street, Sample City, Sample State - ${Math.floor(Math.random() * 900000) + 100000}`,
  notes: 'Sample order for testing'
});

// Create a named object for default export to avoid ESLint warning
const mockDataExports = {
  initialProducts,
  initialOrders,
  customerData,
  analyticsData,
  inventoryAlerts,
  testimonials,
  generateSampleProduct,
  generateSampleOrder
};

export default mockDataExports;