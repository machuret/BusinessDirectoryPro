import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { 
  leads, businesses,
  type Lead, type InsertLead, type LeadWithBusiness
} from "@shared/schema";

export class LeadsStorage {
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