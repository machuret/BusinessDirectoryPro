import { db } from "./db";

export async function createSiteSettingsTable() {
  try {
    console.log('Creating site_settings table...');
    
    // Create the table using raw SQL to ensure proper structure
    await db.execute(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR NOT NULL UNIQUE,
        value TEXT,
        description TEXT,
        category VARCHAR,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create index for key lookups
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_site_settings_key 
      ON site_settings(key);
    `);

    console.log('Successfully created site_settings table');

    // Seed initial site settings
    const defaultSettings = [
      {
        key: 'site_title',
        value: 'Business Directory',
        description: 'Main title of the website',
        category: 'general'
      },
      {
        key: 'site_description', 
        value: 'Find the best local businesses in your area',
        description: 'Site meta description for SEO',
        category: 'seo'
      },
      {
        key: 'contact_email',
        value: 'contact@businessdirectory.com',
        description: 'Main contact email address',
        category: 'contact'
      },
      {
        key: 'support_phone',
        value: '+1 (555) 123-4567',
        description: 'Support phone number',
        category: 'contact'
      },
      {
        key: 'featured_businesses_limit',
        value: '6',
        description: 'Number of featured businesses to display on homepage',
        category: 'display'
      },
      {
        key: 'enable_user_registration',
        value: 'true',
        description: 'Allow new user registrations',
        category: 'features'
      }
    ];

    for (const setting of defaultSettings) {
      await db.execute(`
        INSERT INTO site_settings (key, value, description, category)
        VALUES ('${setting.key}', '${setting.value}', '${setting.description}', '${setting.category}')
        ON CONFLICT (key) DO NOTHING;
      `);
    }

    console.log('Successfully seeded default site settings');

  } catch (error) {
    console.error('Error creating site_settings table:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSiteSettingsTable()
    .then(() => {
      console.log('Site settings table setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to setup site settings table:', error);
      process.exit(1);
    });
}