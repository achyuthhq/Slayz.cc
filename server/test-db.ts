// Simple script to test database connection and user retrieval
import { db } from "./pg-db";
import { storage } from "./pg-storage";
import { sql } from "drizzle-orm";

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic database connection
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('Database connection successful:', result[0]?.test === 1);
    
    // Test user retrieval
    console.log('\nTesting user retrieval:');
    const users = await storage.getAllUsers();
    console.log(`Found ${users.length} users in the database`);
    
    if (users.length > 0) {
      console.log('Sample user data (first user):');
      const { password, ...userWithoutPassword } = users[0];
      console.log(JSON.stringify(userWithoutPassword, null, 2));
      
      // Test page view count
      const viewCount = await storage.getUserViewCount(users[0].id);
      console.log(`User ${users[0].username} has ${viewCount} page views`);
      
      // Test leaderboard function
      console.log('\nTesting leaderboard function:');
      const leaderboard = await storage.getUsersWithViewCounts();
      console.log(`Leaderboard returned ${leaderboard.length} users`);
      
      if (leaderboard.length > 0) {
        console.log('Sample leaderboard entry (first user):');
        const { password: pwd, ...leaderWithoutPassword } = leaderboard[0];
        console.log(JSON.stringify(leaderWithoutPassword, null, 2));
      }
    }
    
    console.log('\nDatabase tests completed');
  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 