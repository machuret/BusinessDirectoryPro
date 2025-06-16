/**
 * Test script to check user dashboard functionality for militardataintelligence@gmail.com
 * Verifies business ownership and dashboard data retrieval
 */

const API_BASE = 'http://localhost:5000';

async function testUserDashboard() {
  console.log('Testing User Dashboard for militardataintelligence@gmail.com\n');
  
  try {
    // First, let's create a new user with a simple approach
    console.log('1. Creating test user via registration...');
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Register result:', registerResponse.status, registerData);
    
    // Try to login with the new user
    console.log('\n2. Testing login...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'test123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login result:', loginResponse.status, loginData);
    
    if (loginResponse.status === 200) {
      // Extract session cookie
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('Session cookies:', cookies);
      
      // Test dashboard API endpoints
      console.log('\n3. Testing dashboard API endpoints...');
      
      // Test user/businesses endpoint
      const businessesResponse = await fetch(`${API_BASE}/api/user/businesses`, {
        headers: { 
          'Cookie': cookies || '',
          'Content-Type': 'application/json'
        }
      });
      
      const businessesData = await businessesResponse.json();
      console.log('User businesses:', businessesResponse.status, businessesData);
      
      // Test ownership claims endpoint
      const claimsResponse = await fetch(`${API_BASE}/api/ownership-claims/user/${loginData.id}`, {
        headers: { 
          'Cookie': cookies || '',
          'Content-Type': 'application/json'
        }
      });
      
      const claimsData = await claimsResponse.json();
      console.log('Ownership claims:', claimsResponse.status, claimsData);
      
      console.log('\n✅ Dashboard API test completed');
      
    } else {
      console.log('❌ Login failed, cannot test dashboard');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserDashboard();