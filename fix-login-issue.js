/**
 * Fix login issue by updating password format and testing authentication
 */

import { db } from './server/db.ts';
import { users } from './shared/schema.ts';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Updated password functions that match the expected format
async function hashPasswordCorrectFormat(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswordsDebug(supplied, stored) {
  console.log(`Comparing password for format: ${stored.substring(0, 20)}...`);
  
  let salt, hashed;
  
  if (stored.includes(".")) {
    [hashed, salt] = stored.split(".");
    console.log(`Using format: hash.salt`);
  } else if (stored.includes(":")) {
    [salt, hashed] = stored.split(":");
    console.log(`Using format: salt:hash`);
  } else {
    throw new Error("Invalid stored password format");
  }
  
  console.log(`Salt: ${salt}, Hash: ${hashed.substring(0, 20)}...`);
  
  if (!salt || !hashed) {
    throw new Error("Invalid stored password format - missing salt or hash");
  }
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

async function fixLoginIssue() {
  try {
    console.log('🔧 Fixing login issue for gmachuret@gmail.com...');
    
    // First, check the current user
    const currentUser = await db.select().from(users).where(eq(users.email, 'gmachuret@gmail.com')).limit(1);
    
    if (currentUser.length === 0) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('👤 Current user:', {
      id: currentUser[0].id,
      email: currentUser[0].email,
      role: currentUser[0].role,
      passwordFormat: currentUser[0].password.substring(0, 20) + '...'
    });
    
    // Test the current password
    try {
      const isValid = await comparePasswordsDebug('test123', currentUser[0].password);
      console.log('🔑 Password validation result:', isValid);
      
      if (isValid) {
        console.log('✅ Password is correct, authentication should work');
        return;
      }
    } catch (error) {
      console.log('❌ Error testing password:', error.message);
    }
    
    // If password test failed, recreate with correct format
    console.log('🔄 Recreating password with correct format...');
    
    const correctPassword = await hashPasswordCorrectFormat('test123');
    console.log('🔑 New password hash format:', correctPassword.substring(0, 20) + '...');
    
    // Update the user with correct password format
    await db.update(users)
      .set({
        password: correctPassword,
        updatedAt: new Date()
      })
      .where(eq(users.email, 'gmachuret@gmail.com'));
    
    console.log('✅ Password updated successfully');
    
    // Test the new password
    const testResult = await comparePasswordsDebug('test123', correctPassword);
    console.log('🧪 New password test result:', testResult);
    
    // Also update the backup admin account
    const adminPassword = await hashPasswordCorrectFormat('admin123');
    await db.update(users)
      .set({
        password: adminPassword,
        updatedAt: new Date()
      })
      .where(eq(users.email, 'admin@businesshub.com'));
    
    console.log('✅ Backup admin password also updated');
    
    console.log('\n🎉 Login should now work with:');
    console.log('Email: gmachuret@gmail.com');
    console.log('Password: test123');
    
  } catch (error) {
    console.error('❌ Failed to fix login issue:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

fixLoginIssue();