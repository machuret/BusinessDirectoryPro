/**
 * Script to add missing content strings via admin authentication
 */

const API_BASE = 'http://localhost:5000';

async function makeAuthenticatedRequest(method, path, data = null, cookies = '') {
  const url = `${API_BASE}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  return response;
}

async function authenticateAsAdmin() {
  console.log('Authenticating as admin...');
  
  const loginResponse = await makeAuthenticatedRequest('POST', '/api/auth/login', {
    email: 'admin@businesshub.com',
    password: 'admin123'
  });

  if (!loginResponse.ok) {
    throw new Error(`Login failed: ${loginResponse.status}`);
  }

  // Extract session cookie
  const setCookieHeaders = loginResponse.headers.get('set-cookie');
  const sessionCookie = setCookieHeaders ? setCookieHeaders.split(';')[0] : '';
  console.log('✓ Admin authentication successful');
  
  return sessionCookie;
}

async function addContentStrings(sessionCookie) {
  console.log('Adding missing content strings...');

  const missingStrings = [
    // Business Contact Information
    { key: 'business.contact.title', value: 'Contact Information', description: 'Title for business contact section' },
    { key: 'business.contact.category', value: 'Category', description: 'Label for business category' },
    { key: 'business.contact.visitWebsite', value: 'Visit Website', description: 'Button text to visit business website' },
    { key: 'business.contact.address', value: 'Address', description: 'Label for business address' },
    { key: 'business.contact.phone', value: 'Phone', description: 'Label for business phone number' },
    { key: 'business.contact.email', value: 'Email', description: 'Label for business email' },
    { key: 'business.contact.hours', value: 'Hours', description: 'Label for business operating hours' },
    { key: 'business.contact.getDirections', value: 'Get Directions', description: 'Button text for getting directions' },

    // Footer Content
    { key: 'footer.company.name', value: 'BusinessHub', description: 'Company name in footer' },
    { key: 'footer.company.description', value: 'Your trusted local business directory connecting you with the best services in your area.', description: 'Company description in footer' },
    { key: 'footer.quickLinks.title', value: 'Quick Links', description: 'Title for quick links section in footer' },
    { key: 'footer.quickLinks.home', value: 'Home', description: 'Home link in footer' },
    { key: 'footer.quickLinks.categories', value: 'Categories', description: 'Categories link in footer' },
    { key: 'footer.quickLinks.cities', value: 'Cities', description: 'Cities link in footer' },
    { key: 'footer.quickLinks.addBusiness', value: 'Add Business', description: 'Add business link in footer' },
    { key: 'footer.support.title', value: 'Support', description: 'Title for support section in footer' },
    { key: 'footer.support.contact', value: 'Contact Us', description: 'Contact us link in footer' },
    { key: 'footer.support.help', value: 'Help Center', description: 'Help center link in footer' },
    { key: 'footer.support.privacy', value: 'Privacy Policy', description: 'Privacy policy link in footer' },
    { key: 'footer.support.terms', value: 'Terms of Service', description: 'Terms of service link in footer' },
    { key: 'footer.copyright', value: '© 2025 BusinessHub. All rights reserved.', description: 'Copyright text in footer' },

    // Business Details
    { key: 'business.details.overview', value: 'Overview', description: 'Business overview section title' },
    { key: 'business.details.services', value: 'Services', description: 'Business services section title' },
    { key: 'business.details.reviews', value: 'Reviews', description: 'Business reviews section title' },
    { key: 'business.details.photos', value: 'Photos', description: 'Business photos section title' },
    { key: 'business.details.noDescription', value: 'No description available for this business.', description: 'Fallback text when business has no description' },
    { key: 'business.details.noPhotos', value: 'No photos available.', description: 'Text when no photos are available' },
    { key: 'business.details.noReviews', value: 'No reviews yet. Be the first to review!', description: 'Text when no reviews are available' }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const stringData of missingStrings) {
    try {
      const response = await makeAuthenticatedRequest('POST', '/api/admin/content/strings', stringData, sessionCookie);
      
      if (response.ok) {
        console.log(`✓ Added: ${stringData.key}`);
        successCount++;
      } else {
        console.error(`✗ Failed to add ${stringData.key}: HTTP ${response.status}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`✗ Failed to add ${stringData.key}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\nResults:`);
  console.log(`✓ Successfully added: ${successCount} content strings`);
  console.log(`✗ Failed: ${errorCount} content strings`);
  
  if (successCount > 0) {
    console.log(`\nMissing content strings have been added!`);
    console.log(`The business sidebar and footer should now display properly.`);
  }
}

async function run() {
  try {
    const sessionCookie = await authenticateAsAdmin();
    await addContentStrings(sessionCookie);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();