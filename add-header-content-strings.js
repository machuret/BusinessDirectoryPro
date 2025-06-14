#!/usr/bin/env node

/**
 * Script to add Header component content strings to the database
 * This ensures all the new translation keys work properly
 */

import { contentStorage } from './server/storage/content-storage.ts';

const headerStrings = [
  {
    key: 'header.navigation.home',
    value: 'Home',
    description: 'Navigation link text for home page',
    category: 'header'
  },
  {
    key: 'header.navigation.categories', 
    value: 'Categories',
    description: 'Navigation link text for categories page',
    category: 'header'
  },
  {
    key: 'header.navigation.featured',
    value: 'Featured', 
    description: 'Navigation link text for featured businesses page',
    category: 'header'
  },
  {
    key: 'header.auth.signIn',
    value: 'Sign In',
    description: 'Text for sign in button',
    category: 'header'
  },
  {
    key: 'header.auth.addBusiness',
    value: 'Add Your Business',
    description: 'Text for add business button', 
    category: 'header'
  },
  {
    key: 'header.userMenu.dashboard',
    value: 'Dashboard',
    description: 'Text for dashboard menu item',
    category: 'header'
  },
  {
    key: 'header.userMenu.adminPanel',
    value: 'Admin Panel',
    description: 'Text for admin panel menu item',
    category: 'header'
  },
  {
    key: 'header.userMenu.signOut',
    value: 'Sign out',
    description: 'Text for sign out menu item',
    category: 'header'
  }
];

async function addHeaderContentStrings() {
  try {
    console.log('Adding Header component content strings...');
    
    for (const stringData of headerStrings) {
      try {
        await contentStorage.upsertContentString(stringData.key, stringData.value, stringData.description, stringData.category);
        console.log(`✓ Added/updated: ${stringData.key}`);
      } catch (error) {
        console.error(`✗ Failed to add ${stringData.key}:`, error.message);
      }
    }
    
    console.log('\n✅ Header content strings migration completed successfully!');
    console.log(`📊 Processed ${headerStrings.length} content strings`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

addHeaderContentStrings();