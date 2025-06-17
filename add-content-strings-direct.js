/**
 * Script to add missing content strings directly via storage layer
 */

import { db } from './server/db.js';
import { contentStrings } from './shared/schema.js';

async function addMissingContentStrings() {
  console.log('Adding missing business sidebar and footer content strings...');

  const missingStrings = [
    // Business Contact Information
    { key: 'business.contact.title', value: 'Contact Information', description: 'Title for business contact section' },
    { key: 'business.contact.category', value: 'Category', description: 'Label for business category' },
    { key: 'business.contact.visitWebsite', value: 'Visit Website', description: 'Button text to visit business website' },
    { key: 'business.contact.address', value: 'Address', description: 'Label for business address' },
    { key: 'business.contact.phone', value: 'Phone', description: 'Label for business phone number' },
    { key: 'business.contact.email', value: 'Email', description: 'Label for business email' },
    { key: 'business.contact.hours', value: 'Hours', description: 'Label for business operating hours' },
    { key: 'business.contact.getDirections', value: 'Get Directions', description: 'Button text for getting directions' },

    // Footer Content
    { key: 'footer.company.name', value: 'BusinessHub', description: 'Company name in footer' },
    { key: 'footer.company.description', value: 'Your trusted local business directory connecting you with the best services in your area.', description: 'Company description in footer' },
    { key: 'footer.quickLinks.title', value: 'Quick Links', description: 'Title for quick links section in footer' },
    { key: 'footer.quickLinks.home', value: 'Home', description: 'Home link in footer' },
    { key: 'footer.quickLinks.categories', value: 'Categories', description: 'Categories link in footer' },
    { key: 'footer.quickLinks.cities', value: 'Cities', description: 'Cities link in footer' },
    { key: 'footer.quickLinks.addBusiness', value: 'Add Business', description: 'Add business link in footer' },
    { key: 'footer.support.title', value: 'Support', description: 'Title for support section in footer' },
    { key: 'footer.support.contact', value: 'Contact Us', description: 'Contact us link in footer' },
    { key: 'footer.support.help', value: 'Help Center', description: 'Help center link in footer' },
    { key: 'footer.support.privacy', value: 'Privacy Policy', description: 'Privacy policy link in footer' },
    { key: 'footer.support.terms', value: 'Terms of Service', description: 'Terms of service link in footer' },
    { key: 'footer.copyright', value: '© 2025 BusinessHub. All rights reserved.', description: 'Copyright text in footer' },

    // Business Details
    { key: 'business.details.overview', value: 'Overview', description: 'Business overview section title' },
    { key: 'business.details.services', value: 'Services', description: 'Business services section title' },
    { key: 'business.details.reviews', value: 'Reviews', description: 'Business reviews section title' },
    { key: 'business.details.photos', value: 'Photos', description: 'Business photos section title' },
    { key: 'business.details.noDescription', value: 'No description available for this business.', description: 'Fallback text when business has no description' },
    { key: 'business.details.noPhotos', value: 'No photos available.', description: 'Text when no photos are available' },
    { key: 'business.details.noReviews', value: 'No reviews yet. Be the first to review!', description: 'Text when no reviews are available' }
  ];

  try {
    let successCount = 0;
    
    for (const stringData of missingStrings) {
      await db.insert(contentStrings)
        .values(stringData)
        .onConflictDoUpdate({
          target: contentStrings.key,
          set: {
            value: stringData.value,
            description: stringData.description,
            updatedAt: new Date()
          }
        });
      
      console.log(`✓ Added: ${stringData.key}`);
      successCount++;
    }

    console.log(`\nSuccessfully added ${successCount} content strings!`);
    console.log(`The business sidebar and footer should now display properly.`);
    
  } catch (error) {
    console.error('Error adding content strings:', error);
  } finally {
    process.exit(0);
  }
}

addMissingContentStrings();