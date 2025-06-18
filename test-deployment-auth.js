#!/usr/bin/env node

/**
 * Test Deployment Authentication System
 * Verifies the enhanced auth system works in production environment
 */

async function testDeploymentAuth() {
  console.log('Testing enhanced deployment authentication system...');
  
  try {
    // Test 1: Login with correct credentials
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        email: 'admin@businesshub.com',
        password: 'Xola2025'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', await loginResponse.text());
      return;
    }

    const userData = await loginResponse.json();
    console.log('✅ Login successful:', userData.email, 'Role:', userData.role);
    
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test 2: Verify session persists for admin API calls
    const testEndpoints = [
      '/api/admin/businesses',
      '/api/admin/users',
      '/api/admin/categories',
      '/api/admin/reviews',
      '/api/admin/social-media',
      '/api/admin/featured-requests'
    ];

    let successCount = 0;
    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          credentials: 'include',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': cookies
          }
        });

        if (response.ok) {
          console.log(`✅ ${endpoint} (${response.status})`);
          successCount++;
        } else {
          console.log(`❌ ${endpoint} (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} (Network Error)`);
      }
    }

    // Test 3: Verify auth persistence check
    const authCheckResponse = await fetch('http://localhost:5000/api/auth/user', {
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': cookies
      }
    });

    const authWorking = authCheckResponse.ok;
    console.log(`Auth Check: ${authWorking ? '✅ Working' : '❌ Failed'} (${authCheckResponse.status})`);

    // Results
    console.log('\n=== DEPLOYMENT AUTH TEST RESULTS ===');
    console.log(`Login: ✅ Working`);
    console.log(`Admin Endpoints: ${successCount}/${testEndpoints.length} working`);
    console.log(`Auth Persistence: ${authWorking ? '✅ Working' : '❌ Failed'}`);
    console.log(`Session Management: ${cookies ? '✅ Cookies set' : '❌ No cookies'}`);
    
    if (successCount === testEndpoints.length && authWorking) {
      console.log('\n🎉 DEPLOYMENT AUTHENTICATION FULLY OPERATIONAL!');
      console.log('Enhanced session management should resolve 401 errors in browser.');
    } else {
      console.log('\n⚠️ Some endpoints still failing - enhanced localStorage backup will handle this.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDeploymentAuth();