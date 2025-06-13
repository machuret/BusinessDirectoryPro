// Test script to verify all business editing functionality
const testBusinessEdit = async () => {
  const baseUrl = 'http://localhost:5000';
  
  // First login as admin to get session
  console.log('Logging in as admin...');
  const loginResponse = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@businesshub.com', password: 'admin123' })
  });
  
  if (!loginResponse.ok) {
    console.log('Login failed:', await loginResponse.text());
    return;
  }
  
  // Get session cookie
  const cookies = loginResponse.headers.get('set-cookie');
  const sessionCookie = cookies ? cookies.split(';')[0] : '';
  console.log('Login successful, session obtained');
  
  // Test data for business updates
  const testUpdates = {
    categoryChange: { categoryid: 13 },
    phoneUpdate: { phone: '07 3357 4555' },
    faqUpdate: { 
      faq: [
        { question: "What services do you offer?", answer: "We offer comprehensive dental care." },
        { question: "Do you accept insurance?", answer: "Yes, we accept most major insurance plans." }
      ]
    },
    ownerIdTest: { ownerid: '' }, // Test empty owner ID
    combinedUpdate: {
      categoryid: 13,
      phone: '07 3357 4555',
      faq: [{ question: "Test FAQ", answer: "Test Answer" }],
      ownerid: null
    }
  };

  console.log('Testing business editing functionality...');
  
  // Get a test business ID
  try {
    const response = await fetch(`${baseUrl}/api/businesses/featured`);
    const businesses = await response.json();
    const testBusinessId = businesses[0]?.placeid;
    
    if (!testBusinessId) {
      console.log('No test business found');
      return;
    }
    
    console.log(`Testing with business ID: ${testBusinessId}`);
    
    // Test each update type
    for (const [testName, updateData] of Object.entries(testUpdates)) {
      console.log(`\nTesting: ${testName}`);
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      try {
        const updateResponse = await fetch(`${baseUrl}/api/admin/businesses/${testBusinessId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
          },
          body: JSON.stringify(updateData)
        });
        
        const result = await updateResponse.text();
        console.log(`Status: ${updateResponse.status}`);
        console.log(`Response: ${result.substring(0, 200)}...`);
        
        if (updateResponse.status !== 200) {
          console.log(`❌ ${testName} FAILED`);
        } else {
          console.log(`✅ ${testName} PASSED`);
        }
      } catch (error) {
        console.log(`❌ ${testName} ERROR:`, error.message);
      }
    }
    
  } catch (error) {
    console.log('Error in test setup:', error.message);
  }
};

// Run tests
testBusinessEdit();