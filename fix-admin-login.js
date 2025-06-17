/**
 * Fix admin login by resetting the admin user password with correct hash
 */

import { storage } from './server/storage/index.js';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function fixAdminLogin() {
  try {
    console.log('Fixing admin login...');
    
    // Hash the admin password correctly
    const hashedPassword = await hashPassword('admin123');
    
    // Update the admin user with the correct password hash
    const adminUser = {
      id: 'demo-admin',
      email: 'admin@businesshub.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    };
    
    // Use upsert to create or update the admin user
    await storage.upsertUser(adminUser);
    
    console.log('✅ Admin user password fixed successfully');
    console.log('Login credentials:');
    console.log('Email: admin@businesshub.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Failed to fix admin login:', error.message);
  }
  
  process.exit(0);
}

fixAdminLogin();