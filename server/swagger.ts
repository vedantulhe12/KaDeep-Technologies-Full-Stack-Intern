import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce Storefront API",
      version: "1.0.0",
      description: `
        A comprehensive e-commerce API built with Express.js, TypeScript, and PostgreSQL.
        
        ## Features
        - 🛒 Product catalog management
        - 👤 User authentication and registration
        - 🛍️ Shopping cart functionality
        - 📦 Order management system
        - ⭐ Product reviews and ratings
        - 🎯 Category-based product filtering
        - 🔐 Admin dashboard with protected routes
        - 🛡️ Security features with rate limiting
        
        ## Authentication
        This API uses session-based authentication. Most endpoints require either:
        - Valid session for regular user operations
        - Admin role for administrative operations
        
        ## Rate Limiting
        - General API: 100 requests per minute
        - Authentication endpoints: 5 attempts per 15 minutes
      `,
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
      contact: {
        name: "API Support",
        email: "support@ecommerce.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description: "Session-based authentication using cookies",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "user-123" },
            username: { type: "string", example: "johndoe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            role: { type: "string", enum: ["customer", "admin"], example: "customer" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string", example: "electronics" },
            name: { type: "string", example: "Electronics" },
            icon: { type: "string", example: "electronics" },
            imageUrl: { type: "string", nullable: true, example: "https://example.com/image.jpg" },
          },
          required: ["id", "name", "icon"],
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", example: "prod-1" },
            name: { type: "string", example: "Wireless Bluetooth Headphones" },
            description: { type: "string", example: "Premium over-ear headphones with 30-hour battery life" },
            price: { type: "number", format: "float", example: 79.99 },
            originalPrice: { type: "number", format: "float", nullable: true, example: 129.99 },
            imageUrl: { type: "string", example: "https://example.com/headphones.jpg" },
            images: { type: "array", items: { type: "string" }, nullable: true },
            category: { type: "string", example: "electronics" },
            rating: { type: "number", format: "float", example: 4.5 },
            reviewCount: { type: "integer", example: 2847 },
            inStock: { type: "boolean", example: true },
            stockCount: { type: "integer", example: 150 },
            isPrime: { type: "boolean", example: true },
            isFeatured: { type: "boolean", example: true },
            isDeal: { type: "boolean", example: true },
            specifications: { type: "string", nullable: true, example: "Driver Size: 40mm\\nBluetooth: 5.0" },
          },
          required: ["id", "name", "description", "price", "imageUrl", "category", "rating", "reviewCount", "inStock", "stockCount", "isPrime", "isFeatured", "isDeal"],
        },
        Review: {
          type: "object",
          properties: {
            id: { type: "string", example: "review-1" },
            productId: { type: "string", example: "prod-1" },
            userName: { type: "string", example: "Sarah M." },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            title: { type: "string", example: "Excellent sound quality!" },
            content: { type: "string", example: "These headphones are amazing! Great battery life." },
            isVerified: { type: "boolean", example: true },
            helpfulCount: { type: "integer", example: 45 },
            createdAt: { type: "string", example: "December 15, 2024" },
          },
          required: ["id", "productId", "userName", "rating", "title", "content", "isVerified", "helpfulCount", "createdAt"],
        },
        CartItem: {
          type: "object",
          properties: {
            id: { type: "string", example: "cart-1" },
            productId: { type: "string", example: "prod-1" },
            quantity: { type: "integer", minimum: 1, example: 2 },
            sessionId: { type: "string", example: "session-123" },
            product: { $ref: "#/components/schemas/Product" },
          },
          required: ["id", "productId", "quantity", "sessionId"],
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string", example: "order-1" },
            sessionId: { type: "string", example: "session-123" },
            status: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"], example: "pending" },
            subtotal: { type: "number", format: "float", example: 159.98 },
            shipping: { type: "number", format: "float", example: 5.99 },
            tax: { type: "number", format: "float", example: 12.80 },
            total: { type: "number", format: "float", example: 178.77 },
            shippingAddress: { type: "string", example: "123 Main St, City, State 12345" },
            paymentMethod: { type: "string", example: "credit_card" },
            createdAt: { type: "string", format: "date-time" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  productId: { type: "string" },
                  productName: { type: "string" },
                  productImage: { type: "string" },
                  price: { type: "number", format: "float" },
                  quantity: { type: "integer" },
                },
              },
            },
          },
          required: ["id", "sessionId", "status", "subtotal", "shipping", "tax", "total", "shippingAddress", "paymentMethod", "createdAt"],
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Error message" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
          required: ["error"],
        },
        Success: {
          type: "object",
          properties: {
            message: { type: "string", example: "Operation successful" },
          },
          required: ["message"],
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and session management",
      },
      {
        name: "Categories",
        description: "Product category management",
      },
      {
        name: "Products",
        description: "Product catalog operations",
      },
      {
        name: "Reviews",
        description: "Product review system",
      },
      {
        name: "Cart",
        description: "Shopping cart management",
      },
      {
        name: "Orders",
        description: "Order processing and management",
      },
      {
        name: "Admin",
        description: "Administrative operations (requires admin role)",
      },
    ],
  },
  apis: ["./server/routes.ts", "./server/admin-routes.ts"], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  // Swagger UI setup
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
    customSiteTitle: "E-commerce API Documentation",
    swaggerOptions: {
      docExpansion: "none",
      filter: true,
      showRequestHeaders: false,
      syntaxHighlight: {
        theme: "arta"
      }
    }
  }));

  // JSON endpoint for the OpenAPI spec
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });

  console.log(`📖 Swagger UI available at http://localhost:${process.env.PORT || 5000}/api-docs`);
}