#!/usr/bin/env node

/**
 * Simple Admin Authentication Test
 * Uses built-in fetch to test the admin system
 */

async function testAuth() {
  console.log('Testing admin authentication with correct credentials...');
  
  try {
    // Test login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@businesshub.com',
        password: 'Xola2025'
      })
    });

    if (!loginResponse.ok) {
      console.log('Authentication failed:', await loginResponse.text());
      return;
    }

    const userData = await loginResponse.json();
    console.log('Login successful:', userData.email, 'Role:', userData.role);
    
    // Extract session cookie
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test admin API
    const adminResponse = await fetch('http://localhost:5000/api/admin/businesses', {
      headers: { 'Cookie': cookies }
    });

    if (adminResponse.ok) {
      const businesses = await adminResponse.json();
      console.log('Admin API working - businesses loaded:', businesses.length);
      console.log('Authentication system is fully operational!');
    } else {
      console.log('Admin API failed:', adminResponse.status);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuth();