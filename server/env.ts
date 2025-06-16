import { config } from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  const result = config({ path: envPath });
  if (result.error) {
    console.error('Error loading .env file:', result.error);
  } else {
    console.log('Environment variables loaded from .env');
  }
} else {
  console.warn('.env file not found at', envPath);
}

// Validate required environment variables
const requiredEnvVars = [
  'SESSION_SECRET',
  'PORT',
  'UPLOAD_DIR'
];

const missingVars = requiredEnvVars.filter(
  varName => !process.env[varName]
);

if (missingVars.length > 0) {
  console.warn('Missing required environment variables:', missingVars.join(', '));
  
  // Set default values for development
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
}

// Optional environment variables
const optionalEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'RESEND_API_KEY',
  'EMAIL_FROM'
];

const missingOptionalVars = optionalEnvVars.filter(
  varName => !process.env[varName]
);

if (missingOptionalVars.length > 0) {
  console.warn('Missing optional environment variables:', missingOptionalVars.join(', '));
  
  // Set placeholder values for development
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
}

// Render PostgreSQL Database Connection Details
const RENDER_PG_HOST = process.env.PG_HOST || 'dpg-d1024gogjchc73a9eo6g-a.oregon-postgres.render.com';
const RENDER_PG_PORT = process.env.PG_PORT || '5432';
const RENDER_PG_DATABASE = process.env.PG_DATABASE || 'users_prm7';
const RENDER_PG_USER = process.env.PG_USER || 'users_prm7_user';
const RENDER_PG_PASSWORD = process.env.PG_PASSWORD || 'krKMHgU02iuLN8jv1Y7O81gJlrCPSow3';
const RENDER_PG_CONNECTION_STRING = process.env.DATABASE_URL || 
  `postgresql://${RENDER_PG_USER}:${RENDER_PG_PASSWORD}@${RENDER_PG_HOST}/${RENDER_PG_DATABASE}`;

// Export environment variables for use in other modules
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: RENDER_PG_CONNECTION_STRING,
  SESSION_SECRET: process.env.SESSION_SECRET || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  PGHOST: RENDER_PG_HOST,
  PGPORT: parseInt(RENDER_PG_PORT, 10),
  PGUSER: RENDER_PG_USER,
  PGPASSWORD: RENDER_PG_PASSWORD,
  PGDATABASE: RENDER_PG_DATABASE,
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'onboarding@resend.dev'
};
