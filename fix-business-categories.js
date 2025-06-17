/**
 * Fix business category naming inconsistencies
 * Map mismatched category names to official categories
 */

async function makeRequest(method, path, data = null) {
  const url = `http://localhost:5000${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  return response.json();
}

async function fixBusinessCategories() {
  console.log('Fixing business category inconsistencies...');
  
  try {
    // Get all businesses to see current category distribution
    const businesses = await makeRequest('GET', '/api/businesses');
    
    console.log('Current category distribution:');
    const categoryCount = {};
    businesses.forEach(business => {
      const category = business.categoryname;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} businesses`);
    });
    
    // Map mismatched categories to official ones
    const categoryMappings = {
      'Dental clinic': 'Dentist',
      'Orthodontist': 'Orthodontist in Pekin', 
      'Mexican restaurant': 'Restaurants',
      'Restaurant': 'Restaurants'
    };
    
    console.log('\nUpdating categories...');
    
    // Update each business that needs category correction
    for (const business of businesses) {
      const currentCategory = business.categoryname;
      const newCategory = categoryMappings[currentCategory];
      
      if (newCategory) {
        try {
          // Update the business category
          const updateData = {
            ...business,
            categoryname: newCategory
          };
          
          await makeRequest('PUT', `/api/businesses/${business.placeid}`, updateData);
          console.log(`✓ Updated "${business.title}" from "${currentCategory}" to "${newCategory}"`);
        } catch (error) {
          console.log(`❌ Failed to update "${business.title}": ${error.message}`);
        }
      }
    }
    
    // Verify the changes
    const updatedBusinesses = await makeRequest('GET', '/api/businesses');
    const updatedCategoryCount = {};
    updatedBusinesses.forEach(business => {
      const category = business.categoryname;
      updatedCategoryCount[category] = (updatedCategoryCount[category] || 0) + 1;
    });
    
    console.log('\nUpdated category distribution:');
    Object.entries(updatedCategoryCount).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} businesses`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixBusinessCategories().then(() => process.exit(0));