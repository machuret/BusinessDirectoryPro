import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function createMenuTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        position VARCHAR(50) NOT NULL DEFAULT 'header',
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    console.log('Menu items table created successfully');
    
    // Add some default menu items
    await db.execute(sql`
      INSERT INTO menu_items (name, url, position, "order") VALUES
      ('Home', '/', 'header', 1),
      ('Categories', '/categories', 'header', 2),
      ('Featured', '/featured', 'header', 3),
      ('About Us', '/about', 'footer', 1),
      ('Contact', '/contact', 'footer', 2),
      ('Privacy Policy', '/privacy', 'footer', 3)
      ON CONFLICT DO NOTHING
    `);
    
    console.log('Default menu items added');
    process.exit(0);
  } catch (error) {
    console.error('Error creating menu table:', error);
    process.exit(1);
  }
}

createMenuTable();