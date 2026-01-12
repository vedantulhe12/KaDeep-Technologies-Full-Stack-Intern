import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupAuth } from "./auth";
import { securityHeaders, errorHandler } from "./middleware";
import { config, validateRequiredEnv } from "./config";
import { setupSwagger } from "./swagger";

const app = express();

/* ✅ REQUIRED FOR RENDER / PROXIES */
app.set("trust proxy", 1);

const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Validate environment configuration
validateRequiredEnv();

/* =========================
   MIDDLEWARE ORDER (IMPORTANT)
========================= */

// Security headers
app.use(securityHeaders);

// Body parsers FIRST
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: config.auth.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.isProduction,
      httpOnly: true,
      sameSite: "lax", // ✅ REQUIRED FOR PROD
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Setup authentication (passport)
setupAuth(app);

/* =========================
   REQUEST LOGGER
========================= */

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

/* =========================
   MAIN BOOTSTRAP
========================= */

(async () => {
  // Register API routes (ONLY ONCE)
  await registerRoutes(httpServer, app);

  // Setup Swagger documentation
  setupSwagger(app);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Serve frontend
  if (config.isProduction) {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Start server
  httpServer.listen(config.port, () => {
    log(`serving on port ${config.port}`);
  });
})().catch(console.error);
