# PostgreSQL Migration Guide for Slayz.cc

This document outlines the steps taken to migrate the Slayz.cc application from SQLite to PostgreSQL, providing a reference for understanding the changes and how to work with the new database implementation.

## Migration Overview

The migration from SQLite to PostgreSQL involved the following key steps:

1. **Schema Migration**: Creating PostgreSQL-compatible schema definitions
2. **Database Connection**: Implementing a PostgreSQL connection pool
3. **Session Store**: Replacing SQLite session storage with PostgreSQL
4. **Data Access Layer**: Updating the storage module to use PostgreSQL
5. **Data Migration**: Creating a script to transfer data from SQLite to PostgreSQL
6. **Server Configuration**: Updating server initialization to use PostgreSQL

## Environment Configuration

To use PostgreSQL, update your `.env` file with the following variables:

### Local PostgreSQL Configuration
```
# PostgreSQL Configuration
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=slayz
PG_CONNECTION_STRING=postgres://postgres:your_password@localhost:5432/slayz
```

### Render PostgreSQL Configuration
The application is configured to use Render's PostgreSQL service with the following details:

```
# Render PostgreSQL Configuration
DATABASE_URL=postgresql://users_prm7_user:krKMHgU02iuLN8jv1Y7O81gJlrCPSow3@dpg-d1024gogjchc73a9eo6g-a.oregon-postgres.render.com/users_prm7
PG_HOST=dpg-d1024gogjchc73a9eo6g-a.oregon-postgres.render.com
PG_PORT=5432
PG_DATABASE=users_prm7
PG_USER=users_prm7_user
PG_PASSWORD=krKMHgU02iuLN8jv1Y7O81gJlrCPSow3
```

### Neon Database Configuration (Optional)
```
# For Neon Database (optional)
NEON_DATABASE_URL=postgresql://user:password@endpoint/neondb
```

## Key Files

The migration created several new files and modified existing ones:

### New Files
- `shared/pg-schema.ts`: PostgreSQL-compatible schema definitions
- `server/pg-db.ts`: PostgreSQL database connection management
- `server/pg-session.ts`: PostgreSQL session store implementation
- `server/pg-setup-db.ts`: Database initialization for PostgreSQL
- `server/pg-storage.ts`: Data access layer for PostgreSQL
- `server/migrate-data.ts`: Script to migrate data from SQLite to PostgreSQL

### Modified Files
- `server/index.ts`: Updated to use PostgreSQL initialization
- `server/auth.ts`: Updated to use PostgreSQL session store
- `server/routes.ts`: Updated imports to use PostgreSQL modules
- `server/types.ts`: Updated imports to use PostgreSQL schema
- `package.json`: Added PostgreSQL dependencies

## Database Connection

The PostgreSQL connection is managed in `server/pg-db.ts`, which creates a connection pool using `postgres.js` with proper SSL configuration for Render PostgreSQL:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/pg-schema';
import { env } from './env';

// Create a PostgreSQL connection
const connectionString = env.DATABASE_URL;

// Configure connection options for Render PostgreSQL
const queryClient = postgres(connectionString, {
  max: 20,
  ssl: true, // Always use SSL for Render PostgreSQL
  idle_timeout: 30,
  connect_timeout: 10 // Increased timeout for cloud database
});

// Create drizzle database instance
export const db = drizzle(queryClient, { schema });

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
```

## Session Store

The PostgreSQL session store is implemented in `server/pg-session.ts` with SSL enabled for Render:

```typescript
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { env } from './env';

const PgSession = connectPgSimple(session);

// Create and export the session store instance
export const sessionStore = new PgSession({
  conString: env.DATABASE_URL,
  tableName: 'session',
  createTableIfMissing: true,
  ssl: true // Enable SSL for Render PostgreSQL
});
```

## Data Migration

To migrate your data from SQLite to PostgreSQL, use the `server/migrate-data.ts` script:

```bash
# Install dependencies if not already installed
npm install

# Run the migration script
npx ts-node server/migrate-data.ts
```

The script will:
1. Connect to both SQLite and PostgreSQL databases
2. Read data from SQLite tables
3. Transform the data as needed for PostgreSQL compatibility
4. Insert the data into PostgreSQL tables

## Running with PostgreSQL

To run the application with PostgreSQL:

1. Ensure PostgreSQL is installed and running (or use Render PostgreSQL)
2. Set up your `.env` file with PostgreSQL connection details
3. Run the migration script if you need to transfer existing data
4. Start the application normally:

```bash
npm run dev
```

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running
- Check connection string format
- Ensure SSL is enabled for Render PostgreSQL
- Check that your IP is allowed in Render's database access settings
- Verify the database credentials are correct

### Schema Issues
- Check that all tables were created correctly
- Verify data types are compatible
- Look for any errors during table creation in the logs

### Session Issues
- Ensure the sessions table was created
- Check for proper session configuration with SSL enabled
- Verify the session store is properly initialized

## PostgreSQL vs SQLite Differences

Key differences to be aware of:

1. **Data Types**: PostgreSQL has more specific data types
2. **JSON Handling**: PostgreSQL uses JSONB for better JSON support
3. **Functions**: SQLite's `unixepoch()` is replaced with PostgreSQL's `extract(epoch from timestamp)`
4. **Transactions**: PostgreSQL has more robust transaction support
5. **Concurrency**: PostgreSQL handles multiple connections better than SQLite
6. **SSL**: PostgreSQL on Render requires SSL connections

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Render PostgreSQL Documentation](https://render.com/docs/databases)
- [connect-pg-simple Documentation](https://github.com/voxpelli/node-connect-pg-simple) 