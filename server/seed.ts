import { db } from "./db";
import { categories, products, reviews, users } from "@shared/schema";
import type { Category, Product, Review, User } from "@shared/schema";
import bcrypt from "bcrypt";
import { storage } from "./storage";

const sampleCategories: Category[] = [
  { id: "electronics", name: "Electronics", icon: "electronics", imageUrl: null },
  { id: "fashion", name: "Fashion", icon: "fashion", imageUrl: null },
  { id: "home", name: "Home & Kitchen", icon: "home", imageUrl: null },
  { id: "books", name: "Books", icon: "books", imageUrl: null },
  { id: "sports", name: "Sports & Outdoors", icon: "sports", imageUrl: null },
  { id: "beauty", name: "Beauty & Personal Care", icon: "beauty", imageUrl: null },
  { id: "toys", name: "Toys & Games", icon: "toys", imageUrl: null },
];

const sampleProducts: Product[] = [
  {
    id: "prod-1",
    name: "Wireless Bluetooth Headphones with Active Noise Cancellation",
    description: "Premium over-ear headphones with 30-hour battery life, comfortable memory foam ear cushions, and crystal-clear audio quality. Perfect for music lovers and professionals.",
    price: 79.99,
    originalPrice: 129.99,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    images: [],
    category: "electronics",
    rating: 4.5,
    reviewCount: 2847,
    inStock: true,
    stockCount: 150,
    isPrime: true,
    isFeatured: true,
    isDeal: true,
    specifications: "Driver Size: 40mm\\nFrequency Response: 20Hz-20kHz\\nBattery Life: 30 hours\\nBluetooth: 5.0\\nWeight: 250g",
  },
  {
    id: "prod-2",
    name: "Smart Watch Fitness Tracker with Heart Rate Monitor",
    description: "Advanced smartwatch with GPS, sleep tracking, 100+ workout modes, and 7-day battery life. Water resistant to 50 meters.",
    price: 199.99,
    originalPrice: 249.99,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    images: [],
    category: "electronics",
    rating: 4.3,
    reviewCount: 1523,
    inStock: true,
    stockCount: 75,
    isPrime: true,
    isFeatured: true,
    isDeal: true,
    specifications: "Display: 1.4 inch AMOLED\\nBattery: 7 days\\nWater Resistance: 5 ATM\\nGPS: Built-in\\nSensors: Heart rate, SpO2, accelerometer",
  },
  {
    id: "prod-3",
    name: "Portable Bluetooth Speaker - Waterproof",
    description: "Compact wireless speaker with 360-degree sound, 24-hour playtime, and IP67 waterproof rating. Perfect for outdoor adventures.",
    price: 49.99,
    originalPrice: 69.99,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    images: [],
    category: "electronics",
    rating: 4.6,
    reviewCount: 3421,
    inStock: true,
    stockCount: 200,
    isPrime: true,
    isFeatured: false,
    isDeal: true,
    specifications: "Power Output: 20W\\nBattery Life: 24 hours\\nWaterproof: IP67\\nBluetooth: 5.0\\nWeight: 540g",
  },
  {
    id: "prod-4",
    name: "Ultra-Soft Cotton Bed Sheets Set",
    description: "Luxurious 100% cotton percale sheets with deep pocket fitted sheet. Breathable, durable, and gets softer with each wash.",
    price: 89.99,
    originalPrice: 149.99,
    imageUrl: "https://images.unsplash.com/photo-1586985289906-406988974504?w=400&h=400&fit=crop",
    images: [],
    category: "home",
    rating: 4.7,
    reviewCount: 1876,
    inStock: true,
    stockCount: 120,
    isPrime: true,
    isFeatured: true,
    isDeal: false,
    specifications: "Material: 100% Cotton Percale\\nThread Count: 400\\nFitted Sheet Depth: 18 inches\\nMachine Washable\\nSet Includes: Fitted sheet, flat sheet, 2 pillowcases",
  },
  {
    id: "prod-5",
    name: "Professional Chef's Kitchen Knife Set",
    description: "High-carbon stainless steel knives with ergonomic handles. Includes 8-inch chef's knife, paring knife, utility knife, and wooden block.",
    price: 129.99,
    originalPrice: 199.99,
    imageUrl: "https://images.unsplash.com/photo-1544816969-6cc3f8f6c53f?w=400&h=400&fit=crop",
    images: [],
    category: "home",
    rating: 4.4,
    reviewCount: 987,
    inStock: true,
    stockCount: 65,
    isPrime: true,
    isFeatured: false,
    isDeal: true,
    specifications: "Material: High-carbon stainless steel\\nHandle: Ergonomic polymer\\nIncludes: 8\\\" chef knife, 3.5\\\" paring knife, 5\\\" utility knife, wooden block\\nDishwasher safe",
  }
];

const sampleReviews: Review[] = [
  {
    id: "review-1",
    productId: "prod-1",
    userName: "Sarah M.",
    rating: 5,
    title: "Excellent sound quality!",
    content: "These headphones are amazing! The noise cancellation works perfectly and the battery life is exactly as advertised. Very comfortable for long listening sessions.",
    isVerified: true,
    helpfulCount: 45,
    createdAt: "December 15, 2024",
  },
  {
    id: "review-2",
    productId: "prod-1",
    userName: "Mike R.",
    rating: 4,
    title: "Great value for money",
    content: "Sound quality is excellent and build quality feels premium. Only complaint is they can get a bit warm during long use, but overall very satisfied.",
    isVerified: true,
    helpfulCount: 23,
    createdAt: "December 10, 2024",
  },
  {
    id: "review-3",
    productId: "prod-2",
    userName: "Jessica L.",
    rating: 4,
    title: "Perfect fitness companion",
    content: "Tracks everything accurately. Love the sleep tracking feature and the battery really does last a week. App is easy to use too.",
    isVerified: true,
    helpfulCount: 35,
    createdAt: "December 12, 2024",
  },
];

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(reviews);
    await db.delete(products);  
    await db.delete(categories);

    // Insert categories
    console.log("📂 Inserting categories...");
    await db.insert(categories).values(sampleCategories);

    // Insert products
    console.log("📦 Inserting products...");
    await db.insert(products).values(sampleProducts);

    // Insert reviews
    console.log("⭐ Inserting reviews...");
    await db.insert(reviews).values(sampleReviews);

    // Create admin and test users
    console.log("👤 Creating users...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const sampleUsers = [
      {
        id: "admin-1",
        username: "admin",
        email: "admin@example.com",
        password: adminPassword,
        role: "admin" as const,
        createdAt: new Date().toISOString(),
      },
      {
        id: "user-1", 
        username: "testuser",
        email: "user@example.com",
        password: userPassword,
        role: "user" as const,
        createdAt: new Date().toISOString(),
      }
    ];

    await db.insert(users).values(sampleUsers);
    console.log("✅ Admin user: admin@example.com / admin123");
    console.log("✅ Test user: user@example.com / user123");

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}