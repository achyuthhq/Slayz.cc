// Import dotenv directly and configure it
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('Error loading .env file:', result.error);
  } else {
    console.log('Environment variables loaded from .env');
  }
} else {
  console.warn('.env file not found at', envPath);
}

// Set default values for required environment variables
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'dev_session_secret_replace_in_production';
  console.warn('Using default SESSION_SECRET for development');
}

if (!process.env.PORT) {
  process.env.PORT = '3000';
  console.warn('Using default PORT: 3000');
}

if (!process.env.UPLOAD_DIR) {
  process.env.UPLOAD_DIR = './uploads';
  console.warn('Using default UPLOAD_DIR: ./uploads');
}

// Set placeholder values for optional environment variables
if (!process.env.DISCORD_CLIENT_ID) {
  process.env.DISCORD_CLIENT_ID = 'discord_client_id_placeholder';
}

if (!process.env.DISCORD_CLIENT_SECRET) {
  process.env.DISCORD_CLIENT_SECRET = 'discord_client_secret_placeholder';
}

if (!process.env.GITHUB_CLIENT_ID) {
  process.env.GITHUB_CLIENT_ID = 'github_client_id_placeholder';
}

if (!process.env.GITHUB_CLIENT_SECRET) {
  process.env.GITHUB_CLIENT_SECRET = 'github_client_secret_placeholder';
}

// Import other dependencies
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./pg-setup-db"; // PostgreSQL database initialization
import { checkDatabaseConnection } from "./pg-db";
import { setupSocketIO } from "./socket";
import { createServer } from "node:http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('Starting server initialization...');

    // Check database connection
    console.log('Checking database connection...');
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to PostgreSQL database');
    }
    log('Database connection successful');

    // Initialize database before starting the server
    console.log('Initializing database...');
    await initializeDatabase();
    log('Database initialized successfully');

    // Create HTTP server instance
    console.log('Creating HTTP server...');
    const httpServer = createServer(app);

    // Setup Socket.IO with the HTTP server
    console.log('Setting up Socket.IO...');
    setupSocketIO(httpServer);

    // Register routes after socket setup
    console.log('Registering routes...');
    registerRoutes(app);

    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);
      console.error('Error stack trace:', err instanceof Error ? err.stack : 'No stack trace available');
      // Check if response is already sent
      if (res.headersSent) {
        return _next(err);
      }
      const status = err instanceof Error && 'status' in err ? (err as any).status : 
                    err instanceof Error && 'statusCode' in err ? (err as any).statusCode : 500;
      const message = err instanceof Error ? err.message : "Internal Server Error";
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      console.log('Setting up Vite in development mode...');
      await setupVite(app, httpServer);
    } else {
      console.log('Setting up static file serving...');
      serveStatic(app);
    }

    // ALWAYS serve the app on port 3000
    // this serves both the API and the client
    const PORT = 3000;
    httpServer.listen(PORT, "0.0.0.0", () => {
      log(`Server started and listening on port ${PORT}`);
    });
  } catch (error: unknown) {
    console.error('Failed to start server:', error);
    console.error('Error stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
})();