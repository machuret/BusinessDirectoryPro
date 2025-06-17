/**
 * Simple script to add missing category content strings using raw SQL
 */

import { pool } from "./server/db.ts";

async function fixCategoryStrings() {
  const client = await pool.connect();
  
  try {
    // Add the missing content strings
    await client.query(`
      INSERT INTO content_strings (string_key, default_value, category, description, created_at, updated_at) 
      VALUES 
        ($1, $2, $3, $4, NOW(), NOW()),
        ($5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT (string_key) DO UPDATE SET
        default_value = EXCLUDED.default_value,
        description = EXCLUDED.description,
        updated_at = NOW()
    `, [
      'categories.directory.title',
      'Business Directory',
      'categories',
      'Main title for the categories directory page',
      'categories.directory.description',
      'Discover local businesses organized by category. Find exactly what you are looking for.',
      'categories',
      'Description for the categories directory page'
    ]);
    
    console.log('✅ Successfully added category content strings');
    
    // Verify the strings were added
    const result = await client.query(
      "SELECT key, value FROM content_strings WHERE key IN ($1, $2)",
      ['categories.directory.title', 'categories.directory.description']
    );
    
    console.log('📋 Added strings:');
    result.rows.forEach(row => {
      console.log(`  ${row.key}: ${row.value}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
  }
}

fixCategoryStrings().then(() => process.exit(0));