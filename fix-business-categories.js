/**
 * Fix business category naming inconsistencies
 * Map mismatched category names to official categories
 */

import { pool } from "./server/db.ts";

async function fixBusinessCategories() {
  const client = await pool.connect();
  
  try {
    console.log('Fixing business category inconsistencies...');
    
    // Map mismatched categories to official ones
    const categoryMappings = [
      { from: 'Dental clinic', to: 'Dentist' },
      { from: 'Orthodontist', to: 'Orthodontist in Pekin' },
      { from: 'Mexican restaurant', to: 'Restaurants' },
      { from: 'Restaurant', to: 'Restaurants' }
    ];
    
    for (const mapping of categoryMappings) {
      const result = await client.query(
        'UPDATE businesses SET categoryname = $1 WHERE categoryname = $2',
        [mapping.to, mapping.from]
      );
      
      console.log(`✓ Updated ${result.rowCount} businesses from "${mapping.from}" to "${mapping.to}"`);
    }
    
    // Verify the changes
    const categories = await client.query(
      'SELECT categoryname, COUNT(*) as count FROM businesses GROUP BY categoryname ORDER BY categoryname'
    );
    
    console.log('\n📋 Updated category distribution:');
    categories.rows.forEach(row => {
      console.log(`  ${row.categoryname}: ${row.count} businesses`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
  }
}

fixBusinessCategories().then(() => process.exit(0));