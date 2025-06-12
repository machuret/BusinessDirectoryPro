import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { 
  services, businessServices,
  type Service, type InsertService, type BusinessService, type InsertBusinessService
} from "@shared/schema";

export class ServicesStorage {
  async getServices(): Promise<Service[]> {
    try {
      const result = await db.select().from(services).orderBy(desc(services.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching services:", error);
      return [];
    }
  }

  async getService(id: number): Promise<Service | undefined> {
    try {
      const [service] = await db.select().from(services).where(eq(services.id, id));
      return service;
    } catch (error) {
      console.error("Error fetching service:", error);
      return undefined;
    }
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    try {
      const [service] = await db.select().from(services).where(eq(services.slug, slug));
      return service;
    } catch (error) {
      console.error("Error fetching service by slug:", error);
      return undefined;
    }
  }

  async createService(serviceData: InsertService): Promise<Service> {
    const [service] = await db.insert(services)
      .values({
        ...serviceData,
        updatedAt: new Date()
      })
      .returning();
    return service;
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db.update(services)
      .set({
        ...serviceData,
        updatedAt: new Date()
      })
      .where(eq(services.id, id))
      .returning();
    return service;
  }

  async deleteService(id: number): Promise<boolean> {
    try {
      // First remove all business-service associations
      await db.delete(businessServices).where(eq(businessServices.serviceId, id));
      
      // Then delete the service
      const result = await db.delete(services).where(eq(services.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting service:", error);
      return false;
    }
  }

  async getBusinessServices(businessId: string): Promise<Service[]> {
    try {
      const result = await db.select({
        id: services.id,
        name: services.name,
        slug: services.slug,
        description: services.description,
        category: services.category,
        seoTitle: services.seoTitle,
        seoDescription: services.seoDescription,
        content: services.content,
        isActive: services.isActive,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt
      })
      .from(businessServices)
      .innerJoin(services, eq(businessServices.serviceId, services.id))
      .where(and(
        eq(businessServices.businessId, businessId),
        eq(services.isActive, true)
      ));
      return result;
    } catch (error) {
      console.error("Error fetching business services:", error);
      return [];
    }
  }

  async addServiceToBusiness(businessId: string, serviceId: number): Promise<BusinessService> {
    const [association] = await db.insert(businessServices)
      .values({
        businessId,
        serviceId
      })
      .returning();
    return association;
  }

  async removeServiceFromBusiness(businessId: string, serviceId: number): Promise<boolean> {
    try {
      const result = await db.delete(businessServices)
        .where(and(
          eq(businessServices.businessId, businessId),
          eq(businessServices.serviceId, serviceId)
        ));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error removing service from business:", error);
      return false;
    }
  }
}