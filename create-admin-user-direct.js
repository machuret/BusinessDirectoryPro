/**
 * Create admin user directly through API with proper role assignment
 */

import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    console.log('Creating admin user with proper permissions...');
    
    const hashedPassword = await hashPassword('admin123');
    const adminId = `admin_${Date.now()}`;
    
    const [admin] = await db.insert(users).values({
      id: adminId,
      email: 'admin@businesshub.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: users.email,
      set: {
        role: 'admin',
        password: hashedPassword,
        updatedAt: new Date()
      }
    }).returning();
    
    console.log('Admin user created/updated:', {
      id: admin.id,
      email: admin.email,
      role: admin.role
    });
    
    console.log('Admin credentials:');
    console.log('Email: admin@businesshub.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
  }
  
  process.exit(0);
}

createAdminUser();