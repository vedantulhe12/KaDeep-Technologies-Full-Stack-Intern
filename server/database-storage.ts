import { eq, and, desc, ilike, gte, lte, sql, count } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "./db";
import {
  users, categories, products, reviews, cartItems, orders, orderItems,
  type User, type InsertUser,
  type Category, type Product, type InsertProduct,
  type Review, type InsertReview,
  type CartItem, type InsertCartItem, type CartItemWithProduct,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type OrderWithItems
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DrizzleStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser = { 
      ...user, 
      id, 
      role: "customer",
      createdAt: new Date()
    };
    await db.insert(users).values(newUser);
    return newUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
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
  }): Promise<Product[]> {
    const conditions = [];

    if (filters?.category) {
      const categories = filters.category.split(",");
      conditions.push(sql`${products.category} = ANY(${categories})`);
    }

    if (filters?.search) {
      conditions.push(
        sql`(${ilike(products.name, `%${filters.search}%`)} OR ${ilike(products.description, `%${filters.search}%`)})`
      );
    }

    if (filters?.deals) {
      conditions.push(eq(products.isDeal, true));
    }

    if (filters?.featured) {
      conditions.push(eq(products.isFeatured, true));
    }

    if (filters?.minPrice !== undefined) {
      conditions.push(gte(products.price, filters.minPrice));
    }

    if (filters?.maxPrice !== undefined) {
      conditions.push(lte(products.price, filters.maxPrice));
    }

    if (filters?.minRating !== undefined) {
      conditions.push(gte(products.rating, filters.minRating));
    }

    if (filters?.isPrime) {
      conditions.push(eq(products.isPrime, true));
    }

    let query = db.select().from(products);

    // Apply conditions if any
    if (conditions.length > 0) {
      const whereClause = conditions.length === 1 
        ? conditions[0] 
        : sql`${conditions.reduce((acc, condition, index) => 
            index === 0 ? condition : sql`${acc} AND ${condition}`
          )}`;
      query = query.where(whereClause);
    }

    // Apply limit
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return await query;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct = { 
      ...product, 
      id,
      originalPrice: product.originalPrice || null,
      images: product.images || null,
      specifications: product.specifications || null
    };
    await db.insert(products).values(newProduct);
    return newProduct;
  }

  async updateProductRating(id: string, rating: number, reviewCount: number): Promise<void> {
    await db.update(products)
      .set({ rating, reviewCount })
      .where(eq(products.id, id));
  }

  // Review methods
  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview = { 
      ...review, 
      id,
      isVerified: review.isVerified || false,
      helpfulCount: review.helpfulCount || 0
    };
    await db.insert(reviews).values(newReview);

    // Update product rating
    const allReviews = await this.getReviewsByProduct(review.productId);
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await this.updateProductRating(review.productId, avgRating, allReviews.length);

    return newReview;
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const result = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        sessionId: cartItems.sessionId,
        product: products
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));

    return result.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      sessionId: item.sessionId,
      product: item.product
    }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.productId, item.productId),
        eq(cartItems.sessionId, item.sessionId)
      )).limit(1);

    if (existingItem.length > 0) {
      // Update existing item
      const updatedQuantity = existingItem[0].quantity + (item.quantity || 1);
      await db.update(cartItems)
        .set({ quantity: updatedQuantity })
        .where(eq(cartItems.id, existingItem[0].id));
      return { ...existingItem[0], quantity: updatedQuantity };
    } else {
      // Create new item
      const id = randomUUID();
      const newItem = { 
        ...item, 
        id,
        quantity: item.quantity || 1
      };
      await db.insert(cartItems).values(newItem);
      return newItem;
    }
  }

  async updateCartItemQuantity(productId: string, sessionId: string, quantity: number): Promise<void> {
    await db.update(cartItems)
      .set({ quantity })
      .where(and(
        eq(cartItems.productId, productId),
        eq(cartItems.sessionId, sessionId)
      ));
  }

  async removeFromCart(productId: string, sessionId: string): Promise<void> {
    await db.delete(cartItems)
      .where(and(
        eq(cartItems.productId, productId),
        eq(cartItems.sessionId, sessionId)
      ));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Order methods
  async getOrders(sessionId: string): Promise<OrderWithItems[]> {
    const orderResults = await db.select().from(orders)
      .where(eq(orders.sessionId, sessionId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems: OrderWithItems[] = [];
    
    for (const order of orderResults) {
      const items = await db.select().from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      ordersWithItems.push({ ...order, items });
    }

    return ordersWithItems;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const orderResult = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (orderResult.length === 0) return undefined;

    const items = await db.select().from(orderItems)
      .where(eq(orderItems.orderId, id));

    return { ...orderResult[0], items };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const orderId = randomUUID();
    const newOrder = { 
      ...order, 
      id: orderId,
      status: order.status || "pending"
    };
    
    // Insert order
    await db.insert(orders).values(newOrder);

    // Insert order items
    const orderItemsToInsert = items.map(item => ({
      ...item,
      id: randomUUID(),
      orderId
    }));

    await db.insert(orderItems).values(orderItemsToInsert);

    return { ...newOrder, items: orderItemsToInsert };
  }
}