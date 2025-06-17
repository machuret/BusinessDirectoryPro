/**
 * Update user role to admin via API
 */

async function makeRequest(method, path, data = null, cookies = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`http://localhost:5000${path}`, options);
  const result = await response.text();
  
  try {
    return { status: response.status, data: JSON.parse(result) };
  } catch {
    return { status: response.status, data: result };
  }
}

async function updateUserRole() {
  try {
    console.log('Updating user role to admin...');
    
    // Login first to get session
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin-new@businesshub.com',
      password: 'admin123'
    });
    
    if (loginResponse.status !== 200) {
      throw new Error('Login failed');
    }
    
    // Extract session cookie
    const setCookieHeader = loginResponse.headers?.['set-cookie'];
    console.log('Login successful, user role will need database update');
    console.log('Current credentials:');
    console.log('Email: admin-new@businesshub.com');
    console.log('Password: admin123');
    console.log('Role: user (needs to be changed to admin in database)');
    
  } catch (error) {
    console.error('Failed to update user role:', error.message);
  }
}

updateUserRole();