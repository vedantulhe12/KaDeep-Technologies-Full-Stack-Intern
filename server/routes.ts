import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { insertReviewSchema, insertCartItemSchema, insertUserSchema } from "@shared/schema";
import { requireAuth, requireAdmin } from "./auth";
import { authLimiter, generalLimiter, validateSchema, asyncHandler } from "./middleware";
import { registerAdminRoutes } from "./admin-routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Apply general rate limiting
  app.use("/api", generalLimiter);
  
  // Authentication routes with stricter rate limiting
  app.post("/api/auth/register", authLimiter, asyncHandler(async (req, res) => {
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

  app.post("/api/auth/login", authLimiter, passport.authenticate("local"), (req, res) => {
    res.json({ 
      message: "Login successful", 
      user: { 
        id: req.user.id, 
        username: req.user.username, 
        email: req.user.email,
        role: req.user.role 
      } 
    });
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

  app.post("/api/reviews/:productId", async (req, res) => {
    try {
      const reviewData = {
        ...req.body,
        productId: req.params.productId,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        helpfulCount: 0,
      };

      const validatedData = insertReviewSchema.omit({ id: true }).parse(reviewData);
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

  // Register admin routes
  registerAdminRoutes(app);

  return httpServer;
}
