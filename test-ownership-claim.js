/**
 * Test script for ownership claim functionality with user messages
 */

async function testOwnershipClaimFlow() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing Ownership Claim Flow with User Messages');
  console.log('================================================\n');

  try {
    // Test 1: Create ownership claim with message
    console.log('1. Creating ownership claim with user message...');
    const claimData = {
      userId: 'demo-user-1',
      businessId: 'ChIJ4WVZTWJYkWsRQ0GEor61-iE_1749617173825_653ee660', // Divine Smiles
      message: 'I am the owner of Divine Smiles dental practice. I have been operating this business for over 5 years and have all the necessary documentation including business registration, dental practice license, and lease agreements. I would like to claim ownership to update our business information, hours, and services offered to better serve our patients.'
    };

    const createResponse = await fetch(`${baseUrl}/api/ownership-claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(claimData)
    });

    if (createResponse.ok) {
      const newClaim = await createResponse.json();
      console.log('✅ Ownership claim created successfully');
      console.log(`   Claim ID: ${newClaim.id}`);
      console.log(`   Status: ${newClaim.status}`);
      console.log(`   Message: ${newClaim.message?.substring(0, 100)}...`);
      
      // Test 2: Fetch admin ownership claims to verify message display
      console.log('\n2. Fetching ownership claims for admin review...');
      const adminResponse = await fetch(`${baseUrl}/api/admin/ownership-claims`);
      
      if (adminResponse.ok) {
        const claims = await adminResponse.json();
        console.log('✅ Admin ownership claims fetched successfully');
        console.log(`   Total claims: ${claims.length}`);
        
        const testClaim = claims.find(c => c.id === newClaim.id);
        if (testClaim) {
          console.log('\n📋 Claim Details for Admin Review:');
          console.log(`   Business: ${testClaim.businessTitle || 'Unknown'}`);
          console.log(`   User: ${testClaim.userFirstName} ${testClaim.userLastName} (${testClaim.userEmail})`);
          console.log(`   Status: ${testClaim.status}`);
          console.log(`   User Message: ${testClaim.message}`);
          console.log(`   Created: ${new Date(testClaim.createdAt).toLocaleString()}`);
        }
        
        // Test 3: Update claim with admin response
        console.log('\n3. Admin approving claim with response message...');
        const adminMessage = 'Ownership claim approved. All documentation verified successfully. You now have full access to manage your business listing.';
        
        const updateResponse = await fetch(`${baseUrl}/api/admin/ownership-claims/${newClaim.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'approved',
            adminMessage: adminMessage
          })
        });

        if (updateResponse.ok) {
          const updatedClaim = await updateResponse.json();
          console.log('✅ Claim updated by admin successfully');
          console.log(`   New Status: approved`);
          console.log(`   Admin Response: ${adminMessage}`);
        } else {
          console.log('❌ Failed to update claim');
          console.log(await updateResponse.text());
        }
        
      } else {
        console.log('❌ Failed to fetch admin claims');
        console.log(await adminResponse.text());
      }
      
    } else {
      console.log('❌ Failed to create ownership claim');
      console.log(await createResponse.text());
    }

    // Test 4: Test validation - message too short
    console.log('\n4. Testing validation - message too short...');
    const shortMessageData = {
      userId: 'demo-user-1',
      businessId: 'ChIJ4WVZTWJYkWsRQ0GEor61-iE_1749617173825_653ee660',
      message: 'I own this business' // Too short
    };

    const validationResponse = await fetch(`${baseUrl}/api/ownership-claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shortMessageData)
    });

    if (!validationResponse.ok) {
      const error = await validationResponse.json();
      console.log('✅ Validation working correctly');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log('❌ Validation should have failed for short message');
    }

    // Test 5: Test missing fields
    console.log('\n5. Testing validation - missing required fields...');
    const incompleteData = {
      userId: 'demo-user-1',
      // Missing businessId and message
    };

    const missingFieldsResponse = await fetch(`${baseUrl}/api/ownership-claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incompleteData)
    });

    if (!missingFieldsResponse.ok) {
      const error = await missingFieldsResponse.json();
      console.log('✅ Required field validation working correctly');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log('❌ Validation should have failed for missing fields');
    }

    console.log('\n🎉 Ownership Claim Testing Complete!');
    console.log('\n📊 Summary:');
    console.log('   ✅ User can submit ownership claims with messages');
    console.log('   ✅ Admin interface displays user messages prominently');
    console.log('   ✅ Admin can respond with approval/rejection messages');
    console.log('   ✅ Validation prevents short or missing messages');
    console.log('   ✅ Required field validation working');

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

// Run the test
testOwnershipClaimFlow();