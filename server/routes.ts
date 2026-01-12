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
  
  /**
   * @swagger
   * /api:
   *   get:
   *     summary: API Information
   *     tags: [Info]
   *     responses:
   *       200:
   *         description: API information and available endpoints
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 version:
   *                   type: string
   *                 documentation:
   *                   type: string
   */
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
          "PUT /api/admin/products/:id": "Update product (admin only)",
          "DELETE /api/admin/products/:id": "Delete product (admin only)",
          "GET /api/admin/orders": "Get all orders (admin only)",
          "GET /api/admin/users": "Get all users (admin only)"
        }
      }
    });
  });
  
  // Authentication routes with stricter rate limiting
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 minLength: 3
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 6
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation error or user already exists
   */
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

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Invalid credentials
   */
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

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Logout successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Logged out successfully"
   */
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Get current user info
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Current user information
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Not authenticated
   */
  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Get current user info
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Current user information
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Not authenticated
   */
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
  /**
   * @swagger
   * /api/categories:
   *   get:
   *     summary: Get all categories
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: List of all categories
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                   name:
   *                     type: string
   *                   description:
   *                     type: string
   */
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Products
  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: Get products with optional filters
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category name
   *       - in: query
   *         name: minPrice
   *         schema:
   *           type: number
   *         description: Minimum price filter
   *       - in: query
   *         name: maxPrice
   *         schema:
   *           type: number
   *         description: Maximum price filter
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in product name and description
   *     responses:
   *       200:
   *         description: List of products
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   */
  app.get("/api/products", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.search) {
        filters.search = req.query.search as string;
        console.log(`🔍 Search query received: "${filters.search}"`);
      }
      if (req.query.deals === "true") filters.deals = true;
      if (req.query.featured === "true") filters.featured = true;
      if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);
      if (req.query.minRating) filters.minRating = parseFloat(req.query.minRating as string);
      if (req.query.isPrime === "true") filters.isPrime = true;
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string);
      if (req.query.sortBy) filters.sortBy = req.query.sortBy as string;

      const products = await storage.getProducts(filters);
      
      if (filters.search) {
        console.log(`🔍 Search for "${filters.search}" returned ${products.length} products`);
      }
      if (filters.sortBy) {
        console.log(`📊 Sorted by: ${filters.sortBy}`);
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  /**
   * @swagger
   * /api/products/{id}:
   *   get:
   *     summary: Get single product by ID
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Product ID
   *     responses:
   *       200:
   *         description: Product details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Product not found
   */
  /**
   * @swagger
   * /api/products/{id}:
   *   get:
   *     summary: Get single product by ID
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Product ID
   *     responses:
   *       200:
   *         description: Product details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Product not found
   */
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
  /**
   * @swagger
   * /api/reviews/{productId}:
   *   get:
   *     summary: Get reviews for a product
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID to get reviews for
   *     responses:
   *       200:
   *         description: List of reviews for the product
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Review'
   *       500:
   *         description: Failed to fetch reviews
   */
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProduct(req.params.productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  /**
   * @swagger
   * /api/reviews/{productId}:
   *   post:
   *     summary: Create a new review for a product
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID to review
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userName
   *               - rating
   *               - title
   *               - content
   *             properties:
   *               userName:
   *                 type: string
   *                 description: Name of the reviewer
   *               rating:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 5
   *                 description: Rating from 1 to 5 stars
   *               title:
   *                 type: string
   *                 description: Review title
   *               content:
   *                 type: string
   *                 description: Review content
   *               isVerified:
   *                 type: boolean
   *                 description: Whether this is a verified purchase
   *                 default: false
   *     responses:
   *       201:
   *         description: Review created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Review'
   *       400:
   *         description: Invalid review data
   *       500:
   *         description: Failed to create review
   */
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

  /**
   * @swagger
   * /api/reviews/{reviewId}:
   *   delete:
   *     summary: Delete a review
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: reviewId
   *         required: true
   *         schema:
   *           type: string
   *         description: Review ID to delete
   *     responses:
   *       200:
   *         description: Review deleted successfully
   *       404:
   *         description: Review not found
   *       500:
   *         description: Failed to delete review
   */
  app.delete("/api/reviews/:reviewId", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteReview(req.params.reviewId);
      if (!deleted) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  // Cart
  /**
   * @swagger
   * /api/cart:
   *   get:
   *     summary: Get cart items
   *     tags: [Cart]
   *     parameters:
   *       - in: query
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: string
   *         description: Session ID for cart identification
   *     responses:
   *       200:
   *         description: Cart items
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CartItem'
   *       400:
   *         description: Missing session ID
   */
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

  /**
   * @swagger
   * /api/cart:
   *   post:
   *     summary: Add item to cart
   *     tags: [Cart]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sessionId
   *               - productId
   *               - quantity
   *             properties:
   *               sessionId:
   *                 type: string
   *               productId:
   *                 type: integer
   *               quantity:
   *                 type: integer
   *                 minimum: 1
   *     responses:
   *       201:
   *         description: Item added to cart
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CartItem'
   *       400:
   *         description: Invalid input
   */
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
  /**
   * @swagger
   * /api/orders:
   *   get:
   *     summary: Get user orders
   *     tags: [Orders]
   *     parameters:
   *       - in: query
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: string
   *         description: Session ID for order identification
   *     responses:
   *       200:
   *         description: List of user orders
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Order'
   *       400:
   *         description: Missing session ID
   */
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

  /**
   * @swagger
   * /api/orders:
   *   post:
   *     summary: Create new order
   *     tags: [Orders]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sessionId
   *               - shippingAddress
   *               - totalAmount
   *             properties:
   *               sessionId:
   *                 type: string
   *               shippingAddress:
   *                 type: string
   *               totalAmount:
   *                 type: number
   *                 minimum: 0
   *     responses:
   *       201:
   *         description: Order created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: Invalid input or empty cart
   */
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

  /**
   * @swagger
   * /api/admin/products:
   *   get:
   *     summary: Get all products (admin)
   *     tags: [Admin]
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: List of all products
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   *   post:
   *     summary: Create new product
   *     tags: [Admin]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Product'
   *     responses:
   *       201:
   *         description: Product created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       400:
   *         description: Invalid product data
   */
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
      // Validate and create product data
      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: Number(req.body.price),
        originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
        category: req.body.category,
        imageUrl: req.body.imageUrl,
        stockCount: Number(req.body.stockCount),
        inStock: Number(req.body.stockCount) > 0,
        rating: req.body.rating || 0,
        reviewCount: req.body.reviewCount || 0,
        isPrime: req.body.isPrime || false,
        isFeatured: req.body.isFeatured || false,
        isDeal: req.body.isDeal || false,
      };
      
      console.log('Creating product:', productData);
      const product = await storage.createProduct(productData);
      console.log('Product created:', product);
      res.status(201).json(product);
    } catch (error) {
      console.error('Product creation error:', error);
      res.status(500).json({ error: "Failed to create product", details: error instanceof Error ? error.message : String(error) });
    }
  });

  /**
   * @swagger
   * /api/admin/products/{id}:
   *   put:
   *     summary: Update product
   *     tags: [Admin]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Product'
   *     responses:
   *       200:
   *         description: Product updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Product not found
   *   delete:
   *     summary: Delete product
   *     tags: [Admin]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Product deleted successfully
   *       404:
   *         description: Product not found
   */
  app.put("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price ? Number(req.body.price) : undefined,
        originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
        category: req.body.category,
        imageUrl: req.body.imageUrl,
        stockCount: req.body.stockCount ? Number(req.body.stockCount) : undefined,
        inStock: req.body.stockCount ? Number(req.body.stockCount) > 0 : undefined,
        isPrime: req.body.isPrime,
        isFeatured: req.body.isFeatured,
        isDeal: req.body.isDeal,
      };
      
      // Remove undefined values
      Object.keys(updates).forEach(key => updates[key as keyof typeof updates] === undefined && delete updates[key as keyof typeof updates]);
      
      const updatedProduct = await storage.updateProduct(id, updates);
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error('Product update error:', error);
      res.status(500).json({ error: "Failed to update product", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error('Product deletion error:', error);
      res.status(500).json({ error: "Failed to delete product" });
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
