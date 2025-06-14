import { db } from "../db";
import { featuredRequests, businesses } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface FeaturedRequest {
  id: number;
  businessId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  adminMessage?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface InsertFeaturedRequest {
  businessId: string;
  userId: string;
  message?: string;
}

export interface FeaturedRequestWithBusiness extends FeaturedRequest {
  businessTitle?: string;
  businessCity?: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
}

export class FeaturedRequestsStorage {
  /**
   * Create a new featured request
   */
  static async createFeaturedRequest(data: InsertFeaturedRequest): Promise<FeaturedRequest> {
    // Check if user already has a pending request for this business
    const existing = await db
      .select()
      .from(featuredRequests)
      .where(
        and(
          eq(featuredRequests.businessId, data.businessId),
          eq(featuredRequests.userId, data.userId),
          eq(featuredRequests.status, 'pending')
        )
      );

    if (existing.length > 0) {
      throw new Error('You already have a pending featured request for this business');
    }

    const [request] = await db
      .insert(featuredRequests)
      .values({
        ...data,
        status: 'pending',
        createdAt: new Date()
      })
      .returning();

    return request;
  }

  /**
   * Get featured requests by user ID
   */
  static async getFeaturedRequestsByUser(userId: string): Promise<FeaturedRequestWithBusiness[]> {
    const requests = await db
      .select({
        id: featuredRequests.id,
        businessId: featuredRequests.businessId,
        userId: featuredRequests.userId,
        status: featuredRequests.status,
        message: featuredRequests.message,
        adminMessage: featuredRequests.adminMessage,
        reviewedBy: featuredRequests.reviewedBy,
        reviewedAt: featuredRequests.reviewedAt,
        createdAt: featuredRequests.createdAt,
        updatedAt: featuredRequests.updatedAt,
        businessTitle: businesses.title,
        businessCity: businesses.city
      })
      .from(featuredRequests)
      .leftJoin(businesses, eq(featuredRequests.businessId, businesses.placeid))
      .where(eq(featuredRequests.userId, userId))
      .orderBy(desc(featuredRequests.createdAt));

    return requests.map(request => ({
      ...request,
      createdAt: new Date(request.createdAt),
      reviewedAt: request.reviewedAt ? new Date(request.reviewedAt) : undefined,
      updatedAt: request.updatedAt ? new Date(request.updatedAt) : undefined
    }));
  }

  /**
   * Get all featured requests for admin review
   */
  static async getAllFeaturedRequests(): Promise<FeaturedRequestWithBusiness[]> {
    const requests = await db
      .select({
        id: featuredRequests.id,
        businessId: featuredRequests.businessId,
        userId: featuredRequests.userId,
        status: featuredRequests.status,
        message: featuredRequests.message,
        adminMessage: featuredRequests.adminMessage,
        reviewedBy: featuredRequests.reviewedBy,
        reviewedAt: featuredRequests.reviewedAt,
        createdAt: featuredRequests.createdAt,
        updatedAt: featuredRequests.updatedAt,
        businessTitle: businesses.title,
        businessCity: businesses.city
      })
      .from(featuredRequests)
      .leftJoin(businesses, eq(featuredRequests.businessId, businesses.placeid))
      .orderBy(desc(featuredRequests.createdAt));

    return requests.map(request => ({
      ...request,
      createdAt: new Date(request.createdAt),
      reviewedAt: request.reviewedAt ? new Date(request.reviewedAt) : undefined,
      updatedAt: request.updatedAt ? new Date(request.updatedAt) : undefined
    }));
  }

  /**
   * Update featured request status (admin action)
   */
  static async updateFeaturedRequestStatus(
    id: number,
    status: 'approved' | 'rejected',
    adminMessage?: string,
    reviewedBy?: string
  ): Promise<FeaturedRequest | null> {
    const [updated] = await db
      .update(featuredRequests)
      .set({
        status,
        adminMessage,
        reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(featuredRequests.id, id))
      .returning();

    if (!updated) return null;

    // If approved, update the business featured status
    if (status === 'approved') {
      await db
        .update(businesses)
        .set({ featured: true })
        .where(eq(businesses.placeid, updated.businessId));
    }

    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      reviewedAt: updated.reviewedAt ? new Date(updated.reviewedAt) : undefined,
      updatedAt: updated.updatedAt ? new Date(updated.updatedAt) : undefined
    };
  }

  /**
   * Get featured request by ID
   */
  static async getFeaturedRequestById(id: number): Promise<FeaturedRequest | null> {
    const [request] = await db
      .select()
      .from(featuredRequests)
      .where(eq(featuredRequests.id, id));

    if (!request) return null;

    return {
      ...request,
      createdAt: new Date(request.createdAt),
      reviewedAt: request.reviewedAt ? new Date(request.reviewedAt) : undefined,
      updatedAt: request.updatedAt ? new Date(request.updatedAt) : undefined
    };
  }

  /**
   * Check if business is eligible for featured request
   */
  static async isBusinessEligibleForFeatured(businessId: string, userId: string): Promise<boolean> {
    // Check if user owns the business
    const [business] = await db
      .select()
      .from(businesses)
      .where(
        and(
          eq(businesses.placeid, businessId),
          eq(businesses.ownerid, userId)
        )
      );

    if (!business) return false;

    // Check if business is already featured
    if (business.featured) return false;

    // Check if there's already a pending request
    const [existingRequest] = await db
      .select()
      .from(featuredRequests)
      .where(
        and(
          eq(featuredRequests.businessId, businessId),
          eq(featuredRequests.userId, userId),
          eq(featuredRequests.status, 'pending')
        )
      );

    return !existingRequest;
  }
}