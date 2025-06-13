import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configure the connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  webSocketConstructor: ws
});

async function createOwnershipClaimsTable() {
  try {
    console.log('Creating ownership_claims table...');
    
    const createTableSQL = `
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
      );
    `;
    
    await pool.query(createTableSQL);
    console.log('Successfully created ownership_claims table');
    
    // Check if table exists and show structure
    const checkTable = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'ownership_claims'
      ORDER BY ordinal_position;
    `);
    
    console.log('Table structure:');
    console.table(checkTable.rows);
    
  } catch (error) {
    console.error('Error creating ownership_claims table:', error);
  } finally {
    await pool.end();
  }
}

createOwnershipClaimsTable();