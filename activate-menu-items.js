/**
 * Script to activate all menu items in the database
 * This ensures menu items created before the isActive fix are visible
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function activateAllMenuItems() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Activating all menu items...');
    
    // Update all menu items to be active
    const result = await pool.query(
      'UPDATE menu_items SET "isActive" = true WHERE "isActive" = false OR "isActive" IS NULL'
    );
    
    console.log(`Activated ${result.rowCount} menu items`);
    
    // Show current menu items
    const menuItems = await pool.query('SELECT * FROM menu_items ORDER BY position, "order"');
    console.log('Current menu items:');
    menuItems.rows.forEach(item => {
      console.log(`  - ${item.name} (${item.position}) - Active: ${item.isActive}`);
    });
    
  } catch (error) {
    console.error('Error activating menu items:', error);
  } finally {
    await pool.end();
  }
}

activateAllMenuItems();