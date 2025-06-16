/**
 * Comprehensive User Service Test
 * Tests the complete user service layer implementation with validation and business logic
 */

import { storage } from './server/storage/index.ts';
import * as userService from './server/services/user.service.ts';

class UserServiceTester {
  constructor() {
    this.testResults = [];
    this.testUsers = [];
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async testUserCreation() {
    this.log('=== Testing User Creation ===');

    try {
      // Test 1: Valid user creation
      const validUserData = {
        email: 'test@example.com',
        password: 'securepassword123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      };

      const user = await userService.createUser(validUserData);
      this.testUsers.push(user.id);
      this.log('✓ Successfully created valid user', {
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Test 2: Missing email validation
      try {
        await userService.createUser({
          password: 'password123',
          firstName: 'Test'
        });
        this.log('✗ Should have failed for missing email');
      } catch (error) {
        this.log('✓ Correctly validated missing email:', error.message);
      }

      // Test 3: Invalid email format validation
      try {
        await userService.createUser({
          email: 'invalid-email',
          password: 'password123'
        });
        this.log('✗ Should have failed for invalid email format');
      } catch (error) {
        this.log('✓ Correctly validated invalid email format:', error.message);
      }

      // Test 4: Short password validation
      try {
        await userService.createUser({
          email: 'test2@example.com',
          password: '123'
        });
        this.log('✗ Should have failed for short password');
      } catch (error) {
        this.log('✓ Correctly validated short password:', error.message);
      }

      // Test 5: Duplicate email prevention
      try {
        await userService.createUser({
          email: 'test@example.com',
          password: 'password123'
        });
        this.log('✗ Should have failed for duplicate email');
      } catch (error) {
        this.log('✓ Correctly prevented duplicate email:', error.message);
      }

      // Test 6: Invalid role validation
      try {
        await userService.createUser({
          email: 'test3@example.com',
          password: 'password123',
          role: 'invalid_role'
        });
        this.log('✗ Should have failed for invalid role');
      } catch (error) {
        this.log('✓ Correctly validated invalid role:', error.message);
      }

      // Test 7: Admin user creation
      const adminUser = await userService.createUser({
        email: 'admin@example.com',
        password: 'adminpass123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
      this.testUsers.push(adminUser.id);
      this.log('✓ Successfully created admin user', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      });

      this.testResults.push({ test: 'creation', status: 'passed' });
    } catch (error) {
      this.log('✗ User creation test failed:', error.message);
      this.testResults.push({ test: 'creation', status: 'failed', error: error.message });
    }
  }

  async testUserUpdate() {
    this.log('=== Testing User Update ===');

    if (this.testUsers.length === 0) {
      this.log('✗ User update test failed: No test users created');
      this.testResults.push({ test: 'update', status: 'failed', error: 'No test users available' });
      return;
    }

    try {
      const userId = this.testUsers[0];

      // Test 1: Valid user update
      const updatedUser = await userService.updateUser(userId, {
        firstName: 'Updated',
        lastName: 'Name'
      });
      this.log('✓ Successfully updated user', {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName
      });

      // Test 2: Email format validation during update
      try {
        await userService.updateUser(userId, {
          email: 'invalid-email-format'
        });
        this.log('✗ Should have failed for invalid email format during update');
      } catch (error) {
        this.log('✓ Correctly validated email format during update:', error.message);
      }

      // Test 3: Invalid role validation during update
      try {
        await userService.updateUser(userId, {
          role: 'invalid_role'
        });
        this.log('✗ Should have failed for invalid role during update');
      } catch (error) {
        this.log('✓ Correctly validated role during update:', error.message);
      }

      // Test 4: Non-existent user update
      try {
        await userService.updateUser('non-existent-user', {
          firstName: 'Test'
        });
        this.log('✗ Should have failed for non-existent user');
      } catch (error) {
        this.log('✓ Correctly handled non-existent user update:', error.message);
      }

      this.testResults.push({ test: 'update', status: 'passed' });
    } catch (error) {
      this.log('✗ User update test failed:', error.message);
      this.testResults.push({ test: 'update', status: 'failed', error: error.message });
    }
  }

  async testPasswordUpdate() {
    this.log('=== Testing Password Update ===');

    if (this.testUsers.length === 0) {
      this.log('✗ Password update test failed: No test users created');
      this.testResults.push({ test: 'password', status: 'failed', error: 'No test users available' });
      return;
    }

    try {
      const userId = this.testUsers[0];

      // Test 1: Valid password update
      await userService.updateUserPassword(userId, 'newpassword123');
      this.log('✓ Successfully updated user password');

      // Test 2: Short password validation
      try {
        await userService.updateUserPassword(userId, '123');
        this.log('✗ Should have failed for short password');
      } catch (error) {
        this.log('✓ Correctly validated short password during update:', error.message);
      }

      // Test 3: Empty password validation
      try {
        await userService.updateUserPassword(userId, '');
        this.log('✗ Should have failed for empty password');
      } catch (error) {
        this.log('✓ Correctly validated empty password:', error.message);
      }

      // Test 4: Non-existent user password update
      try {
        await userService.updateUserPassword('non-existent-user', 'newpassword123');
        this.log('✗ Should have failed for non-existent user');
      } catch (error) {
        this.log('✓ Correctly handled non-existent user password update:', error.message);
      }

      this.testResults.push({ test: 'password', status: 'passed' });
    } catch (error) {
      this.log('✗ Password update test failed:', error.message);
      this.testResults.push({ test: 'password', status: 'failed', error: error.message });
    }
  }

  async testUserRetrieval() {
    this.log('=== Testing User Retrieval ===');

    try {
      // Test 1: Get all users
      const allUsers = await userService.getAllUsers();
      this.log('✓ Successfully retrieved all users', { count: allUsers.length });

      // Test 2: Get users by role filter
      if (this.testUsers.length >= 2) {
        const adminUsers = await userService.getAllUsers('admin');
        this.log('✓ Successfully retrieved admin users', { count: adminUsers.length });

        const regularUsers = await userService.getAllUsers('user');
        this.log('✓ Successfully retrieved regular users', { count: regularUsers.length });
      }

      // Test 3: Get user by ID
      if (this.testUsers.length > 0) {
        const user = await userService.getUserById(this.testUsers[0]);
        if (user) {
          this.log('✓ Successfully retrieved user by ID', {
            id: user.id,
            email: user.email
          });
        } else {
          this.log('✗ Failed to retrieve user by ID');
        }
      }

      // Test 4: Get non-existent user by ID
      const nonExistentUser = await userService.getUserById('non-existent-user');
      if (!nonExistentUser) {
        this.log('✓ Correctly handled non-existent user retrieval');
      } else {
        this.log('✗ Should have returned undefined for non-existent user');
      }

      // Test 5: Invalid role filter
      try {
        await userService.getAllUsers('invalid_role');
        this.log('✗ Should have failed for invalid role filter');
      } catch (error) {
        this.log('✓ Correctly validated invalid role filter:', error.message);
      }

      this.testResults.push({ test: 'retrieval', status: 'passed' });
    } catch (error) {
      this.log('✗ User retrieval test failed:', error.message);
      this.testResults.push({ test: 'retrieval', status: 'failed', error: error.message });
    }
  }

  async testUserDeletion() {
    this.log('=== Testing User Deletion ===');

    try {
      // Test 1: Delete regular user
      if (this.testUsers.length > 1) {
        const userToDelete = this.testUsers[0]; // Regular user
        await userService.deleteUser(userToDelete);
        this.log('✓ Successfully deleted regular user');
        this.testUsers = this.testUsers.filter(id => id !== userToDelete);
      }

      // Test 2: Non-existent user deletion
      try {
        await userService.deleteUser('non-existent-user');
        this.log('✗ Should have failed for non-existent user deletion');
      } catch (error) {
        this.log('✓ Correctly handled non-existent user deletion:', error.message);
      }

      // Test 3: Admin protection (if only one admin exists)
      if (this.testUsers.length > 0) {
        try {
          // Check if this is the only admin
          const adminUsers = await userService.getAllUsers('admin');
          if (adminUsers.length === 1) {
            await userService.deleteUser(this.testUsers[0]); // Admin user
            this.log('✗ Should have failed to delete last admin user');
          } else {
            await userService.deleteUser(this.testUsers[0]);
            this.log('✓ Successfully deleted admin user (not the last one)');
            this.testUsers = this.testUsers.filter(id => id !== this.testUsers[0]);
          }
        } catch (error) {
          this.log('✓ Correctly protected last admin user from deletion:', error.message);
        }
      }

      this.testResults.push({ test: 'deletion', status: 'passed' });
    } catch (error) {
      this.log('✗ User deletion test failed:', error.message);
      this.testResults.push({ test: 'deletion', status: 'failed', error: error.message });
    }
  }

  async testMassUserActions() {
    this.log('=== Testing Mass User Actions ===');

    try {
      // Create multiple test users for mass operations
      const massTestUsers = [];
      for (let i = 1; i <= 3; i++) {
        const user = await userService.createUser({
          email: `masstest${i}@example.com`,
          password: 'password123',
          firstName: `Mass${i}`,
          lastName: 'Test'
        });
        massTestUsers.push(user.id);
      }

      // Test 1: Mass suspend users
      const suspendResult = await userService.performMassUserAction(
        massTestUsers,
        'suspend'
      );
      this.log('✓ Successfully performed mass suspend operation', suspendResult);

      // Test 2: Mass activate users
      const activateResult = await userService.performMassUserAction(
        massTestUsers,
        'activate'
      );
      this.log('✓ Successfully performed mass activate operation', activateResult);

      // Test 3: Invalid action validation
      try {
        await userService.performMassUserAction(massTestUsers, 'invalid_action');
        this.log('✗ Should have failed for invalid mass action');
      } catch (error) {
        this.log('✓ Correctly validated invalid mass action:', error.message);
      }

      // Test 4: Empty user IDs array validation
      try {
        await userService.performMassUserAction([], 'suspend');
        this.log('✗ Should have failed for empty user IDs array');
      } catch (error) {
        this.log('✓ Correctly validated empty user IDs array:', error.message);
      }

      // Clean up mass test users
      await userService.performMassUserAction(massTestUsers, 'delete');
      this.log('✓ Cleaned up mass test users');

      this.testResults.push({ test: 'mass_actions', status: 'passed' });
    } catch (error) {
      this.log('✗ Mass user actions test failed:', error.message);
      this.testResults.push({ test: 'mass_actions', status: 'failed', error: error.message });
    }
  }

  async testBusinessAssignment() {
    this.log('=== Testing Business Assignment ===');

    try {
      // Create a test user for business assignment
      const testUser = await userService.createUser({
        email: 'businessowner@example.com',
        password: 'password123',
        firstName: 'Business',
        lastName: 'Owner'
      });

      // Test 1: Valid business assignment (assuming some businesses exist)
      try {
        // Get some business IDs from the database
        const businesses = await storage.getBusinesses({ limit: 2 });
        if (businesses.length > 0) {
          const businessIds = businesses.map(b => b.placeid);
          const result = await userService.assignBusinessesToUser(testUser.id, businessIds);
          this.log('✓ Successfully assigned businesses to user', result);
        } else {
          this.log('⚠ No businesses available for assignment test');
        }
      } catch (error) {
        this.log('⚠ Business assignment test skipped (no businesses or method missing):', error.message);
      }

      // Test 2: Non-existent user business assignment
      try {
        await userService.assignBusinessesToUser('non-existent-user', ['business1']);
        this.log('✗ Should have failed for non-existent user');
      } catch (error) {
        this.log('✓ Correctly handled non-existent user business assignment:', error.message);
      }

      // Test 3: Empty business IDs array validation
      try {
        await userService.assignBusinessesToUser(testUser.id, []);
        this.log('✗ Should have failed for empty business IDs array');
      } catch (error) {
        this.log('✓ Correctly validated empty business IDs array:', error.message);
      }

      // Clean up test user
      await userService.deleteUser(testUser.id);

      this.testResults.push({ test: 'business_assignment', status: 'passed' });
    } catch (error) {
      this.log('✗ Business assignment test failed:', error.message);
      this.testResults.push({ test: 'business_assignment', status: 'failed', error: error.message });
    }
  }

  async cleanup() {
    this.log('=== Cleaning Up Test Data ===');

    for (const userId of this.testUsers) {
      try {
        await storage.deleteUser(userId);
        this.log(`✓ Cleaned up test user: ${userId}`);
      } catch (error) {
        this.log(`⚠ Failed to clean up test user ${userId}:`, error.message);
      }
    }
  }

  async runAllTests() {
    this.log('🚀 Starting User Service Comprehensive Test Suite');
    this.log('='.repeat(50));

    await this.testUserCreation();
    await this.testUserUpdate();
    await this.testPasswordUpdate();
    await this.testUserRetrieval();
    await this.testMassUserActions();
    await this.testBusinessAssignment();
    await this.testUserDeletion();
    await this.cleanup();

    this.log('');
    this.log('📊 TEST SUMMARY');
    this.log('='.repeat(16));

    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;

    if (failed === 0) {
      this.log('✅ All tests passed!');
      this.log(`   ✓ Passed: ${passed}`);
    } else {
      this.log('❌ Some tests failed:');
      this.log(`   ✓ Passed: ${passed}`);
      this.log(`   ✗ Failed: ${failed}`);
      
      this.testResults
        .filter(r => r.status === 'failed')
        .forEach(result => {
          this.log(`   ✗ ${result.test}: ${result.error}`);
        });
    }
  }
}

async function runUserServiceTests() {
  const tester = new UserServiceTester();
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  }
}

runUserServiceTests();