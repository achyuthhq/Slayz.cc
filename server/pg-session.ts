import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { env } from "./env";

// Create PostgreSQL session store
const PgStore = connectPgSimple(session);

// Create session store instance with proper SSL configuration for Render
export const sessionStore = new PgStore({
  conString: env.DATABASE_URL,
  tableName: 'session', // Default is "session"
  schemaName: 'public', // Default is "public"
  ttl: 86400, // 1 day in seconds
  createTableIfMissing: true,
  pruneSessionInterval: 60 * 15, // 15 minutes
  ssl: true // Enable SSL for Render PostgreSQL
});

// SQL for creating session table if needed manually
export const sessionTableSQL = `
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
) WITH (OIDS=FALSE);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
`; 