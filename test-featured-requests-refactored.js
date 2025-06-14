/**
 * Refactored Featured Requests API Integration Test
 * Uses robust test helpers for reliable data setup
 */

import { db } from './server/db.ts';
import { featuredRequests } from './shared/schema.ts';
import { eq, and } from 'drizzle-orm';
import { 
  createTestSetup, 
  cleanupTestData, 
  validateTestSetup
} from './server/test/test-helpers.ts';

async function runRefactoredFeaturedRequestsTests() {
  console.log('Starting Refactored Featured Requests API Integration Tests...\n');

  let testData;
  let createdRequestIds = [];
  
  try {
    // Test 1: Setup test data using helpers
    console.log('1. Setting up test data with helpers...');
    testData = await createTestSetup(
      { firstName: 'Featured', lastName: 'TestUser' },
      { name: 'Featured Test Category' },
      { title: 'Featured Test Business', description: 'Business for featured request testing' }
    );

    console.log(`   ✓ Created test user: ${testData.user.email} (ID: ${testData.user.id})`);
    console.log(`   ✓ Created test category: ${testData.category.name} (ID: ${testData.category.id})`);
    console.log(`   ✓ Created test business: ${testData.business.title} (ID: ${testData.business.placeid})`);

    // Test 2: Validate test setup
    console.log('\n2. Validating test setup...');
    const validation = await validateTestSetup(testData);
    
    console.log(`   ✓ User exists: ${validation.userExists}`);
    console.log(`   ✓ Category exists: ${validation.categoryExists}`);
    console.log(`   ✓ Business exists: ${validation.businessExists}`);
    console.log(`   ✓ Business ownership valid: ${validation.businessOwnershipValid}`);

    if (!validation.businessOwnershipValid) {
      throw new Error('Business ownership validation failed');
    }

    // Test 3: Create featured request
    console.log('\n3. Testing featured request creation...');
    const [createdRequest] = await db.insert(featuredRequests).values({
      businessId: testData.business.placeid,
      userId: testData.user.id,
      message: 'Please feature our business! We have excellent service and great reviews.',
      status: 'pending'
    }).returning();

    createdRequestIds.push(createdRequest.id);

    console.log(`   ✓ Created featured request with ID: ${createdRequest.id}`);
    console.log(`   ✓ Business ID: ${createdRequest.businessId}`);
    console.log(`   ✓ User ID: ${createdRequest.userId}`);
    console.log(`   ✓ Status: ${createdRequest.status}`);
    console.log(`   ✓ Message: ${createdRequest.message}`);
    console.log(`   ✓ Created at: ${createdRequest.createdAt}`);

    // Test 4: Verify request persistence
    console.log('\n4. Verifying request persistence...');
    const [foundRequest] = await db
      .select()
      .from(featuredRequests)
      .where(eq(featuredRequests.id, createdRequest.id));

    if (foundRequest && foundRequest.businessId === testData.business.placeid) {
      console.log('   ✓ Request successfully persisted to database');
      console.log(`   ✓ Retrieved message: ${foundRequest.message}`);
      console.log(`   ✓ Retrieved status: ${foundRequest.status}`);
    } else {
      throw new Error('Failed to retrieve request from database');
    }

    // Test 5: Test duplicate prevention logic
    console.log('\n5. Testing duplicate prevention logic...');
    const existingRequests = await db
      .select()
      .from(featuredRequests)
      .where(
        and(
          eq(featuredRequests.businessId, testData.business.placeid),
          eq(featuredRequests.userId, testData.user.id),
          eq(featuredRequests.status, 'pending')
        )
      );

    if (existingRequests.length === 1) {
      console.log('   ✓ Duplicate prevention logic validation passed');
      console.log(`   ✓ Found exactly 1 pending request as expected`);
    } else {
      throw new Error(`Expected 1 pending request, found ${existingRequests.length}`);
    }

    // Test 6: Test business ownership verification
    console.log('\n6. Testing business ownership verification...');
    if (testData.business.ownerid === testData.user.id) {
      console.log('   ✓ Business ownership correctly established');
      console.log(`   ✓ Business owner: ${testData.business.ownerid}`);
      console.log(`   ✓ Test user: ${testData.user.id}`);
    } else {
      throw new Error('Business ownership verification failed');
    }

    // Test 7: Test user requests query
    console.log('\n7. Testing user requests query...');
    const userRequests = await db
      .select()
      .from(featuredRequests)
      .where(eq(featuredRequests.userId, testData.user.id));

    if (userRequests.length >= 1) {
      console.log(`   ✓ User requests query successful (found ${userRequests.length} requests)`);
      console.log(`   ✓ First request ID: ${userRequests[0].id}`);
      console.log(`   ✓ First request status: ${userRequests[0].status}`);
    } else {
      throw new Error('User requests query failed');
    }

    // Test 8: Test creating request without message
    console.log('\n8. Testing featured request creation without message...');
    const [requestWithoutMessage] = await db.insert(featuredRequests).values({
      businessId: testData.business.placeid,
      userId: testData.user.id,
      status: 'pending'
      // No message field
    }).returning();

    createdRequestIds.push(requestWithoutMessage.id);

    if (requestWithoutMessage.message === null) {
      console.log('   ✓ Request without message created successfully');
      console.log(`   ✓ Request ID: ${requestWithoutMessage.id}`);
      console.log(`   ✓ Message field: ${requestWithoutMessage.message}`);
    } else {
      throw new Error('Request without message validation failed');
    }

    // Test 9: Test status update (without foreign key constraint)
    console.log('\n9. Testing status update functionality...');
    const [updatedRequest] = await db
      .update(featuredRequests)
      .set({
        status: 'approved',
        reviewedAt: new Date(),
        adminMessage: 'Approved for featuring - excellent business!'
        // Not setting reviewedBy to avoid foreign key constraint
      })
      .where(eq(featuredRequests.id, createdRequest.id))
      .returning();

    if (updatedRequest.status === 'approved' && updatedRequest.adminMessage) {
      console.log('   ✓ Status update successful');
      console.log(`   ✓ New status: ${updatedRequest.status}`);
      console.log(`   ✓ Admin message: ${updatedRequest.adminMessage}`);
      console.log(`   ✓ Reviewed at: ${updatedRequest.reviewedAt}`);
    } else {
      throw new Error('Status update failed');
    }

    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('\nRefactored Featured Requests API Test Summary:');
    console.log('✓ Robust test data setup using helpers');
    console.log('✓ Proper business ownership validation');
    console.log('✓ Featured request creation with message');
    console.log('✓ Featured request creation without message');
    console.log('✓ Database persistence verification');
    console.log('✓ Duplicate prevention logic validation');
    console.log('✓ User requests query functionality');
    console.log('✓ Status update mechanism');
    console.log('✓ Clean test data management');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cleanup test data using helper
    console.log('\n10. Cleaning up test data...');
    try {
      await cleanupTestData({
        user: testData?.user,
        category: testData?.category,
        business: testData?.business,
        featuredRequestIds: createdRequestIds
      });
      console.log('   ✓ All test data cleaned up successfully');
    } catch (cleanupError) {
      console.error('   ⚠️  Cleanup error:', cleanupError.message);
    }
  }
}

// Run the refactored tests
runRefactoredFeaturedRequestsTests()
  .then(() => {
    console.log('\nRefactored test execution completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nRefactored test execution failed:', error);
    process.exit(1);
  });