import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  imageUrl: text("image_url"),
});

export const insertCategorySchema = createInsertSchema(categories);
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  imageUrl: text("image_url").notNull(),
  images: text("images").array(),
  category: text("category").notNull(),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  stockCount: integer("stock_count").notNull().default(100),
  isPrime: boolean("is_prime").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  isDeal: boolean("is_deal").notNull().default(false),
  specifications: text("specifications"),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey(),
  productId: varchar("product_id").notNull(),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  helpfulCount: integer("helpful_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Cart Items
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  sessionId: varchar("session_id").notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Cart Item with Product details
export type CartItemWithProduct = CartItem & { product: Product };

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").notNull(),
  status: text("status").notNull().default("pending"),
  subtotal: real("subtotal").notNull(),
  shipping: real("shipping").notNull(),
  tax: real("tax").notNull(),
  total: real("total").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey(),
  orderId: varchar("order_id").notNull(),
  productId: varchar("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Order with Items
export type OrderWithItems = Order & { items: OrderItem[] };

// Users (keeping existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("customer"), // customer | admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Shipping Address type for checkout
export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(10, "Valid phone number is required"),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
