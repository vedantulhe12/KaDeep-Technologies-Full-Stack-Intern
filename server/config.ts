import { z } from "zod";

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),
  
  // Database
  DATABASE_URL: z.string().optional(),
  
  // Authentication
  SESSION_SECRET: z.string().default("change-this-in-production"),
  
  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Payment (optional)
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  
  // File Upload
  UPLOAD_MAX_SIZE: z.string().default("10mb"),
  UPLOAD_ALLOWED_TYPES: z.string().default("image/jpeg,image/png,image/webp"),
  
  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Type for environment variables
export type Env = z.infer<typeof envSchema>;

// Configuration object
export const config = {
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  port: parseInt(env.PORT, 10),
  
  database: {
    url: env.DATABASE_URL,
  },
  
  auth: {
    sessionSecret: env.SESSION_SECRET,
  },
  
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : undefined,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  
  payment: {
    stripe: {
      publishableKey: env.STRIPE_PUBLISHABLE_KEY,
      secretKey: env.STRIPE_SECRET_KEY,
    },
  },
  
  upload: {
    maxSize: env.UPLOAD_MAX_SIZE,
    allowedTypes: env.UPLOAD_ALLOWED_TYPES.split(","),
  },
  
  cors: {
    origin: env.CORS_ORIGIN,
  },
};

// Validation function for required environment variables
export function validateRequiredEnv() {
  const warnings: string[] = [];
  
  if (!env.DATABASE_URL && config.isProduction) {
    warnings.push("DATABASE_URL is required in production");
  }
  
  if (env.SESSION_SECRET === "change-this-in-production" && config.isProduction) {
    warnings.push("SESSION_SECRET should be changed in production");
  }
  
  if (warnings.length > 0) {
    console.warn("Environment Configuration Warnings:");
    warnings.forEach(warning => console.warn(`⚠️  ${warning}`));
  }
  
  return warnings.length === 0;
}