/**
 * Setup script to create demo admin user
 */

import bcrypt from 'bcrypt';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function setupAdminUser() {
  console.log('Creating demo admin user...\n');
  
  try {
    const hashedPassword = await hashPassword('admin123');
    
    // Insert admin user
    const adminResult = await pool.query(`
      INSERT INTO users (id, email, password, first_name, last_name, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role
      RETURNING id, email, role
    `, ['admin-demo', 'admin@demo.com', hashedPassword, 'Demo', 'Admin', 'admin']);
    
    console.log('✅ Admin user created/updated:', adminResult.rows[0]);
    
    // Create test user with correct password
    const testUserPassword = await hashPassword('password123');
    const testUserResult = await pool.query(`
      INSERT INTO users (id, email, password, first_name, last_name, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password
      RETURNING id, email, role
    `, ['militardataintelligence', 'militardataintelligence@gmail.com', testUserPassword, 'Military', 'Data Intelligence', 'user']);
    
    console.log('✅ Test user created/updated:', testUserResult.rows[0]);
    
    // Get some businesses to assign
    const businessResult = await pool.query('SELECT placeid, title FROM businesses LIMIT 3');
    console.log(`Found ${businessResult.rows.length} businesses to assign`);
    
    if (businessResult.rows.length > 0) {
      // Assign first 2 businesses to test user
      const businessesToAssign = businessResult.rows.slice(0, 2);
      
      for (const business of businessesToAssign) {
        await pool.query(
          'UPDATE businesses SET ownerid = $1 WHERE placeid = $2',
          [testUserResult.rows[0].id, business.placeid]
        );
        console.log(`✅ Assigned business "${business.title}" to test user`);
      }
      
      // Create ownership claim
      await pool.query(`
        INSERT INTO ownership_claims (user_id, business_id, message, status, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT DO NOTHING
      `, [
        testUserResult.rows[0].id,
        businessResult.rows[0].placeid,
        'I am the rightful owner of this business and need to claim it for management purposes.',
        'pending'
      ]);
      console.log('✅ Created ownership claim');
    }
    
    console.log('\n🎯 Setup completed! Credentials:');
    console.log('Admin: admin@demo.com / admin123');
    console.log('Test User: militardataintelligence@gmail.com / password123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await pool.end();
  }
}

setupAdminUser();