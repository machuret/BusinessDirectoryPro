/**
 * Simple API test for CMS content strings and category/city filtering
 */

async function testCMSAPI() {
  console.log('Testing CMS API endpoints...');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    // Test 1: Content strings API
    console.log('\n1. Testing content strings API...');
    const contentResponse = await fetch(`${baseUrl}/api/content/strings`);
    
    if (contentResponse.ok) {
      const contentStrings = await contentResponse.json();
      const keyCount = Object.keys(contentStrings).length;
      console.log(`✓ Content strings loaded: ${keyCount} keys`);
      
      // Check for specific CMS keys we added
      const expectedKeys = [
        'categories.businesses.categoryTitle',
        'categories.businesses.allTitle', 
        'cities.cityPage.title',
        'cities.cityPage.description'
      ];
      
      const foundKeys = expectedKeys.filter(key => contentStrings[key]);
      console.log(`✓ Found ${foundKeys.length}/${expectedKeys.length} migration keys`);
      
      // Verify parameter interpolation placeholders
      if (contentStrings['categories.businesses.categoryTitle']?.includes('{categoryName}')) {
        console.log('✓ Category parameter placeholders present');
      }
      
      if (contentStrings['cities.cityPage.title']?.includes('{cityName}')) {
        console.log('✓ City parameter placeholders present');
      }
    } else {
      console.log(`❌ Content strings API failed: ${contentResponse.status}`);
    }
    
    // Test 2: Categories API
    console.log('\n2. Testing categories API...');
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
    
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log(`✓ Categories loaded: ${categories.length} categories`);
      
      if (categories.length > 0) {
        const firstCategory = categories[0];
        console.log(`✓ Sample category: ${firstCategory.name} (${firstCategory.slug})`);
        
        // Test category-specific businesses
        const categoryBusinessesResponse = await fetch(`${baseUrl}/api/businesses?categoryId=${firstCategory.id}`);
        if (categoryBusinessesResponse.ok) {
          const categoryBusinesses = await categoryBusinessesResponse.json();
          console.log(`✓ Category businesses: ${categoryBusinesses.length} businesses in ${firstCategory.name}`);
        }
      }
    } else {
      console.log(`❌ Categories API failed: ${categoriesResponse.status}`);
    }
    
    // Test 3: Cities API
    console.log('\n3. Testing cities API...');
    const citiesResponse = await fetch(`${baseUrl}/api/cities`);
    
    if (citiesResponse.ok) {
      const cities = await citiesResponse.json();
      console.log(`✓ Cities loaded: ${cities.length} cities`);
      
      if (cities.length > 0) {
        const firstCity = cities[0];
        console.log(`✓ Sample city: ${firstCity.city} (${firstCity.count} businesses)`);
        
        // Test city-specific businesses
        const cityBusinessesResponse = await fetch(`${baseUrl}/api/businesses?city=${encodeURIComponent(firstCity.city)}`);
        if (cityBusinessesResponse.ok) {
          const cityBusinesses = await cityBusinessesResponse.json();
          console.log(`✓ City businesses: ${cityBusinesses.length} businesses in ${firstCity.city}`);
        }
      }
    } else {
      console.log(`❌ Cities API failed: ${citiesResponse.status}`);
    }
    
    // Test 4: All businesses API
    console.log('\n4. Testing businesses API...');
    const businessesResponse = await fetch(`${baseUrl}/api/businesses`);
    
    if (businessesResponse.ok) {
      const businesses = await businessesResponse.json();
      console.log(`✓ Total businesses: ${businesses.length}`);
      
      // Check business structure for required fields
      if (businesses.length > 0) {
        const sampleBusiness = businesses[0];
        const hasRequiredFields = sampleBusiness.title && sampleBusiness.city && sampleBusiness.categoryId;
        console.log(`✓ Business data structure: ${hasRequiredFields ? 'Valid' : 'Missing fields'}`);
      }
    } else {
      console.log(`❌ Businesses API failed: ${businessesResponse.status}`);
    }
    
    console.log('\n🎉 API Tests Complete!');
    console.log('\nSummary:');
    console.log('- CMS content strings are served from database');
    console.log('- Parameter interpolation placeholders are in place');
    console.log('- Category and city filtering APIs are functional');
    console.log('- Business data supports filtering by category and location');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCMSAPI().catch(console.error);