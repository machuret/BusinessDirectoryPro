/**
 * Create user for gmachuret@gmail.com with admin privileges
 */

import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${salt}:${buf.toString('hex')}`;
}

async function createUser() {
  try {
    console.log('Creating user account for gmachuret@gmail.com...');
    
    // Hash password for test123
    const hashedPassword = await hashPassword('test123');
    const userId = `user_${Date.now()}`;
    
    // Create/update user with admin role
    const [user] = await db.insert(users).values({
      id: userId,
      email: 'gmachuret@gmail.com',
      password: hashedPassword,
      firstName: 'Gabriel',
      lastName: 'Machuret',
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
    
    console.log('✅ User created/updated successfully:', {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`
    });
    
    console.log('\n🔑 Login credentials:');
    console.log('Email: gmachuret@gmail.com');
    console.log('Password: test123');
    console.log('Role: admin');
    
    // Also create a backup admin account
    const adminHashedPassword = await hashPassword('admin123');
    const adminId = `admin_${Date.now()}`;
    
    const [admin] = await db.insert(users).values({
      id: adminId,
      email: 'admin@businesshub.com',
      password: adminHashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: users.email,
      set: {
        role: 'admin',
        password: adminHashedPassword,
        updatedAt: new Date()
      }
    }).returning();
    
    console.log('\n✅ Backup admin account created:');
    console.log('Email: admin@businesshub.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('❌ Failed to create user:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

createUser();