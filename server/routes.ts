import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { insertReviewSchema, insertCartItemSchema, insertUserSchema, type User } from "@shared/schema";
import { requireAuth, requireAdmin } from "./auth";
import { authLimiter, generalLimiter, validateSchema, asyncHandler } from "./middleware";
import { z } from "zod";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string;
      role: 'admin' | 'customer';
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Apply general rate limiting
  app.use("/api", generalLimiter);
  
  // API Documentation endpoint
  app.get("/api", (req, res) => {
    res.json({
      message: "E-commerce API",
      version: "1.0.0",
      documentation: "Full interactive API documentation available at /api-docs",
      swagger: "http://localhost:5000/api-docs",
      openapi_spec: "http://localhost:5000/api-docs.json",
      endpoints: {
        authentication: {
          "POST /api/auth/register": "Register a new user",
          "POST /api/auth/login": "Login user",
          "POST /api/auth/logout": "Logout user",
          "GET /api/auth/me": "Get current user info"
        },
        categories: {
          "GET /api/categories": "Get all categories"
        },
        products: {
          "GET /api/products": "Get products with optional filters",
          "GET /api/products/:id": "Get single product by ID"
        },
        reviews: {
          "GET /api/reviews/:productId": "Get reviews for a product",
          "POST /api/reviews/:productId": "Create a new review"
        },
        cart: {
          "GET /api/cart": "Get cart items (requires sessionId query param)",
          "POST /api/cart": "Add item to cart",
          "PATCH /api/cart/:productId": "Update cart item quantity",
          "DELETE /api/cart/:productId": "Remove item from cart",
          "DELETE /api/cart/clear": "Clear entire cart"
        },
        orders: {
          "GET /api/orders": "Get user orders (requires sessionId query param)",
          "GET /api/orders/:id": "Get specific order",
          "POST /api/orders": "Create new order"
        },
        admin: {
          "GET /api/admin/stats": "Get dashboard statistics (admin only)",
          "GET /api/admin/products": "Get all products for admin (admin only)",
          "POST /api/admin/products": "Create new product (admin only)",
          "GET /api/admin/orders": "Get all orders (admin only)",
          "GET /api/admin/users": "Get all users (admin only)"
        }
      }
    });
  });
  
  // Authentication routes with stricter rate limiting
  app.post("/api/auth/register", authLimiter, asyncHandler(async (req: Request, res: Response) => {
    try {
      const { username, password, email } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
      });

      res.status(201).json({ 
        message: "User created successfully", 
        user: { id: user.id, username: user.username, email: user.email } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  }));

  app.post("/api/auth/login", authLimiter, passport.authenticate("local"), (req: Request, res: Response) => {
    if (req.user) {
      res.json({ 
        message: "Login successful", 
        user: { 
          id: req.user.id, 
          username: req.user.username, 
          email: req.user.email,
          role: req.user.role 
        } 
      });
    } else {
      res.status(401).json({ error: "Authentication failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ 
        user: { 
          id: req.user.id, 
          username: req.user.username, 
          email: req.user.email,
          role: req.user.role 
        } 
      });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
  
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.deals === "true") filters.deals = true;
      if (req.query.featured === "true") filters.featured = true;
      if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);
      if (req.query.minRating) filters.minRating = parseFloat(req.query.minRating as string);
      if (req.query.isPrime === "true") filters.isPrime = true;
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string);

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Reviews
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProduct(req.params.productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews/:productId", async (req: Request, res: Response) => {
    try {
      const reviewData = {
        productId: req.params.productId,
        userName: req.body.userName,
        rating: req.body.rating,
        title: req.body.title,
        content: req.body.content,
        isVerified: req.body.isVerified || false,
        helpfulCount: 0,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      };

      const validatedData = insertReviewSchema.parse(reviewData);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid review data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Cart
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }
      const items = await storage.getCartItems(sessionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { productId, quantity, sessionId } = req.body;
      if (!productId || !sessionId) {
        return res.status(400).json({ error: "Product ID and session ID required" });
      }

      const cartItem = await storage.addToCart({
        productId,
        quantity: quantity || 1,
        sessionId,
      });
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:productId", async (req, res) => {
    try {
      const { quantity, sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      await storage.updateCartItemQuantity(req.params.productId, sessionId, quantity);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:productId", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      await storage.removeFromCart(req.params.productId, sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart/clear", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      await storage.clearCart(sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const orders = await storage.getOrders(sessionId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { sessionId, shippingAddress, paymentMethod, items, subtotal, shipping, tax, total } = req.body;

      if (!sessionId || !shippingAddress || !items || items.length === 0) {
        return res.status(400).json({ error: "Missing required order data" });
      }

      const orderData = {
        sessionId,
        status: "pending",
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress,
        paymentMethod,
        createdAt: new Date().toISOString(),
      };

      const order = await storage.createOrder(orderData, items);

      // Clear the cart after successful order
      await storage.clearCart(sessionId);

      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", requireAuth, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/products", requireAuth, requireAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", requireAuth, requireAdmin, async (req, res) => {
    try {
      const productData = {
        ...req.body,
        id: "prod-" + Date.now(),
      };
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.get("/api/admin/orders", requireAuth, requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  return httpServer;
}
