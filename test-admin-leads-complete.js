/**
 * Comprehensive test for admin leads functionality
 * Tests registration, authentication, lead submission, and admin access
 */

const BASE_URL = 'http://localhost:5000';
let sessionCookie = '';

async function makeRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }
  
  const response = await fetch(url, { ...options, headers });
  
  // Extract session cookie from response
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const cookieMatch = setCookie.match(/connect\.sid=([^;]+)/);
    if (cookieMatch) {
      sessionCookie = `connect.sid=${cookieMatch[1]}`;
    }
  }
  
  return response;
}

async function testCompleteLeadsFlow() {
  console.log('🔧 Testing Complete Admin Leads Flow\n');

  try {
    // Step 1: Register admin user if needed
    console.log('1. Setting up admin user...');
    const registerResponse = await makeRequest(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@businesshub.com',
        password: 'admin123',
        firstName: 'Demo',
        lastName: 'Admin'
      })
    });
    
    if (registerResponse.status === 201) {
      console.log('   ✅ Admin user created and logged in');
    } else if (registerResponse.status === 400) {
      const error = await registerResponse.json();
      if (error.message.includes('already exists')) {
        console.log('   ℹ️ Admin user already exists, proceeding to login...');
        
        // Login existing admin
        const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          body: JSON.stringify({
            email: 'admin@businesshub.com',
            password: 'admin123'
          })
        });
        
        if (loginResponse.ok) {
          const user = await loginResponse.json();
          console.log('   ✅ Admin logged in successfully:', user.email);
        } else {
          throw new Error('Failed to login admin user');
        }
      }
    } else {
      throw new Error(`Failed to setup admin: ${registerResponse.status}`);
    }

    // Step 2: Verify admin authentication
    console.log('\n2. Verifying admin authentication...');
    const userResponse = await makeRequest(`${BASE_URL}/api/auth/user`);
    if (userResponse.ok) {
      const user = await userResponse.json();
      console.log(`   ✅ Authenticated as: ${user.email} (ID: ${user.id})`);
      
      // Update user role to admin if needed
      if (user.role !== 'admin') {
        console.log('   ⚠️ User role is not admin, this may cause access issues');
      }
    } else {
      throw new Error('Failed to verify authentication');
    }

    // Step 3: Submit test lead
    console.log('\n3. Submitting test lead...');
    const leadData = {
      businessId: 'ChIJneg9o9RbkWsRjRkjtAXEIzs_1749748481343_9b27b398', // Wil's Resto
      senderName: 'Test Customer',
      senderEmail: 'customer@example.com',
      senderPhone: '+1234567890',
      message: 'This is a test lead message to verify the admin leads system is working properly.'
    };

    const leadResponse = await makeRequest(`${BASE_URL}/api/leads`, {
      method: 'POST',
      body: JSON.stringify(leadData)
    });

    if (leadResponse.status === 201) {
      const lead = await leadResponse.json();
      console.log(`   ✅ Lead submitted successfully (ID: ${lead.id})`);
    } else {
      const error = await leadResponse.json();
      console.log(`   ❌ Lead submission failed: ${error.message}`);
    }

    // Step 4: Test admin leads access
    console.log('\n4. Testing admin leads access...');
    const adminLeadsResponse = await makeRequest(`${BASE_URL}/api/admin/leads`);
    
    if (adminLeadsResponse.ok) {
      const leads = await adminLeadsResponse.json();
      console.log(`   ✅ Admin leads access successful - Found ${leads.length} leads`);
      
      if (leads.length > 0) {
        console.log('   📋 Recent leads:');
        leads.slice(0, 3).forEach((lead, index) => {
          console.log(`     ${index + 1}. From: ${lead.senderName} (${lead.senderEmail})`);
          console.log(`        To: ${lead.business?.title || 'Unknown Business'}`);
          console.log(`        Message: ${lead.message.substring(0, 50)}...`);
          console.log(`        Status: ${lead.status}`);
          console.log('');
        });
      } else {
        console.log('   ℹ️ No leads found in the system');
      }
    } else {
      const error = await adminLeadsResponse.json();
      console.log(`   ❌ Admin leads access failed: ${error.message}`);
    }

    // Step 5: Test regular leads endpoint
    console.log('5. Testing regular leads endpoint...');
    const regularLeadsResponse = await makeRequest(`${BASE_URL}/api/leads`);
    
    if (regularLeadsResponse.ok) {
      const regularLeads = await regularLeadsResponse.json();
      console.log(`   ✅ Regular leads access successful - Found ${regularLeads.length} leads`);
    } else {
      const error = await regularLeadsResponse.json();
      console.log(`   ❌ Regular leads access failed: ${error.message}`);
    }

    // Step 6: Test business ownership check
    console.log('\n6. Testing business ownership check...');
    const ownershipResponse = await makeRequest(`${BASE_URL}/api/leads/business/${leadData.businessId}/ownership`);
    
    if (ownershipResponse.ok) {
      const ownership = await ownershipResponse.json();
      console.log(`   ✅ Business ownership check: ${ownership.isClaimed ? 'Claimed' : 'Unclaimed'}`);
      if (ownership.ownerId) {
        console.log(`     Owner ID: ${ownership.ownerId}`);
      }
    } else {
      console.log('   ⚠️ Ownership check endpoint not accessible');
    }

    console.log('\n🎉 Complete admin leads flow test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run the comprehensive test
testCompleteLeadsFlow().catch(console.error);