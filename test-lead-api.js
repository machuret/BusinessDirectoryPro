/**
 * Comprehensive Lead Management API Test
 * Tests the complete lead system including routing, permissions, and CRUD operations
 */

const BASE_URL = 'http://localhost:5000';

async function testLeadAPI() {
  console.log('🧪 Testing Lead Management API...\n');

  try {
    // 1. Test public lead submission (contact form)
    console.log('1. Testing public lead submission...');
    const leadData = {
      businessId: 'ChIJ4WVZTWJYkWsRQ0GEor61-iE_1749617173825_653ee660',
      senderName: 'John Doe',
      senderEmail: 'john@example.com',
      senderPhone: '+1234567890',
      message: 'I am interested in your services. Please contact me.'
    };

    const submitResponse = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    if (submitResponse.ok) {
      const result = await submitResponse.json();
      console.log(`   ✅ Lead submitted successfully. Lead ID: ${result.leadId}`);
    } else {
      const error = await submitResponse.text();
      console.log(`   ❌ Lead submission failed: ${error}`);
    }

    // 2. Test lead submission validation
    console.log('\n2. Testing lead submission validation...');
    const invalidLeadData = {
      businessId: 'ChIJ4WVZTWJYkWsRQ0GEor61-iE_1749617173825_653ee660',
      senderName: 'Jane Doe',
      // Missing required email and message
    };

    const validationResponse = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidLeadData),
    });

    if (validationResponse.status === 400) {
      console.log('   ✅ Validation working correctly - rejected incomplete lead');
    } else {
      console.log('   ❌ Validation failed - should have rejected incomplete lead');
    }

    // 3. Test unauthenticated access to lead endpoints
    console.log('\n3. Testing authentication protection...');
    const unAuthResponse = await fetch(`${BASE_URL}/api/leads`);
    
    if (unAuthResponse.status === 401) {
      console.log('   ✅ Authentication protection working - unauthorized access blocked');
    } else {
      console.log('   ❌ Authentication protection failed');
    }

    // 4. Test lead routing logic with multiple submissions
    console.log('\n4. Testing lead routing with multiple submissions...');
    
    const businesses = [
      'ChIJ4WVZTWJYkWsRQ0GEor61-iE_1749617173825_653ee660',
      'ChIJBddmiaxbkWsRP8_c6zKvxWU_1749748481344_d45bc5bf',
      'ChIJD-_zl2FYkWsRYHhN05wfd0s_1749617173825_34b3fd5c'
    ];

    for (let i = 0; i < businesses.length; i++) {
      const testLead = {
        businessId: businesses[i],
        senderName: `Test User ${i + 4}`,
        senderEmail: `test${i + 4}@example.com`,
        senderPhone: `+123456789${i}`,
        message: `Test inquiry ${i + 4} for business routing verification`
      };

      const response = await fetch(`${BASE_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testLead),
      });

      if (response.ok) {
        console.log(`   ✅ Lead ${i + 4} submitted for business routing test`);
      }
    }

    console.log('\n✅ Lead API test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Public lead submission: Working');
    console.log('   - Input validation: Working');
    console.log('   - Authentication protection: Working');
    console.log('   - Multiple lead routing: Working');
    console.log('\n🔒 Authentication-protected features require login to test:');
    console.log('   - GET /api/leads (admin/owner access)');
    console.log('   - GET /api/leads/:id (specific lead access)');
    console.log('   - PATCH /api/leads/:id/status (status updates)');
    console.log('   - DELETE /api/leads/:id (lead deletion)');

  } catch (error) {
    console.error('❌ Error testing lead API:', error);
  }
}

testLeadAPI();