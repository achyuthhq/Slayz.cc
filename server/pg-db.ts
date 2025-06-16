import { drizzle } from "drizzle-orm/postgres-js";
// Use dynamic import for postgres to ensure it's properly bundled
import postgres from "postgres";
import * as sharedSchema from "../shared/pg-schema";
import { passwordResetTokens } from "./schema";

// Define Render PostgreSQL Database Connection Details
const RENDER_PG_HOST = process.env.PG_HOST || 'dpg-d1024gogjchc73a9eo6g-a.oregon-postgres.render.com';
const RENDER_PG_PORT = process.env.PG_PORT || '5432';
const RENDER_PG_DATABASE = process.env.PG_DATABASE || 'users_prm7';
const RENDER_PG_USER = process.env.PG_USER || 'users_prm7_user';
const RENDER_PG_PASSWORD = process.env.PG_PASSWORD || 'krKMHgU02iuLN8jv1Y7O81gJlrCPSow3';

// Create PostgreSQL connection using postgres.js
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${RENDER_PG_USER}:${RENDER_PG_PASSWORD}@${RENDER_PG_HOST}/${RENDER_PG_DATABASE}`;

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