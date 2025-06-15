// Script to check and fix passwords that were hashed with bcrypt instead of the custom hashPassword function
import { config } from 'dotenv';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { promisify } from 'util';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: join(__dirname, '.env') });

// Promisify scrypt
const scryptAsync = promisify(crypto.scrypt);

// Recreate the hashPassword function from auth.ts
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

// Function to check if a password was hashed with bcrypt
function isBcryptHash(hash) {
  return hash.startsWith('$2');
}

async function fixPasswords() {
  try {
    // Connect to database
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.error('DATABASE_URL not found in environment variables');
      process.exit(1);
    }

    console.log('Connecting to database...');
    const sql = postgres(connectionString, {
      ssl: true,
    });

    // Get all users
    console.log('Fetching users...');
    const users = await sql`SELECT id, email, password FROM users`;
    console.log(`Found ${users.length} users`);

    // Check each user's password hash
    let bcryptCount = 0;
    let scryptCount = 0;
    let fixedCount = 0;
    
    for (const user of users) {
      if (isBcryptHash(user.password)) {
        bcryptCount++;
        console.log(`User ${user.email} has a bcrypt password hash`);
        
        try {
          // We can't convert bcrypt hashes directly to scrypt
          // Instead, we'll set a temporary password and inform the user
          const tempPassword = crypto.randomBytes(8).toString('hex');
          const newHash = await hashPassword(tempPassword);
          
          // Update the user's password hash
          await sql`UPDATE users SET password = ${newHash} WHERE id = ${user.id}`;
          
          console.log(`Fixed user ${user.email} with temporary password: ${tempPassword}`);
          fixedCount++;
        } catch (err) {
          console.error(`Error fixing password for ${user.email}:`, err);
        }
      } else {
        scryptCount++;
      }
    }

    console.log('\nPassword Hash Summary:');
    console.log(`Total users: ${users.length}`);
    console.log(`Users with scrypt hashes: ${scryptCount}`);
    console.log(`Users with bcrypt hashes: ${bcryptCount}`);
    console.log(`Users fixed with temporary passwords: ${fixedCount}`);
    
    if (fixedCount > 0) {
      console.log('\nIMPORTANT: Some users had their passwords reset to temporary values.');
      console.log('They will need to use the "Forgot Password" feature to set a new password.');
    } else {
      console.log('\nNo password fixes were needed. All passwords are using the correct hashing algorithm.');
    }

    // Close connection
    await sql.end();
  } catch (error) {
    console.error('Error checking/fixing passwords:', error);
  }
}

// Run the function
fixPasswords(); 