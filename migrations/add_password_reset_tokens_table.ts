import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "../server/pg-db";

// Create the password_reset_tokens table
const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Run the migration
async function main() {
  console.log("Running migration to add password_reset_tokens table...");
  
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        "id" SERIAL PRIMARY KEY,
        "token" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "expires_at" TIMESTAMP NOT NULL
      );
      
      -- Create an index on token and email for faster lookups
      CREATE INDEX IF NOT EXISTS "password_reset_tokens_token_email_idx" ON "password_reset_tokens" ("token", "email");
      
      -- Create an index on expiresAt for faster cleanup of expired tokens
      CREATE INDEX IF NOT EXISTS "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" ("expires_at");
    `);
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
}); 