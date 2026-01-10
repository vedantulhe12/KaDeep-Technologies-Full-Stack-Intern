import type { Express } from "express";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema } from "@shared/schema";
import { requireAdmin, requireAuth } from "./auth";
import { validateSchema, asyncHandler } from "./middleware";
import { z } from "zod";

// Update order status schema
const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"])
});

export function registerAdminRoutes(app: Express) {
  
  // Admin Dashboard Stats
  app.get("/api/admin/stats", requireAdmin, asyncHandler(async (req: any, res: any) => {
    // Get basic stats for admin dashboard
    const products = await storage.getProducts();
    const orders = await storage.getOrders(""); // This needs to be fixed to get all orders
    
    const stats = {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      recentOrders: orders.slice(0, 5)
    };
    
    res.json(stats);
  }));

  // Product Management
  app.get("/api/admin/products", requireAdmin, asyncHandler(async (req: any, res: any) => {
    const products = await storage.getProducts();
    res.json(products);
  }));

  app.post("/api/admin/products", 
    requireAdmin, 
    validateSchema(insertProductSchema),
    asyncHandler(async (req: any, res: any) => {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    })
  );

  app.put("/api/admin/products/:id", 
    requireAdmin,
    asyncHandler(async (req: any, res: any) => {
      // For now, we'll create a new product since we don't have update method
      // In real implementation, you'd add updateProduct method to storage
      res.status(501).json({ error: "Product update not implemented yet" });
    })
  );

  app.delete("/api/admin/products/:id", 
    requireAdmin,
    asyncHandler(async (req: any, res: any) => {
      // Similar to update - would need deleteProduct method
      res.status(501).json({ error: "Product deletion not implemented yet" });
    })
  );

  // Category Management
  app.post("/api/admin/categories", 
    requireAdmin,
    validateSchema(insertCategorySchema),
    asyncHandler(async (req: any, res: any) => {
      // Would need createCategory method in storage
      res.status(501).json({ error: "Category creation not implemented yet" });
    })
  );

  // Order Management
  app.get("/api/admin/orders", requireAdmin, asyncHandler(async (req: any, res: any) => {
    // This needs to be updated to get all orders, not just for a session
    const orders = await storage.getOrders(""); // Placeholder - needs proper implementation
    res.json(orders);
  }));

  app.put("/api/admin/orders/:id/status", 
    requireAdmin,
    validateSchema(updateOrderStatusSchema),
    asyncHandler(async (req: any, res: any) => {
      // Would need updateOrderStatus method
      res.status(501).json({ error: "Order status update not implemented yet" });
    })
  );

  // User Management
  app.get("/api/admin/users", requireAdmin, asyncHandler(async (req: any, res: any) => {
    // Would need getAllUsers method
    res.status(501).json({ error: "User management not implemented yet" });
  }));

  // Analytics endpoints
  app.get("/api/admin/analytics/sales", requireAdmin, asyncHandler(async (req: any, res: any) => {
    // Sales analytics by date range
    const { startDate, endDate } = req.query;
    res.status(501).json({ error: "Analytics not implemented yet" });
  }));

  app.get("/api/admin/analytics/products", requireAdmin, asyncHandler(async (req: any, res: any) => {
    // Product performance analytics
    res.status(501).json({ error: "Product analytics not implemented yet" });
  }));
}