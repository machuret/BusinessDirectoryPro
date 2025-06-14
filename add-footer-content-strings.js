/**
 * Script to add Footer component content strings to the database
 * This ensures all the new translation keys work properly
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function addFooterContentStrings() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/businessdirectory'
  });

  try {
    console.log('Adding Footer component content strings...');

    // Footer content strings based on the refactored component
    const footerStrings = [
      // Company section
      {
        key: 'footer.company.name',
        value: 'BusinessHub',
        category: 'footer',
        description: 'Company name displayed in footer'
      },
      {
        key: 'footer.company.description',
        value: 'Your trusted local business directory connecting customers with quality service providers across the nation.',
        category: 'footer',
        description: 'Company description text in footer'
      },

      // Social media aria labels
      {
        key: 'footer.social.facebook',
        value: 'Facebook',
        category: 'footer',
        description: 'Facebook social media link aria label'
      },
      {
        key: 'footer.social.twitter',
        value: 'Twitter',
        category: 'footer',
        description: 'Twitter social media link aria label'
      },
      {
        key: 'footer.social.instagram',
        value: 'Instagram',
        category: 'footer',
        description: 'Instagram social media link aria label'
      },
      {
        key: 'footer.social.linkedin',
        value: 'LinkedIn',
        category: 'footer',
        description: 'LinkedIn social media link aria label'
      },

      // Section headers
      {
        key: 'footer.sections.quickLinks',
        value: 'Quick Links',
        category: 'footer',
        description: 'Quick Links section header'
      },
      {
        key: 'footer.sections.forBusinesses',
        value: 'For Businesses',
        category: 'footer',
        description: 'For Businesses section header'
      },
      {
        key: 'footer.sections.resources',
        value: 'Resources',
        category: 'footer',
        description: 'Resources section header'
      },
      {
        key: 'footer.sections.support',
        value: 'Support',
        category: 'footer',
        description: 'Support section header'
      },

      // Business links
      {
        key: 'footer.links.listBusiness',
        value: 'List Your Business',
        category: 'footer',
        description: 'List Your Business link text'
      },
      {
        key: 'footer.links.businessDashboard',
        value: 'Business Dashboard',
        category: 'footer',
        description: 'Business Dashboard link text'
      },
      {
        key: 'footer.links.featuredBusinesses',
        value: 'Featured Businesses',
        category: 'footer',
        description: 'Featured Businesses link text'
      },
      {
        key: 'footer.links.allCategories',
        value: 'All Categories',
        category: 'footer',
        description: 'All Categories link text'
      },

      // Support links
      {
        key: 'footer.links.contactUs',
        value: 'Contact Us',
        category: 'footer',
        description: 'Contact Us link text'
      },
      {
        key: 'footer.links.aboutUs',
        value: 'About Us',
        category: 'footer',
        description: 'About Us link text'
      },
      {
        key: 'footer.links.privacyPolicy',
        value: 'Privacy Policy',
        category: 'footer',
        description: 'Privacy Policy link text'
      },
      {
        key: 'footer.links.termsOfService',
        value: 'Terms of Service',
        category: 'footer',
        description: 'Terms of Service link text'
      },

      // Copyright notice
      {
        key: 'footer.copyright',
        value: '© 2024 BusinessHub. All rights reserved.',
        category: 'footer',
        description: 'Copyright notice in footer'
      }
    ];

    console.log(`Preparing to add ${footerStrings.length} footer content strings...`);

    // Use upsert to handle existing keys
    for (const contentString of footerStrings) {
      const query = `
        INSERT INTO content_strings (key, value, category, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = EXCLUDED.value,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          updated_at = NOW()
      `;
      
      await pool.query(query, [
        contentString.key,
        contentString.value,
        contentString.category,
        contentString.description
      ]);
      
      console.log(`✓ Added/Updated: ${contentString.key}`);
    }

    console.log('\n✅ Successfully added all Footer content strings to database!');
    console.log('The Footer component is now fully integrated with the content management system.');

  } catch (error) {
    console.error('❌ Error adding Footer content strings:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
addFooterContentStrings()
  .then(() => {
    console.log('\n🎉 Footer content strings migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });