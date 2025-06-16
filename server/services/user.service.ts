import { storage } from "../storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { User, UpsertUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

/**
 * User Management Service Layer
 * Handles business logic for user operations including password hashing and validation
 */

/**
 * Securely hashes a password using scrypt with random salt
 * @param password - The plain text password to hash
 * @returns Promise with the hashed password and salt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  } catch (error) {
    console.error('[USER SERVICE] Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compares a plain text password with a hashed password
 * @param suppliedPassword - The plain text password to verify
 * @param storedPassword - The stored hashed password with salt
 * @returns Promise with boolean indicating if passwords match
 */
export async function verifyPassword(suppliedPassword: string, storedPassword: string): Promise<boolean> {
  try {
    const [hashed, salt] = storedPassword.split(".");
    if (!hashed || !salt) {
      throw new Error('Invalid password format');
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('[USER SERVICE] Error verifying password:', error);
    return false;
  }
}

/**
 * Validates user creation data
 * @param userData - The user data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateUserCreation(userData: any): { isValid: boolean; error?: string } {
  if (!userData.email || userData.email.trim().length === 0) {
    return { isValid: false, error: "Email is required" };
  }

  // Basic email format validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(userData.email)) {
    return { isValid: false, error: "Invalid email format" };
  }

  if (userData.password && userData.password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long" };
  }

  // Validate role if provided
  const validRoles = ['admin', 'user', 'suspended'];
  if (userData.role && !validRoles.includes(userData.role)) {
    return { isValid: false, error: "Invalid user role" };
  }

  return { isValid: true };
}

/**
 * Validates user update data
 * @param userData - The user data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateUserUpdate(userData: any): { isValid: boolean; error?: string } {
  if (userData.email !== undefined) {
    if (userData.email.trim().length === 0) {
      return { isValid: false, error: "Email cannot be empty" };
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(userData.email)) {
      return { isValid: false, error: "Invalid email format" };
    }
  }

  // Validate role if provided
  if (userData.role !== undefined) {
    const validRoles = ['admin', 'user', 'suspended'];
    if (!validRoles.includes(userData.role)) {
      return { isValid: false, error: "Invalid user role" };
    }
  }

  return { isValid: true };
}

/**
 * Creates a new user with validation and password hashing
 * @param userData - The user data including email, password, firstName, lastName, etc.
 * @returns Promise with the created user
 */
export async function createUser(userData: any): Promise<User> {
  console.log('[USER SERVICE] Creating new user:', { email: userData.email, role: userData.role });

  // Validate user creation data
  const validation = validateUserCreation(userData);
  if (!validation.isValid) {
    console.log('[USER SERVICE] User creation validation failed:', validation.error);
    throw new Error(validation.error);
  }

  try {
    // Check if email already exists
    const existingUserByEmail = await storage.getUserByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error(`A user with email "${userData.email}" already exists`);
    }

    // Generate unique user ID
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare user data with hashed password
    const createData: UpsertUser = {
      id: userId,
      email: userData.email.trim().toLowerCase(),
      firstName: userData.firstName?.trim() || null,
      lastName: userData.lastName?.trim() || null,
      role: userData.role || 'user',
      profileImageUrl: userData.profileImageUrl || null,
    };

    // Hash password if provided
    if (userData.password) {
      createData.password = await hashPassword(userData.password);
    }

    const user = await storage.createUser(createData);
    console.log('[USER SERVICE] Successfully created user:', { id: user.id, email: user.email, role: user.role });

    return user;
  } catch (error) {
    console.error('[USER SERVICE] Error creating user:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to create user');
  }
}

/**
 * Updates an existing user with validation
 * @param userId - The user ID to update
 * @param userData - The partial user data to update
 * @returns Promise with the updated user
 */
export async function updateUser(userId: string, userData: any): Promise<User> {
  console.log('[USER SERVICE] Updating user:', { id: userId, updates: Object.keys(userData) });

  // Validate user update data
  const validation = validateUserUpdate(userData);
  if (!validation.isValid) {
    console.log('[USER SERVICE] User update validation failed:', validation.error);
    throw new Error(validation.error);
  }

  try {
    // Check if user exists
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check email uniqueness if email is being updated
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await storage.getUserByEmail(userData.email);
      if (userWithEmail && userWithEmail.id !== userId) {
        throw new Error(`A user with email "${userData.email}" already exists`);
      }
    }

    // Prepare update data
    const updateData: Partial<UpsertUser> = {};
    
    if (userData.email !== undefined) updateData.email = userData.email.trim().toLowerCase();
    if (userData.firstName !== undefined) updateData.firstName = userData.firstName?.trim() || null;
    if (userData.lastName !== undefined) updateData.lastName = userData.lastName?.trim() || null;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.profileImageUrl !== undefined) updateData.profileImageUrl = userData.profileImageUrl || null;

    // Note: Password is not updated here - use updateUserPassword for that
    if (userData.password !== undefined) {
      console.warn('[USER SERVICE] Password update attempted through updateUser - use updateUserPassword instead');
    }

    const updatedUser = await storage.updateUser(userId, updateData);
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    console.log('[USER SERVICE] Successfully updated user:', { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });

    return updatedUser;
  } catch (error) {
    console.error('[USER SERVICE] Error updating user:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to update user');
  }
}

