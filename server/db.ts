import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

// Create SQLite database file in the project directory with proper permissions
const sqlite = new Database("bio-link.db", { 
  verbose: console.log,
  fileMustExist: false // Create the file if it doesn't exist
});

// Enable Write-Ahead Logging for better concurrency
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;"); // Enable foreign key constraints

// Create drizzle database instance
export const db = drizzle(sqlite, { schema });

// Log successful database connection
console.log('SQLite database initialized successfully');

// Export the raw sqlite instance for session store
export { sqlite };