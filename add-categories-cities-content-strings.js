/**
 * Script to add Categories and Cities page content strings to the database
 * This ensures all the new CMS strings for categories.tsx and cities.tsx work properly
 */

import { db } from './server/db.js';
import { contentStrings } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function addCategoriesCitiesContentStrings() {
  console.log('Adding Categories and Cities page content strings...');

  const contentStringsToAdd = [
    // Categories page strings
    {
      key: 'categories.loading',
      value: 'Loading...',
      description: 'Loading message for categories page'
    },
    {
      key: 'categories.browsing.title',
      value: 'Browse by Category',
      description: 'Title for browsing categories section'
    },
    {
      key: 'categories.businesses.categoryTitle',
      value: '{categoryName} Businesses',
      description: 'Title for businesses in a specific category'
    },
    {
      key: 'categories.businesses.allTitle',
      value: 'All Businesses',
      description: 'Title for all businesses section'
    },
    {
      key: 'categories.businesses.businessSingular',
      value: 'business',
      description: 'Singular form of business'
    },
    {
      key: 'categories.businesses.businessPlural',
      value: 'businesses',
      description: 'Plural form of business'
    },
    {
      key: 'categories.empty.title',
      value: 'No businesses found',
      description: 'Title for empty state when no businesses are found'
    },
    {
      key: 'categories.empty.categoryDescription',
      value: 'No businesses are currently listed in the {categoryName} category.',
      description: 'Description for empty state in specific category'
    },
    {
      key: 'categories.empty.generalDescription',
      value: 'No businesses are currently listed.',
      description: 'Description for empty state in general'
    },
    {
      key: 'categories.empty.listButton',
      value: 'List Your Business',
      description: 'Button text to list a business'
    },

    // Cities page strings
    {
      key: 'cities.loading',
      value: 'Loading...',
      description: 'Loading message for cities page'
    },
    {
      key: 'cities.browsing.title',
      value: 'Browse by City',
      description: 'Title for browsing cities section'
    },
    {
      key: 'cities.browsing.description',
      value: 'Discover local businesses in cities across our directory',
      description: 'Description for browsing cities section'
    },
    {
      key: 'cities.businesses.singular',
      value: 'business',
      description: 'Singular form of business for cities'
    },
    {
      key: 'cities.businesses.plural',
      value: 'businesses',
      description: 'Plural form of business for cities'
    },
    {
      key: 'cities.empty.title',
      value: 'No cities found',
      description: 'Title for empty state when no cities are found'
    },
    {
      key: 'cities.empty.description',
      value: 'No businesses with city information are available.',
      description: 'Description for empty state when no cities are found'
    },
    {
      key: 'cities.breadcrumbs.home',
      value: 'Home',
      description: 'Home breadcrumb text'
    },
    {
      key: 'cities.breadcrumbs.cities',
      value: 'Cities',
      description: 'Cities breadcrumb text'
    },
    {
      key: 'cities.cityPage.title',
      value: 'Businesses in {cityName}',
      description: 'Title for specific city page'
    },
    {
      key: 'cities.cityPage.description',
      value: 'Discover local businesses and services in {cityName}',
      description: 'Description for specific city page'
    },
    {
      key: 'cities.cityEmpty.title',
      value: 'No businesses found in {cityName}',
      description: 'Title for empty state in specific city'
    },
    {
      key: 'cities.cityEmpty.description',
      value: 'We don\'t have any businesses listed for this city yet.',
      description: 'Description for empty state in specific city'
    },
    {
      key: 'cities.cityEmpty.browseLink',
      value: 'Browse other cities',
      description: 'Link text to browse other cities'
    }
  ];

  try {
    let addedCount = 0;
    let skippedCount = 0;

    for (const contentString of contentStringsToAdd) {
      try {
        // Check if the content string already exists
        const existing = await db
          .select()
          .from(contentStrings)
          .where(eq(contentStrings.key, contentString.key))
          .limit(1);

        if (existing.length > 0) {
          console.log(`Skipping existing content string: ${contentString.key}`);
          skippedCount++;
          continue;
        }

        // Insert the content string
        await db.insert(contentStrings).values({
          key: contentString.key,
          value: contentString.value,
          description: contentString.description,
          category: 'page_content',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log(`Added content string: ${contentString.key}`);
        addedCount++;
      } catch (error) {
        console.error(`Error adding content string ${contentString.key}:`, error);
      }
    }

    console.log(`\nCategories and Cities content strings setup completed!`);
    console.log(`Added: ${addedCount} content strings`);
    console.log(`Skipped: ${skippedCount} existing content strings`);
    console.log(`Total processed: ${contentStringsToAdd.length} content strings`);

  } catch (error) {
    console.error('Error setting up Categories and Cities content strings:', error);
    throw error;
  }
}

// Run the function
addCategoriesCitiesContentStrings()
  .then(() => {
    console.log('Categories and Cities content strings setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to setup Categories and Cities content strings:', error);
    process.exit(1);
  });