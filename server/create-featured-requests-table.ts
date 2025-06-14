import { db } from "./db";

export async function createFeaturedRequestsTable() {
  try {
    console.log("Creating featured_requests table...");
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS featured_requests (
        id SERIAL PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES businesses(placeid) ON DELETE CASCADE,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR NOT NULL DEFAULT 'pending',
        message TEXT,
        admin_message TEXT,
        reviewed_by VARCHAR REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT featured_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
      );
    `);
    
    console.log("Successfully created featured_requests table");
    return true;
  } catch (error) {
    console.error("Error creating featured_requests table:", error);
    return false;
  }
}