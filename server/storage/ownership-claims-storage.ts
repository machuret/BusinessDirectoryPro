import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "../db";
import { 
  ownershipClaims, users, businesses,
  type OwnershipClaim, type InsertOwnershipClaim
} from "@shared/schema";

/**
 * OwnershipClaimsStorage handles all database operations for business ownership claims
 * 
 * Features:
 * - Create ownership claims with proper validation
 * - Retrieve claims with business and user information
 * - Update claim status with admin review capabilities
 * - Comprehensive error handling and logging
 */
export class OwnershipClaimsStorage {
  
  /**
   * Get all ownership claims with associated business and user data
   * Ordered by creation date (newest first)
   */
  async getAllOwnershipClaims(): Promise<OwnershipClaimWithDetails[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          oc.*,
          b.title as business_title,
          b.slug as business_slug,
          u.email as user_email,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          reviewer.email as reviewer_email
        FROM ownership_claims oc
        LEFT JOIN businesses b ON oc.business_id = b.placeid
        LEFT JOIN users u ON oc.user_id = u.id
        LEFT JOIN users reviewer ON oc.reviewed_by = reviewer.id
        ORDER BY oc.created_at DESC
      `);

      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        businessId: row.business_id,
        status: row.status,
        message: row.message,
        adminMessage: row.admin_message,
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        businessTitle: row.business_title,
        businessSlug: row.business_slug,
        userEmail: row.user_email,
        userFirstName: row.user_first_name,
        userLastName: row.user_last_name,
        reviewerEmail: row.reviewer_email
      }));
    } catch (error) {
      console.error("Error fetching ownership claims:", error);
      throw new Error("Failed to retrieve ownership claims");
    }
  }

  /**
   * Get ownership claims for a specific user
   */
  async getOwnershipClaimsByUser(userId: string): Promise<OwnershipClaimWithDetails[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          oc.*,
          b.title as business_title,
          b.slug as business_slug
        FROM ownership_claims oc
        LEFT JOIN businesses b ON oc.business_id = b.placeid
        WHERE oc.user_id = ${userId}
        ORDER BY oc.created_at DESC
      `);

      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        businessId: row.business_id,
        status: row.status,
        message: row.message,
        adminMessage: row.admin_message,
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        businessTitle: row.business_title,
        businessSlug: row.business_slug
      }));
    } catch (error) {
      console.error(`Error fetching ownership claims for user ${userId}:`, error);
      throw new Error("Failed to retrieve user ownership claims");
    }
  }

  /**
   * Get ownership claims for a specific business
   */
  async getOwnershipClaimsByBusiness(businessId: string): Promise<OwnershipClaimWithDetails[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          oc.*,
          u.email as user_email,
          u.first_name as user_first_name,
          u.last_name as user_last_name
        FROM ownership_claims oc
        LEFT JOIN users u ON oc.user_id = u.id
        WHERE oc.business_id = ${businessId}
        ORDER BY oc.created_at DESC
      `);

      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        businessId: row.business_id,
        status: row.status,
        message: row.message,
        adminMessage: row.admin_message,
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        userEmail: row.user_email,
        userFirstName: row.user_first_name,
        userLastName: row.user_last_name
      }));
    } catch (error) {
      console.error(`Error fetching ownership claims for business ${businessId}:`, error);
      throw new Error("Failed to retrieve business ownership claims");
    }
  }

  /**
   * Create a new ownership claim
   * Validates that the business exists and user hasn't already claimed it
   */
  async createOwnershipClaim(claimData: InsertOwnershipClaim): Promise<OwnershipClaim> {
    try {
      // Validate business exists
      const businessExists = await db.execute(sql`
        SELECT 1 FROM businesses WHERE placeid = ${claimData.businessId} LIMIT 1
      `);
      
      if (businessExists.rows.length === 0) {
        throw new Error("Business not found");
      }

      // Check for existing pending/approved claims by this user for this business
      const existingClaim = await db.execute(sql`
        SELECT 1 FROM ownership_claims 
        WHERE user_id = ${claimData.userId} 
        AND business_id = ${claimData.businessId}
        AND status IN ('pending', 'approved')
        LIMIT 1
      `);

      if (existingClaim.rows.length > 0) {
        throw new Error("You have already submitted a claim for this business");
      }

      // Create the claim
      const [created] = await db
        .insert(ownershipClaims)
        .values({
          ...claimData,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      console.log(`New ownership claim created: ID ${created.id} for business ${claimData.businessId} by user ${claimData.userId}`);
      return created;
    } catch (error) {
      console.error("Error creating ownership claim:", error);
      
      if (error instanceof Error) {
        throw error; // Re-throw known errors
      }
      
      throw new Error("Failed to create ownership claim");
    }
  }

  /**
   * Update ownership claim status with admin review
   */
  async updateOwnershipClaim(
    id: number, 
    status: 'pending' | 'approved' | 'rejected', 
    adminMessage?: string, 
    reviewedBy?: string
  ): Promise<OwnershipClaim | undefined> {
    try {
      const [updated] = await db
        .update(ownershipClaims)
        .set({
          status,
          adminMessage,
          reviewedBy,
          reviewedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(ownershipClaims.id, id))
        .returning();

      if (!updated) {
        throw new Error(`Ownership claim with ID ${id} not found`);
      }

      console.log(`Ownership claim ${id} updated to status: ${status} by admin ${reviewedBy}`);
      return updated;
    } catch (error) {
      console.error(`Error updating ownership claim ${id}:`, error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error("Failed to update ownership claim");
    }
  }

  /**
   * Delete an ownership claim (admin only)
   */
  async deleteOwnershipClaim(id: number): Promise<void> {
    try {
      const result = await db
        .delete(ownershipClaims)
        .where(eq(ownershipClaims.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error(`Ownership claim with ID ${id} not found`);
      }

      console.log(`Ownership claim ${id} deleted`);
    } catch (error) {
      console.error(`Error deleting ownership claim ${id}:`, error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error("Failed to delete ownership claim");
    }
  }

  /**
   * Get ownership claim by ID with full details
   */
  async getOwnershipClaim(id: number): Promise<OwnershipClaimWithDetails | undefined> {
    try {
      const result = await db.execute(sql`
        SELECT 
          oc.*,
          b.title as business_title,
          b.slug as business_slug,
          u.email as user_email,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          reviewer.email as reviewer_email
        FROM ownership_claims oc
        LEFT JOIN businesses b ON oc.business_id = b.placeid
        LEFT JOIN users u ON oc.user_id = u.id
        LEFT JOIN users reviewer ON oc.reviewed_by = reviewer.id
        WHERE oc.id = ${id}
        LIMIT 1
      `);

      if (result.rows.length === 0) {
        return undefined;
      }

      const row = result.rows[0] as any;
      return {
        id: row.id,
        userId: row.user_id,
        businessId: row.business_id,
        status: row.status,
        message: row.message,
        adminMessage: row.admin_message,
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        businessTitle: row.business_title,
        businessSlug: row.business_slug,
        userEmail: row.user_email,
        userFirstName: row.user_first_name,
        userLastName: row.user_last_name,
        reviewerEmail: row.reviewer_email
      };
    } catch (error) {
      console.error(`Error fetching ownership claim ${id}:`, error);
      throw new Error("Failed to retrieve ownership claim");
    }
  }

  /**
   * Get statistics about ownership claims
   */
  async getOwnershipClaimsStats(): Promise<OwnershipClaimsStats> {
    try {
      const result = await db.execute(sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
        FROM ownership_claims
      `);

      const row = result.rows[0] as any;
      return {
        total: parseInt(row.total) || 0,
        pending: parseInt(row.pending) || 0,
        approved: parseInt(row.approved) || 0,
        rejected: parseInt(row.rejected) || 0
      };
    } catch (error) {
      console.error("Error fetching ownership claims stats:", error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }
}

// Extended type with joined data
export interface OwnershipClaimWithDetails extends OwnershipClaim {
  businessTitle?: string;
  businessSlug?: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  reviewerEmail?: string;
}

export interface OwnershipClaimsStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}