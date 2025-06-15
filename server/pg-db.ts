import { drizzle } from "drizzle-orm/postgres-js";
// Use dynamic import for postgres to ensure it's properly bundled
import postgres from "postgres";
import * as sharedSchema from "../shared/pg-schema";
import { passwordResetTokens } from "./schema";
import { env } from "./env";

// Create PostgreSQL connection using postgres.js
const connectionString = env.DATABASE_URL;

// Configure connection options for Render PostgreSQL
const queryClient = postgres(connectionString, {
  max: 20,
  ssl: true, // Always use SSL for Render PostgreSQL
  idle_timeout: 30,
  connect_timeout: 10 // Increased timeout for cloud database
});

// Create drizzle database instance with combined schema
export const db = drizzle(queryClient, { 
  schema: {
    ...sharedSchema,
    passwordResetTokens
  }
});

// Log successful database connection
console.log('PostgreSQL database initialized successfully');

// Health check function
export async function checkDatabaseConnection() {
  try {
    const result = await queryClient`SELECT NOW()`;
    console.log('Database connection check successful:', result[0]?.now);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Export postgres directly to ensure it's included in the bundle
export { postgres }; 