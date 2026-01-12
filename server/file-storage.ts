import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type {
  User,
  InsertUser,
  Category,
  Product,
  InsertProduct,
  Review,
  InsertReview,
  CartItem,
  InsertCartItem,
  CartItemWithProduct,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  OrderWithItems,
} from "@shared/schema";
import { IStorage } from "./storage";

interface FileStorageData {
  users: Record<string, User>;
  categories: Record<string, Category>;
  products: Record<string, Product>;
  reviews: Record<string, Review>;
  cartItems: Record<string, CartItem>;
  orders: Record<string, Order>;
  orderItems: Record<string, OrderItem>;
}

export class FileStorage implements IStorage {
  private dataDir: string;
  private dataFile: string;
  private data: FileStorageData;

  constructor(dataDir: string = "data") {
    this.dataDir = dataDir;
    this.dataFile = join(dataDir, "storage.json");
    
    // Create data directory if it doesn't exist
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }

    // Load existing data or initialize with default data
    this.loadData();
  }

  private loadData(): void {
    try {
      if (existsSync(this.dataFile)) {
        const rawData = readFileSync(this.dataFile, 'utf8');
        this.data = JSON.parse(rawData);
        console.log("📂 Loaded existing data from file");
      } else {
        console.log("📂 No existing data file found, creating new one");
        this.data = {
          users: {},
          categories: {},
          products: {},
          reviews: {},
          cartItems: {},
          orders: {},
          orderItems: {},
        };
        this.seedInitialData();
        this.saveData();
      }
    } catch (error) {
      console.error("❌ Error loading data file:", error);
      console.log("📂 Initializing with fresh data");
      this.data = {
        users: {},
        categories: {},
        products: {},
        reviews: {},
        cartItems: {},
        orders: {},
        orderItems: {},
      };
      this.seedInitialData();
      this.saveData();
    }
  }

  private saveData(): void {
    try {
      const jsonData = JSON.stringify(this.data, null, 2);
      writeFileSync(this.dataFile, jsonData, 'utf8');
    } catch (error) {
      console.error("❌ Error saving data to file:", error);
    }
  }

  private seedInitialData(): void {
    // Seed categories
    const categories: Category[] = [
      { id: "electronics", name: "Electronics", icon: "electronics", imageUrl: null },
      { id: "fashion", name: "Fashion", icon: "fashion", imageUrl: null },
      { id: "home", name: "Home & Kitchen", icon: "home", imageUrl: null },
      { id: "books", name: "Books", icon: "books", imageUrl: null },
      { id: "sports", name: "Sports & Outdoors", icon: "sports", imageUrl: null },
      { id: "beauty", name: "Beauty & Personal Care", icon: "beauty", imageUrl: null },
      { id: "toys", name: "Toys & Games", icon: "toys", imageUrl: null },
    ];

    categories.forEach((cat) => this.data.categories[cat.id] = cat);

    // Seed sample products
    const products: Product[] = [
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
        name: "Men's Classic Fit Cotton Polo Shirt",
        description: "Comfortable and stylish polo shirt made from 100% premium cotton. Available in multiple colors.",
        price: 34.99,
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        images: [],
        category: "fashion",
        rating: 4.2,
        reviewCount: 892,
        inStock: true,
        stockCount: 300,
        isPrime: true,
        isFeatured: true,
        isDeal: false,
        specifications: "Material: 100% Cotton\\nFit: Classic\\nCare: Machine washable\\nCollar: Ribbed",
      },
      {
        id: "prod-5",
        name: "Women's Running Shoes - Lightweight Mesh",
        description: "Breathable running shoes with responsive cushioning and excellent traction. Designed for comfort during long runs.",
        price: 89.99,
        originalPrice: 119.99,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
        images: [],
        category: "fashion",
        rating: 4.7,
        reviewCount: 2156,
        inStock: true,
        stockCount: 80,
        isPrime: true,
        isFeatured: true,
        isDeal: true,
        specifications: "Upper: Breathable mesh\\nSole: Rubber\\nCushioning: EVA foam\\nWeight: 220g",
      },
      {
        id: "prod-6",
        name: "Non-Stick Cookware Set - 12 Piece",
        description: "Complete cookware set with durable non-stick coating, tempered glass lids, and ergonomic handles. Dishwasher safe.",
        price: 129.99,
        originalPrice: 179.99,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
        images: [],
        category: "home",
        rating: 4.4,
        reviewCount: 1834,
        inStock: true,
        stockCount: 45,
        isPrime: true,
        isFeatured: true,
        isDeal: true,
        specifications: "Pieces: 12\\nMaterial: Aluminum with non-stick coating\\nOven Safe: Up to 400°F\\nDishwasher Safe: Yes",
      },
      {
        id: "prod-7",
        name: "Memory Foam Pillow - Contour Design",
        description: "Ergonomic memory foam pillow that provides optimal neck support. Features cooling gel technology for a comfortable sleep.",
        price: 39.99,
        originalPrice: 59.99,
        imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop",
        images: [],
        category: "home",
        rating: 4.5,
        reviewCount: 4521,
        inStock: true,
        stockCount: 120,
        isPrime: true,
        isFeatured: false,
        isDeal: true,
        specifications: "Fill: Memory foam with cooling gel\\nCover: Bamboo-derived rayon\\nSize: Standard\\nHypoallergenic: Yes",
      },
      {
        id: "prod-8",
        name: "Bestselling Novel Collection - 5 Book Set",
        description: "Collection of award-winning novels from contemporary authors. Perfect gift for book lovers.",
        price: 45.99,
        originalPrice: 75.00,
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
        images: [],
        category: "books",
        rating: 4.8,
        reviewCount: 2341,
        inStock: true,
        stockCount: 65,
        isPrime: true,
        isFeatured: true,
        isDeal: true,
        specifications: "Format: Paperback\\nBooks: 5\\nGenre: Contemporary Fiction\\nPages: Varies",
      },
      {
        id: "prod-9",
        name: "Yoga Mat - Premium Non-Slip Surface",
        description: "Extra thick yoga mat with superior grip and cushioning. Eco-friendly materials, perfect for all yoga styles.",
        price: 29.99,
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop",
        images: [],
        category: "sports",
        rating: 4.6,
        reviewCount: 1876,
        inStock: true,
        stockCount: 200,
        isPrime: true,
        isFeatured: true,
        isDeal: false,
        specifications: "Thickness: 6mm\\nMaterial: TPE (eco-friendly)\\nSize: 72 x 24 inches\\nWeight: 2.5 lbs",
      },
      {
        id: "prod-10",
        name: "Resistance Bands Set - 5 Levels",
        description: "Complete set of resistance bands for home workouts. Includes 5 different resistance levels and carrying bag.",
        price: 19.99,
        originalPrice: 29.99,
        imageUrl: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop",
        images: [],
        category: "sports",
        rating: 4.4,
        reviewCount: 3245,
        inStock: true,
        stockCount: 350,
        isPrime: true,
        isFeatured: false,
        isDeal: true,
        specifications: "Bands: 5 (2-40 lbs resistance)\\nMaterial: Natural latex\\nIncludes: Carrying bag, door anchor\\nLength: 12 inches each",
      },
      {
        id: "prod-11",
        name: "Skincare Set - Complete Daily Routine",
        description: "Comprehensive skincare set including cleanser, toner, serum, and moisturizer. Suitable for all skin types.",
        price: 59.99,
        originalPrice: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
        images: [],
        category: "beauty",
        rating: 4.7,
        reviewCount: 1456,
        inStock: true,
        stockCount: 85,
        isPrime: true,
        isFeatured: true,
        isDeal: true,
        specifications: "Products: 4\\nSkin Type: All\\nParaben-Free: Yes\\nCruelty-Free: Yes",
      },
      {
        id: "prod-12",
        name: "Building Blocks Set - 1000 Pieces",
        description: "Creative building blocks set with various shapes and colors. Compatible with major brands. Ages 4+.",
        price: 34.99,
        originalPrice: 49.99,
        imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
        images: [],
        category: "toys",
        rating: 4.8,
        reviewCount: 2789,
        inStock: true,
        stockCount: 150,
        isPrime: true,
        isFeatured: true,
        isDeal: true,
        specifications: "Pieces: 1000\\nAge: 4+\\nMaterial: ABS plastic\\nCompatibility: Major building block brands",
      },
      {
        id: "prod-13",
        name: "4K Ultra HD Smart TV - 55 inch",
        description: "Stunning 4K display with HDR support, built-in streaming apps, and voice control. Transform your living room.",
        price: 449.99,
        originalPrice: 599.99,
        imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
        images: [],
        category: "electronics",
        rating: 4.5,
        reviewCount: 1234,
        inStock: true,
        stockCount: 25,
        isPrime: true,
        isFeatured: true,
        isDeal: true,
        specifications: "Screen: 55 inch\\nResolution: 4K Ultra HD\\nHDR: Yes\\nSmart Platform: Built-in\\nRefresh Rate: 60Hz",
      },
      {
        id: "prod-14",
        name: "Wireless Earbuds with Charging Case",
        description: "True wireless earbuds with premium sound quality, touch controls, and 24-hour total battery life with charging case.",
        price: 59.99,
        originalPrice: 79.99,
        imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
        images: [],
        category: "electronics",
        rating: 4.3,
        reviewCount: 5621,
        inStock: true,
        stockCount: 180,
        isPrime: true,
        isFeatured: false,
        isDeal: true,
        specifications: "Battery Life: 6 hours (24 with case)\\nBluetooth: 5.2\\nWater Resistance: IPX4\\nNoise Cancellation: Passive",
      },
      {
        id: "prod-15",
        name: "Laptop Stand - Adjustable Aluminum",
        description: "Ergonomic laptop stand with adjustable height and angle. Compatible with laptops 10-17 inches. Improves posture and airflow.",
        price: 39.99,
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
        images: [],
        category: "electronics",
        rating: 4.6,
        reviewCount: 892,
        inStock: true,
        stockCount: 95,
        isPrime: true,
        isFeatured: true,
        isDeal: false,
        specifications: "Material: Aluminum alloy\\nCompatibility: 10-17 inch laptops\\nAdjustable: Height and angle\\nWeight Capacity: 22 lbs",
      },
    ];

    products.forEach((prod) => this.data.products[prod.id] = prod);

    // Seed users (with pre-hashed passwords to avoid async issues during init)
    const adminPasswordHash = "$2b$10$kYk2w9T5IKYgihX5OQ2i7.pJqG/fnf57pHtQPqok8U0A3Pj63NdEm"; // admin123
    const userPasswordHash = "$2b$10$bRD6bTbdA91bk9s06NPR3OF16gAbaCW1vK0ur83R7yN6lBjkL.siS"; // user123

    const adminUser = {
      id: "admin-1",
      username: "admin",
      email: "admin@example.com",
      password: adminPasswordHash,
      role: "admin" as const,
      createdAt: new Date().toISOString(),
    };

    const testUser = {
      id: "user-1",
      username: "testuser",
      email: "user@example.com",
      password: userPasswordHash,
      role: "user" as const,
      createdAt: new Date().toISOString(),
    };

    this.data.users[adminUser.id] = adminUser;
    this.data.users[testUser.id] = testUser;

    // Seed sample reviews
    const sampleReviews: Review[] = [
      {
        id: "rev-1",
        productId: "prod-1",
        userName: "John D.",
        rating: 5,
        title: "Best headphones I've ever owned!",
        content: "The sound quality is incredible and the noise cancellation is top-notch. Battery life is exactly as advertised. Highly recommend!",
        isVerified: true,
        helpfulCount: 42,
        createdAt: "December 15, 2024",
      },
    ];

    sampleReviews.forEach((rev) => this.data.reviews[rev.id] = rev);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.data.users[id];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Object.values(this.data.users).find(
      (user) => user.username === username || user.email === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.data.users[id] = user;
    this.saveData();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Object.values(this.data.users);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Object.values(this.data.categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.data.categories[id];
  }

  // Product methods
  async getProducts(filters?: {
    category?: string;
    search?: string;
    deals?: boolean;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    isPrime?: boolean;
    limit?: number;
    sortBy?: string;
  }): Promise<Product[]> {
    let products = Object.values(this.data.products);

    if (filters) {
      if (filters.category) {
        const categories = filters.category.split(",");
        products = products.filter((p) => categories.includes(p.category));
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase().trim();
        if (searchLower) {
          const searchWords = searchLower.split(/\\s+/);
          products = products.filter((p) => {
            const productText = `${p.name} ${p.description}`.toLowerCase();
            return searchWords.every(word => productText.includes(word));
          });
        }
      }
      if (filters.deals) {
        products = products.filter((p) => p.isDeal);
      }
      if (filters.featured) {
        products = products.filter((p) => p.isFeatured);
      }
      if (filters.minPrice !== undefined) {
        products = products.filter((p) => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        products = products.filter((p) => p.price <= filters.maxPrice!);
      }
      if (filters.minRating !== undefined) {
        products = products.filter((p) => p.rating >= filters.minRating!);
      }
      if (filters.isPrime) {
        products = products.filter((p) => p.isPrime);
      }
      
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-asc':
            products = products.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            products = products.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            products = products.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            products = products.sort((a, b) => b.id.localeCompare(a.id));
            break;
          case 'featured':
          default:
            products = products.sort((a, b) => {
              if (a.isFeatured && !b.isFeatured) return -1;
              if (!a.isFeatured && b.isFeatured) return 1;
              return b.rating - a.rating;
            });
            break;
        }
      }
      
      if (filters.limit) {
        products = products.slice(0, filters.limit);
      }
    }

    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.data.products[id];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id };
    this.data.products[id] = product;
    this.saveData();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | null> {
    const existingProduct = this.data.products[id];
    if (!existingProduct) {
      return null;
    }

    const updatedProduct: Product = {
      ...existingProduct,
      ...updates,
      id,
    };

    this.data.products[id] = updatedProduct;
    this.saveData();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const exists = this.data.products[id] !== undefined;
    if (exists) {
      delete this.data.products[id];
      
      // Also remove associated reviews
      Object.keys(this.data.reviews).forEach(reviewId => {
        if (this.data.reviews[reviewId].productId === id) {
          delete this.data.reviews[reviewId];
        }
      });
      
      this.saveData();
    }
    return exists;
  }

  async updateProductRating(id: string, rating: number, reviewCount: number): Promise<void> {
    const product = this.data.products[id];
    if (product) {
      product.rating = rating;
      product.reviewCount = reviewCount;
      this.saveData();
    }
  }

  // Review methods
  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return Object.values(this.data.reviews).filter(
      (r) => r.productId === productId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { ...insertReview, id };
    this.data.reviews[id] = review;

    // Update product rating
    const reviews = await this.getReviewsByProduct(insertReview.productId);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await this.updateProductRating(insertReview.productId, avgRating, reviews.length);

    this.saveData();
    return review;
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    const review = this.data.reviews[reviewId];
    if (!review) {
      return false;
    }

    delete this.data.reviews[reviewId];

    // Update product rating after deletion
    const reviews = await this.getReviewsByProduct(review.productId);
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await this.updateProductRating(review.productId, avgRating, reviews.length);
    } else {
      await this.updateProductRating(review.productId, 0, 0);
    }

    this.saveData();
    return true;
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = Object.values(this.data.cartItems).filter(
      (item) => item.sessionId === sessionId
    );

    const itemsWithProducts: CartItemWithProduct[] = [];
    for (const item of items) {
      const product = this.data.products[item.productId];
      if (product) {
        itemsWithProducts.push({ ...item, product });
      }
    }

    return itemsWithProducts;
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const existingItem = Object.values(this.data.cartItems).find(
      (item) =>
        item.productId === insertItem.productId &&
        item.sessionId === insertItem.sessionId
    );

    if (existingItem) {
      existingItem.quantity += insertItem.quantity;
      this.saveData();
      return existingItem;
    }

    const id = randomUUID();
    const cartItem: CartItem = { ...insertItem, id };
    this.data.cartItems[id] = cartItem;
    this.saveData();
    return cartItem;
  }

  async updateCartItemQuantity(productId: string, sessionId: string, quantity: number): Promise<void> {
    const item = Object.values(this.data.cartItems).find(
      (item) => item.productId === productId && item.sessionId === sessionId
    );
    if (item) {
      item.quantity = quantity;
      this.saveData();
    }
  }

  async removeFromCart(productId: string, sessionId: string): Promise<void> {
    Object.keys(this.data.cartItems).forEach(id => {
      const item = this.data.cartItems[id];
      if (item.productId === productId && item.sessionId === sessionId) {
        delete this.data.cartItems[id];
      }
    });
    this.saveData();
  }

  async clearCart(sessionId: string): Promise<void> {
    Object.keys(this.data.cartItems).forEach(id => {
      if (this.data.cartItems[id].sessionId === sessionId) {
        delete this.data.cartItems[id];
      }
    });
    this.saveData();
  }

  // Order methods
  async getOrders(sessionId: string): Promise<OrderWithItems[]> {
    const orders = Object.values(this.data.orders).filter(
      (order) => order.sessionId === sessionId
    );

    const ordersWithItems: OrderWithItems[] = [];
    for (const order of orders) {
      const items = Object.values(this.data.orderItems).filter(
        (item) => item.orderId === order.id
      );
      ordersWithItems.push({ ...order, items });
    }

    return ordersWithItems.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const order = this.data.orders[id];
    if (!order) return undefined;

    const items = Object.values(this.data.orderItems).filter(
      (item) => item.orderId === id
    );

    return { ...order, items };
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const orderId = randomUUID();
    const order: Order = { ...insertOrder, id: orderId };
    this.data.orders[orderId] = order;

    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const itemId = randomUUID();
      const orderItem: OrderItem = { ...item, id: itemId, orderId };
      this.data.orderItems[itemId] = orderItem;
      orderItems.push(orderItem);
    }

    this.saveData();
    return { ...order, items: orderItems };
  }

  async getAllOrders(): Promise<OrderWithItems[]> {
    const ordersArray = Object.values(this.data.orders);
    const ordersWithItems: OrderWithItems[] = [];

    for (const order of ordersArray) {
      const items = Object.values(this.data.orderItems).filter(
        item => item.orderId === order.id
      );
      ordersWithItems.push({ ...order, items });
    }

    return ordersWithItems.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getStats(): Promise<{
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: OrderWithItems[];
  }> {
    const totalUsers = Object.keys(this.data.users).length;
    const totalProducts = Object.keys(this.data.products).length;
    const totalOrders = Object.keys(this.data.orders).length;
    
    const allOrders = await this.getAllOrders();
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
    const recentOrders = allOrders.slice(0, 5);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
    };
  }
}