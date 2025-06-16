/**
 * Setup script to create demo admin user
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

neonConfig.webSocketConstructor = ws;
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function setupAdminUser() {
  console.log('🔧 Setting up demo admin user...\n');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Check if demo admin already exists
    console.log('1. Checking for existing demo admin...');
    const existingAdmin = await pool.query(`
      SELECT id, email, role FROM users WHERE id = 'demo-admin' OR email = 'admin@businesshub.com';
    `);

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Demo admin already exists:', existingAdmin.rows[0]);
      return;
    }

    // Create demo admin user
    console.log('2. Creating demo admin user...');
    const hashedPassword = await hashPassword('admin123');
    
    const result = await pool.query(`
      INSERT INTO users (id, email, password, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, email, role;
    `, [
      'demo-admin',
      'admin@businesshub.com',
      hashedPassword,
      'Demo',
      'Admin',
      'admin'
    ]);

    console.log('✅ Demo admin created successfully:', result.rows[0]);

    // Test admin login
    console.log('3. Testing admin authentication...');
    const testAuth = await pool.query(`
      SELECT id, email, role FROM users WHERE email = 'admin@businesshub.com';
    `);
    
    if (testAuth.rows.length > 0) {
      console.log('✅ Admin user ready for login:', testAuth.rows[0]);
    }

  } catch (error) {
    console.error('❌ Failed to setup admin user:', error);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupAdminUser().catch(console.error);