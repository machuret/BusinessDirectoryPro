import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  webSocketConstructor: ws
});

async function createLeadsTable() {
  try {
    console.log('Creating leads table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        business_id TEXT NOT NULL,
        sender_name VARCHAR NOT NULL,
        sender_email VARCHAR NOT NULL,
        sender_phone VARCHAR,
        message TEXT NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'new',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Leads table created successfully');

    // Insert some sample data for testing
    await pool.query(`
      INSERT INTO leads (business_id, sender_name, sender_email, sender_phone, message, status)
      VALUES 
        ('ChIJ_1749698180012_ajf9qXLdI', 'John Smith', 'john.smith@email.com', '+1234567890', 'Hi, I would like to book an appointment for a dental cleaning. What are your available times this week?', 'new'),
        ('ChIJdRBTL1FYkWsRruDMKlIR1Gc', 'Sarah Johnson', 'sarah.j@email.com', '+1987654321', 'I need information about your cosmetic dentistry services, particularly teeth whitening options.', 'contacted'),
        ('ChIJ_baJ4jlYkWsRZsxcUxqGVYE', 'Mike Wilson', 'mike.wilson@email.com', NULL, 'Do you accept my insurance plan? I have BlueCross BlueShield.', 'new')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Sample leads inserted');
    process.exit(0);
  } catch (error) {
    console.error('Error creating leads table:', error);
    process.exit(1);
  }
}

createLeadsTable();