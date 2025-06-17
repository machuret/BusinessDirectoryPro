/**
 * Frontend Session Debugging Script
 * Tests session cookie handling in browser environment
 */

// This script will be run in the browser console to debug session issues
const frontendSessionDebug = `
console.log('=== FRONTEND SESSION DEBUG ===');

// Check if cookies are being set properly
console.log('Current cookies:', document.cookie);

// Test API call with credentials
fetch('/api/auth/user', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Auth check response status:', response.status);
  console.log('Response headers:', [...response.headers.entries()]);
  return response.json();
})
.then(data => {
  console.log('Auth check data:', data);
})
.catch(error => {
  console.log('Auth check error:', error);
});

// Test login flow
console.log('Testing login flow...');
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123'
  })
})
.then(response => {
  console.log('Login response status:', response.status);
  console.log('Login response headers:', [...response.headers.entries()]);
  console.log('Cookies after login:', document.cookie);
  return response.json();
})
.then(data => {
  console.log('Login data:', data);
  
  // Test auth check after login
  return fetch('/api/auth/user', {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
})
.then(response => {
  console.log('Post-login auth check status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Post-login auth data:', data);
})
.catch(error => {
  console.log('Login flow error:', error);
});
`;

console.log('Frontend Session Debug Script:');
console.log('Copy and paste this into the browser console on the frontend:');
console.log('');
console.log(frontendSessionDebug);