/**
 * Updates a user's password with proper validation and hashing
 * @param userId - The user ID whose password to update
 * @param newPassword - The new plain text password
 * @returns Promise that resolves when password is updated
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  console.log('[USER SERVICE] Updating user password:', { id: userId });

  try {
    // Validate password
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user exists
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password
    const updatedUser = await storage.updateUser(userId, { password: hashedPassword });
    if (!updatedUser) {
      throw new Error('Failed to update user password');
    }

    console.log('[USER SERVICE] Successfully updated user password:', { id: userId });

  } catch (error) {
    console.error('[USER SERVICE] Error updating user password:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to update user password');
  }
}

/**
 * Deletes a user with proper validation
 * @param userId - The user ID to delete
 * @returns Promise that resolves when user is deleted
 */
export async function deleteUser(userId: string): Promise<void> {
  console.log('[USER SERVICE] Deleting user:', { id: userId });

  try {
    // Check if user exists
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Additional business rules can be added here
    // For example: prevent deletion of the last admin user
    if (existingUser.role === 'admin') {
      const allUsers = await storage.getAllUsers();
      const adminUsers = allUsers.filter(user => user.role === 'admin');
      if (adminUsers.length === 1) {
        throw new Error('Cannot delete the last admin user');
      }
    }

    await storage.deleteUser(userId);
    console.log('[USER SERVICE] Successfully deleted user:', { id: userId, email: existingUser.email });

  } catch (error) {
    console.error('[USER SERVICE] Error deleting user:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to delete user');
  }
}

/**
 * Performs mass actions on multiple users
 * @param userIds - Array of user IDs to perform action on
 * @param action - The action to perform ('suspend', 'activate', 'delete')
 * @returns Promise with summary of actions performed
 */
export async function performMassUserAction(userIds: string[], action: string): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('[USER SERVICE] Performing mass user action:', { action, userCount: userIds.length });

  // Validate input
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error('User IDs array is required');
  }

  if (!['suspend', 'activate', 'delete'].includes(action)) {
    throw new Error('Invalid action: must be suspend, activate, or delete');
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Check for admin protection if deleting
  if (action === 'delete') {
    const allUsers = await storage.getAllUsers();
    const adminUsers = allUsers.filter(user => user.role === 'admin');
    const adminUserIds = adminUsers.map(user => user.id);
    const adminsToDelete = userIds.filter(id => adminUserIds.includes(id));
    
    if (adminsToDelete.length >= adminUsers.length) {
      throw new Error('Cannot delete all admin users');
    }
  }

  for (const userId of userIds) {
    try {
      if (action === 'delete') {
        await deleteUser(userId);
      } else {
        const role = action === 'suspend' ? 'suspended' : 'user';
        await updateUser(userId, { role });
      }
      results.success++;
    } catch (error) {
      results.failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`User ${userId}: ${errorMessage}`);
      console.error(`[USER SERVICE] Failed to ${action} user ${userId}:`, error);
    }
  }

  console.log('[USER SERVICE] Mass action completed:', { 
    action, 
    success: results.success, 
    failed: results.failed 
  });

  return results;
}

/**
 * Assigns businesses to a user
 * @param userId - The user ID to assign businesses to
 * @param businessIds - Array of business IDs to assign
 * @returns Promise with summary of assignments
 */
export async function assignBusinessesToUser(userId: string, businessIds: string[]): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('[USER SERVICE] Assigning businesses to user:', { userId, businessCount: businessIds.length });

  // Validate input
  if (!Array.isArray(businessIds) || businessIds.length === 0) {
    throw new Error('Business IDs array is required');
  }

  // Check if user exists
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const businessId of businessIds) {
    try {
      await storage.updateBusiness(businessId, { ownerid: userId });
      results.success++;
    } catch (error) {
      results.failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`Business ${businessId}: ${errorMessage}`);
      console.error(`[USER SERVICE] Failed to assign business ${businessId} to user ${userId}:`, error);
    }
  }

  console.log('[USER SERVICE] Business assignment completed:', { 
    userId, 
    success: results.success, 
    failed: results.failed 
  });

  return results;
}

/**
 * Gets all users with optional filtering
 * @param role - Optional role filter
 * @returns Promise with array of users
 */
export async function getAllUsers(role?: string): Promise<User[]> {
  try {
    // Validate role filter if provided
    if (role && !['admin', 'user', 'suspended'].includes(role)) {
      throw new Error('Invalid role filter: must be admin, user, or suspended');
    }

    const users = await storage.getAllUsers();
    
    // Apply role filter if specified
    const filteredUsers = role ? users.filter(user => user.role === role) : users;
    
    console.log('[USER SERVICE] Retrieved users:', { count: filteredUsers.length, role: role || 'all' });

    return filteredUsers;
  } catch (error) {
    console.error('[USER SERVICE] Error retrieving users:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to retrieve users');
  }
}

/**
 * Gets a single user by ID with validation
 * @param userId - The user ID to retrieve
 * @returns Promise with the user or undefined if not found
 */
export async function getUserById(userId: string): Promise<User | undefined> {
  try {
    const user = await storage.getUser(userId);
    
    if (user) {
      console.log('[USER SERVICE] Retrieved user by ID:', { id: user.id, email: user.email, role: user.role });
    } else {
      console.log('[USER SERVICE] User not found by ID:', { id: userId });
    }

    return user;
  } catch (error) {
    console.error('[USER SERVICE] Error retrieving user by ID:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to retrieve user');
  }
}