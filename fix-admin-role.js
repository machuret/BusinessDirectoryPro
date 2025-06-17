/**
 * Fix admin role assignment directly in the database
 */
import { db } from './server/db.ts';
import { users } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

async function fixAdminRole() {
  try {
    console.log('Updating user role to admin...');
    
    // Update the most recent admin user
    const result = await db
      .update(users)
      .set({ role: 'admin', updatedAt: new Date() })
      .where(eq(users.email, 'admin-final@test.com'))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Admin role updated successfully:', result[0]);
    } else {
      console.log('❌ No user found with that email');
    }
    
    // Verify the update
    const user = await db.select().from(users).where(eq(users.email, 'admin-final@test.com'));
    console.log('Current user data:', user[0]);
    
  } catch (error) {
    console.error('Error updating admin role:', error);
  }
  
  process.exit(0);
}

fixAdminRole();