import { db } from "./db.js";
import { socialMediaLinks } from "@shared/schema";

export async function createSocialMediaTable() {
  try {
    console.log('Creating social_media_links table...');
    
    // Create the table using raw SQL to ensure proper structure
    await db.execute(`
      CREATE TABLE IF NOT EXISTS social_media_links (
        id SERIAL PRIMARY KEY,
        platform VARCHAR NOT NULL UNIQUE,
        url TEXT NOT NULL,
        icon_class VARCHAR NOT NULL,
        display_name VARCHAR NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create index for sorting
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_social_media_sort_order 
      ON social_media_links(sort_order, is_active);
    `);

    console.log('Successfully created social_media_links table');
    
    // Insert default social media platforms
    const defaultPlatforms = [
      {
        platform: 'facebook',
        url: '',
        iconClass: 'fab fa-facebook-f',
        displayName: 'Facebook',
        isActive: false,
        sortOrder: 1
      },
      {
        platform: 'twitter',
        url: '',
        iconClass: 'fab fa-twitter',
        displayName: 'Twitter',
        isActive: false,
        sortOrder: 2
      },
      {
        platform: 'instagram',
        url: '',
        iconClass: 'fab fa-instagram',
        displayName: 'Instagram',
        isActive: false,
        sortOrder: 3
      },
      {
        platform: 'linkedin',
        url: '',
        iconClass: 'fab fa-linkedin-in',
        displayName: 'LinkedIn',
        isActive: false,
        sortOrder: 4
      },
      {
        platform: 'youtube',
        url: '',
        iconClass: 'fab fa-youtube',
        displayName: 'YouTube',
        isActive: false,
        sortOrder: 5
      },
      {
        platform: 'tiktok',
        url: '',
        iconClass: 'fab fa-tiktok',
        displayName: 'TikTok',
        isActive: false,
        sortOrder: 6
      }
    ];

    for (const platform of defaultPlatforms) {
      await db.execute(`
        INSERT INTO social_media_links (platform, url, icon_class, display_name, is_active, sort_order)
        VALUES ('${platform.platform}', '${platform.url}', '${platform.iconClass}', '${platform.displayName}', ${platform.isActive}, ${platform.sortOrder})
        ON CONFLICT (platform) DO NOTHING;
      `);
    }

    console.log('Successfully seeded default social media platforms');

  } catch (error) {
    console.error('Error creating social_media_links table:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createSocialMediaTable()
    .then(() => {
      console.log('Social media table setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to setup social media table:', error);
      process.exit(1);
    });
}