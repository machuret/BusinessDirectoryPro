/**
 * Fix category case mismatch - "Dentist" should be "dentist"
 */

import { pool } from './server/db.ts';

async function fixCategoryCase() {
  const client = await pool.connect();
  
  try {
    console.log('Fixing category case mismatch...');
    
    // Fix "Dentist" -> "dentist" to match official category
    const result = await client.query(
      'UPDATE businesses SET categoryname = $1 WHERE categoryname = $2',
      ['dentist', 'Dentist']
    );
    
    console.log(`✓ Updated ${result.rowCount} businesses from "Dentist" to "dentist"`);
    
    // Verify final distribution
    const final = await client.query(
      'SELECT categoryname, COUNT(*) as count FROM businesses WHERE categoryname IS NOT NULL GROUP BY categoryname ORDER BY categoryname'
    );
    
    console.log('Final category distribution:');
    final.rows.forEach(row => {
      console.log(`  ${row.categoryname}: ${row.count} businesses`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
  }
}

fixCategoryCase().then(() => process.exit(0));