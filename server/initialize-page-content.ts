import { db } from "./db";
import { pageContent } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function initializePageContent() {
  try {
    console.log("Initializing page content...");
    
    // Create the table using raw SQL
    await db.execute(`
      CREATE TABLE IF NOT EXISTS page_content (
        id SERIAL PRIMARY KEY,
        page_key VARCHAR NOT NULL UNIQUE,
        title VARCHAR NOT NULL,
        content TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Insert default content for Get Featured page
    const existingContent = await db.select().from(pageContent).where(eq(pageContent.pageKey, 'get-featured'));
    
    if (existingContent.length === 0) {
      await db.insert(pageContent).values({
        pageKey: 'get-featured',
        title: 'Get Featured',
        content: `Ready to boost your business visibility? Getting featured in our directory puts your business in front of thousands of potential customers.

**Why Get Featured?**
• Increased visibility in search results
• Priority placement on our homepage
• Enhanced business profile with special badge
• Higher customer discovery rates

**Requirements:**
• Must be a verified business owner
• Business profile should be complete
• Good standing in our community

Submit your request below and our team will review it within 24-48 hours.`,
        isActive: true
      });
      console.log("Added default Get Featured page content");
    }

    console.log("Page content initialization completed");
    return true;
  } catch (error) {
    console.error("Error initializing page content:", error);
    return false;
  }
}