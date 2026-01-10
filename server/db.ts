import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create the postgres connection
const connection = postgres(process.env.DATABASE_URL);

// Create the drizzle database instance
export const db = drizzle(connection, { schema });

// Test the connection
export async function testDbConnection() {
  try {
    await connection`SELECT 1`;
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}