/**
 * Fix business categories directly in the database using raw SQL
 */

import { pool } from './server/db.ts';

async function fixCategoriesDirectly() {
  const client = await pool.connect();
  
  try {
    console.log('Fixing business categories directly...');
    
    // Check current distribution
    const current = await client.query(
      'SELECT categoryname, COUNT(*) as count FROM businesses WHERE categoryname IS NOT NULL GROUP BY categoryname ORDER BY categoryname'
    );
    
    console.log('Current categories:');
    current.rows.forEach(row => {
      console.log(`  ${row.categoryname}: ${row.count} businesses`);
    });
    
    // Fix categories one by one
    console.log('\nUpdating categories...');
    
    // Fix "Dental clinic" -> "Dentist"
    const dentalResult = await client.query(
      'UPDATE businesses SET categoryname = $1 WHERE categoryname = $2',
      ['Dentist', 'Dental clinic']
    );
    console.log(`✓ Updated ${dentalResult.rowCount} businesses from "Dental clinic" to "Dentist"`);
    
    // Fix "Orthodontist" -> "Orthodontist in Pekin"
    const orthodontistResult = await client.query(
      'UPDATE businesses SET categoryname = $1 WHERE categoryname = $2',
      ['Orthodontist in Pekin', 'Orthodontist']
    );
    console.log(`✓ Updated ${orthodontistResult.rowCount} businesses from "Orthodontist" to "Orthodontist in Pekin"`);
    
    // Fix "Mexican restaurant" -> "Restaurants" 
    const mexicanResult = await client.query(
      'UPDATE businesses SET categoryname = $1 WHERE categoryname = $2',
      ['Restaurants', 'Mexican restaurant']
    );
    console.log(`✓ Updated ${mexicanResult.rowCount} businesses from "Mexican restaurant" to "Restaurants"`);
    
    // Fix "Restaurant" -> "Restaurants"
    const restaurantResult = await client.query(
      'UPDATE businesses SET categoryname = $1 WHERE categoryname = $2',
      ['Restaurants', 'Restaurant']
    );
    console.log(`✓ Updated ${restaurantResult.rowCount} businesses from "Restaurant" to "Restaurants"`);
    
    // Check final distribution
    const final = await client.query(
      'SELECT categoryname, COUNT(*) as count FROM businesses WHERE categoryname IS NOT NULL GROUP BY categoryname ORDER BY categoryname'
    );
    
    console.log('\nFinal categories:');
    final.rows.forEach(row => {
      console.log(`  ${row.categoryname}: ${row.count} businesses`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
  }
}

fixCategoriesDirectly().then(() => process.exit(0));