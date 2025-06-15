import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "../db";
import { 
  leads, businesses, ownershipClaims,
  type Lead, type InsertLead, type LeadWithBusiness
} from "@shared/schema";

export class LeadsStorage {
  
  /**
   * Check if a business is owned/claimed by determining if there's an approved ownership claim
   */
  async isBusinessClaimed(businessId: string): Promise<{ isClaimed: boolean; ownerId?: string }> {
    try {
      const result = await db.execute(sql`
        SELECT user_id, status 
        FROM ownership_claims 
        WHERE business_id = ${businessId} AND status = 'approved'
        LIMIT 1
      `);
      
      if (result.rows.length > 0) {
        return { 
          isClaimed: true, 
          ownerId: result.rows[0].user_id as string 
        };
      }
      
      return { isClaimed: false };
    } catch (error) {
      console.error(`Error checking business ownership for ${businessId}:`, error);
      return { isClaimed: false };
    }
  }

  /**
   * Get leads for admin - only shows leads from unclaimed businesses
   */
  async getAdminLeads(): Promise<LeadWithBusiness[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          l.*,
          b.title as business_title,
          b.placeid as business_placeid
        FROM leads l
        LEFT JOIN businesses b ON l.business_id = b.placeid
        WHERE l.business_id NOT IN (
          SELECT DISTINCT business_id 
          FROM ownership_claims 
          WHERE status = 'approved'
        )
        ORDER BY l.created_at DESC
      `);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        businessId: row.business_id,
        senderName: row.sender_name,
        senderEmail: row.sender_email,
        senderPhone: row.sender_phone,
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        business: {
          title: row.business_title || 'Unknown Business',
          placeid: row.business_placeid || row.business_id
        }
      })) as LeadWithBusiness[];
    } catch (error) {
      console.error("Error fetching admin leads:", error);
      throw new Error("Failed to retrieve admin leads");
    }
  }

  /**
   * Get leads for a specific business owner - only shows leads from their claimed businesses
   */
  async getOwnerLeads(ownerId: string): Promise<LeadWithBusiness[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          l.*,
          b.title as business_title,
          b.placeid as business_placeid
        FROM leads l
        LEFT JOIN businesses b ON l.business_id = b.placeid
        INNER JOIN ownership_claims oc ON l.business_id = oc.business_id
        WHERE oc.user_id = ${ownerId} AND oc.status = 'approved'
        ORDER BY l.created_at DESC
      `);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        businessId: row.business_id,
        senderName: row.sender_name,
        senderEmail: row.sender_email,
        senderPhone: row.sender_phone,
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        business: {
          title: row.business_title || 'Unknown Business',
          placeid: row.business_placeid || row.business_id
        }
      })) as LeadWithBusiness[];
    } catch (error) {
      console.error(`Error fetching owner leads for ${ownerId}:`, error);
      throw new Error("Failed to retrieve owner leads");
    }
  }

  async getLeads(): Promise<LeadWithBusiness[]> {
    return await db
      .select({
        id: leads.id,
        businessId: leads.businessId,
        senderName: leads.senderName,
        senderEmail: leads.senderEmail,
        senderPhone: leads.senderPhone,
        message: leads.message,
        status: leads.status,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        business: {
          title: businesses.title,
          placeid: businesses.placeid
        }
      })
      .from(leads)
      .leftJoin(businesses, eq(leads.businessId, businesses.placeid))
      .orderBy(desc(leads.createdAt));
  }

  async getLead(id: number): Promise<LeadWithBusiness | undefined> {
    const [lead] = await db
      .select({
        id: leads.id,
        businessId: leads.businessId,
        senderName: leads.senderName,
        senderEmail: leads.senderEmail,
        senderPhone: leads.senderPhone,
        message: leads.message,
        status: leads.status,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        business: {
          title: businesses.title,
          placeid: businesses.placeid
        }
      })
      .from(leads)
      .leftJoin(businesses, eq(leads.businessId, businesses.placeid))
      .where(eq(leads.id, id));
    return lead;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [created] = await db.insert(leads).values(lead).returning();
    return created;
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead | undefined> {
    const [updated] = await db
      .update(leads)
      .set({ status, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getLeadsByBusiness(businessId: string): Promise<LeadWithBusiness[]> {
    return await db
      .select({
        id: leads.id,
        businessId: leads.businessId,
        senderName: leads.senderName,
        senderEmail: leads.senderEmail,
        senderPhone: leads.senderPhone,
        message: leads.message,
        status: leads.status,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        business: {
          title: businesses.title,
          placeid: businesses.placeid
        }
      })
      .from(leads)
      .leftJoin(businesses, eq(leads.businessId, businesses.placeid))
      .where(eq(leads.businessId, businessId))
      .orderBy(desc(leads.createdAt));
  }
}