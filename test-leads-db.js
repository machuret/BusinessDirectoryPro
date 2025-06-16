/**
 * Test script to verify leads are stored in the database
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function testLeadsDatabase() {
  console.log('🔍 Testing leads database storage...\n');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // 1. Check if leads table exists
    console.log('1. Checking if leads table exists...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'leads'
      );
    `);
    console.log(`   Table exists: ${tableCheck.rows[0].exists}`);

    if (!tableCheck.rows[0].exists) {
      console.log('   ❌ Leads table does not exist!');
      return;
    }

    // 2. Check table structure
    console.log('\n2. Checking table structure...');
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'leads' 
      ORDER BY ordinal_position;
    `);
    console.log('   Columns:');
    structure.rows.forEach(col => {
      console.log(`     - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // 3. Count total leads
    console.log('\n3. Counting total leads...');
    const count = await pool.query('SELECT COUNT(*) FROM leads;');
    console.log(`   Total leads: ${count.rows[0].count}`);

    // 4. Get recent leads
    console.log('\n4. Fetching recent leads...');
    const leads = await pool.query(`
      SELECT 
        id, 
        business_id, 
        sender_name, 
        sender_email, 
        message,
        status,
        created_at
      FROM leads 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);

    if (leads.rows.length === 0) {
      console.log('   ❌ No leads found in database');
    } else {
      console.log(`   ✅ Found ${leads.rows.length} recent leads:`);
      leads.rows.forEach((lead, index) => {
        console.log(`     ${index + 1}. ID: ${lead.id}`);
        console.log(`        Business: ${lead.business_id}`);
        console.log(`        From: ${lead.sender_name} (${lead.sender_email})`);
        console.log(`        Message: ${lead.message.substring(0, 50)}...`);
        console.log(`        Status: ${lead.status}`);
        console.log(`        Created: ${lead.created_at}`);
        console.log('');
      });
    }

    // 5. Test lead creation with sample data
    console.log('5. Testing lead creation...');
    const testLead = await pool.query(`
      INSERT INTO leads (business_id, sender_name, sender_email, sender_phone, message, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, business_id, sender_name, sender_email;
    `, [
      'test-business-id',
      'Test User',
      'test@example.com',
      '+1234567890',
      'This is a test lead to verify database functionality',
      'new'
    ]);
    console.log(`   ✅ Test lead created with ID: ${testLead.rows[0].id}`);

    // 6. Clean up test lead
    await pool.query('DELETE FROM leads WHERE business_id = $1', ['test-business-id']);
    console.log('   ✅ Test lead cleaned up');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testLeadsDatabase().catch(console.error);