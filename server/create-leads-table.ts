import { db } from "./db";
import { sql } from "drizzle-orm";

export async function createLeadsTable() {
  try {
    console.log("Creating leads table...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES businesses(placeid) ON DELETE CASCADE,
        sender_name TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        sender_phone TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log("Successfully created leads table");
    return true;
  } catch (error) {
    console.error("Error creating leads table:", error);
    return false;
  }
}