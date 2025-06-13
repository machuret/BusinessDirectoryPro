import { db } from './db';
import { sql } from 'drizzle-orm';

export async function createOwnershipClaimsTable() {
  try {
    console.log('Creating ownership_claims table...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ownership_claims (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_id TEXT NOT NULL REFERENCES businesses(placeid) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending',
        message TEXT,
        admin_message TEXT,
        reviewed_by TEXT REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('Successfully created ownership_claims table');
    return true;
  } catch (error) {
    console.error('Error creating ownership_claims table:', error);
    return false;
  }
}