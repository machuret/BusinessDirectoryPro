/**
 * Setup script to create the test user and assign businesses
 */

const API_BASE = 'http://localhost:5000';

async function makeRequest(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { status: response.status, data };
}

async function setupTestUser() {
  console.log('Setting up test user militardataintelligence@gmail.com...\n');
  
  try {
    // Step 1: Register the user
    console.log('1. Creating user account...');
    const registerResult = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'militardataintelligence@gmail.com',
        password: 'password123',
        firstName: 'Military',
        lastName: 'Data Intelligence'
      })
    });
    
    if (registerResult.status === 201) {
      console.log('✅ User created successfully:', registerResult.data.email);
    } else if (registerResult.status === 400 && registerResult.data.message.includes('already exists')) {
      console.log('✅ User already exists, proceeding...');
    } else {
      console.log('❌ Failed to create user:', registerResult.data);
      return;
    }
    
    // Step 2: Login to get session
    console.log('\n2. Logging in...');
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'militardataintelligence@gmail.com',
        password: 'password123'
      })
    });
    
    if (loginResult.status !== 200) {
      console.log('❌ Login failed:', loginResult.data);
      return;
    }
    
    console.log('✅ Login successful');
    const sessionCookie = `connect.sid=${loginResult.data.sessionId || 'dummy'}`;
    
    // Step 3: Get some businesses to assign
    console.log('\n3. Getting businesses from database...');
    const businessesResult = await makeRequest('/api/businesses?limit=50');
    
    if (businessesResult.status !== 200 || !Array.isArray(businessesResult.data)) {
      console.log('❌ Failed to get businesses:', businessesResult.data);
      return;
    }
    
    const businesses = businessesResult.data;
    console.log(`Found ${businesses.length} businesses in database`);
    
    if (businesses.length === 0) {
      console.log('❌ No businesses found to assign');
      return;
    }
    
    // Step 4: Assign businesses to user via admin API
    console.log('\n4. Assigning businesses to user...');
    const businessesToAssign = businesses.slice(0, 2); // First 2 businesses
    
    for (const business of businessesToAssign) {
      const updateResult = await makeRequest(`/api/admin/businesses/${business.placeid}`, {
        method: 'PATCH',
        headers: { 'Cookie': sessionCookie },
        body: JSON.stringify({
          ownerId: loginResult.data.id
        })
      });
      
      if (updateResult.status === 200) {
        console.log(`✅ Assigned business: ${business.title}`);
      } else {
        console.log(`⚠️ Failed to assign business: ${business.title}`);
      }
    }
    
    // Step 5: Create a test ownership claim
    console.log('\n5. Creating test ownership claim...');
    const claimResult = await makeRequest('/api/ownership-claims', {
      method: 'POST',
      headers: { 'Cookie': sessionCookie },
      body: JSON.stringify({
        businessId: businesses[0].placeid,
        message: 'I am the rightful owner of this business and need to claim it for management purposes. This is a test claim to verify the dashboard functionality works correctly.'
      })
    });
    
    if (claimResult.status === 201) {
      console.log('✅ Created test ownership claim');
    } else {
      console.log('⚠️ Failed to create ownership claim:', claimResult.data);
    }
    
    // Step 6: Verify user dashboard data
    console.log('\n6. Verifying user dashboard...');
    const userBusinessesResult = await makeRequest('/api/user/businesses', {
      headers: { 'Cookie': sessionCookie }
    });
    
    if (userBusinessesResult.status === 200) {
      console.log(`✅ User has ${userBusinessesResult.data.length} businesses assigned`);
      userBusinessesResult.data.forEach((business, index) => {
        console.log(`  ${index + 1}. ${business.title} (${business.placeid})`);
      });
    } else {
      console.log('❌ Failed to verify user businesses:', userBusinessesResult.data);
    }
    
    console.log('\n🎯 Setup completed successfully!');
    console.log('User can now:');
    console.log('1. Login with: militardataintelligence@gmail.com / password123');
    console.log('2. Access dashboard with business ownership data');
    console.log('3. View ownership claims');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupTestUser().then(() => {
  console.log('\nSetup script completed');
}).catch(error => {
  console.error('Setup script error:', error);
});