/**
 * Script to add missing category directory content strings
 */

import { db } from "./server/db.ts";
import { contentStrings } from "./shared/schema.ts";
import { eq } from "drizzle-orm";

async function addMissingCategoryStrings() {
  const stringsToAdd = [
    {
      key: 'categories.directory.title',
      value: 'Business Directory',
      description: 'Main title for the categories directory page'
    },
    {
      key: 'categories.directory.description', 
      value: 'Discover local businesses organized by category. Find exactly what you\'re looking for.',
      description: 'Description for the categories directory page'
    }
  ];

  try {
    for (const stringData of stringsToAdd) {
      // Check if string already exists
      const existing = await db
        .select()
        .from(contentStrings)
        .where(eq(contentStrings.key, stringData.key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(contentStrings).values({
          key: stringData.key,
          value: stringData.value,
          description: stringData.description
        });
        console.log(`✓ Added content string: ${stringData.key}`);
      } else {
        console.log(`• String already exists: ${stringData.key}`);
      }
    }
    
    console.log('\n✅ Category content strings update completed');
  } catch (error) {
    console.error('❌ Error adding category strings:', error);
  }
}

addMissingCategoryStrings().then(() => process.exit(0));