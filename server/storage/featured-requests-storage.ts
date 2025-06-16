import { db } from "../db";
import { featuredRequests, businesses, reviews } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

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

export interface FeaturedRequestWithBusiness extends FeaturedRequest {
  businessTitle?: string;
  businessCity?: string;
}

export interface FeaturedRequestWithBusinessDetails extends FeaturedRequest {
  businessTitle?: string;
  businessCity?: string;
  businessDescription?: string;
  businessRating?: number;
  businessCategoryName?: string;
  businessPhone?: string;
  businessWebsite?: string;
  businessAddress?: string;
  businessReviewCount?: number;
}

export class FeaturedRequestsStorage {
  /**
   * Create a new featured request
   */
  static async createFeaturedRequest(data: {
    businessId: string;
    userId: string;
    message?: string;
  }): Promise<FeaturedRequest> {
    const [request] = await db
      .insert(featuredRequests)
      .values({
        ...data,
        status: 'pending',
        createdAt: new Date()
      })
      .returning();

    return {
      ...request,
      status: request.status as 'pending' | 'approved' | 'rejected',
      message: request.message || undefined,
      adminMessage: request.adminMessage || undefined,
      reviewedBy: request.reviewedBy || undefined,
      createdAt: new Date(request.createdAt),
      reviewedAt: request.reviewedAt ? new Date(request.reviewedAt) : undefined,
      updatedAt: request.updatedAt ? new Date(request.updatedAt) : undefined
    };
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
      status: request.status as 'pending' | 'approved' | 'rejected',
      businessTitle: request.businessTitle || undefined,
      businessCity: request.businessCity || undefined,
      message: request.message || undefined,
      adminMessage: request.adminMessage || undefined,
      reviewedBy: request.reviewedBy || undefined,
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
      status: request.status as 'pending' | 'approved' | 'rejected',
      businessTitle: request.businessTitle || undefined,
      businessCity: request.businessCity || undefined,
      message: request.message || undefined,
      adminMessage: request.adminMessage || undefined,
      reviewedBy: request.reviewedBy || undefined,
      createdAt: new Date(request.createdAt),
      reviewedAt: request.reviewedAt ? new Date(request.reviewedAt) : undefined,
      updatedAt: request.updatedAt ? new Date(request.updatedAt) : undefined
    }));
  }

  /**
   * Get all featured requests with comprehensive business details for admin review
   */
  static async getAllFeaturedRequestsWithBusinessDetails(): Promise<FeaturedRequestWithBusinessDetails[]> {
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
        businessCity: businesses.city,
        businessDescription: businesses.description,
        businessCategoryName: businesses.categoryname,
        businessPhone: businesses.phone,
        businessWebsite: businesses.website,
        businessAddress: businesses.address
      })
      .from(featuredRequests)
      .leftJoin(businesses, eq(featuredRequests.businessId, businesses.placeid))
      .orderBy(desc(featuredRequests.createdAt));

    // Get review counts for each business
    const businessIds = requests.map(r => r.businessId).filter(Boolean);
    
    const reviewCounts = await Promise.all(
      businessIds.map(async (businessId) => {
        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(reviews)
          .where(eq(reviews.businessId, businessId));
        return { businessId, reviewCount: countResult?.count || 0 };
      })
    );

    // Get average ratings for each business
    const ratings = await Promise.all(
      businessIds.map(async (businessId) => {
        const [ratingResult] = await db
          .select({ avgRating: sql<number>`avg(rating)` })
          .from(reviews)
          .where(eq(reviews.businessId, businessId));
        return { businessId, avgRating: ratingResult?.avgRating || 0 };
      })
    );

    return requests.map(request => ({
      ...request,
      status: request.status as 'pending' | 'approved' | 'rejected',
      businessTitle: request.businessTitle || undefined,
      businessCity: request.businessCity || undefined,
      businessDescription: request.businessDescription || undefined,
      businessRating: ratings.find(r => r.businessId === request.businessId)?.avgRating || 0,
      businessCategoryName: request.businessCategoryName || undefined,
      businessPhone: request.businessPhone || undefined,
      businessWebsite: request.businessWebsite || undefined,
      businessAddress: request.businessAddress || undefined,
      businessReviewCount: reviewCounts.find(rc => rc.businessId === request.businessId)?.reviewCount || 0,
      message: request.message || undefined,
      adminMessage: request.adminMessage || undefined,
      reviewedBy: request.reviewedBy || undefined,
      createdAt: new Date(request.createdAt),
      reviewedAt: request.reviewedAt ? new Date(request.reviewedAt) : undefined,
      updatedAt: request.updatedAt ? new Date(request.updatedAt) : undefined
    }));
  }

  /**
   * Update featured request status (approve/reject)
   */
  static async updateFeaturedRequestStatus(
    id: number,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    adminMessage?: string
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

    // If approved, also update the business to be featured
    if (status === 'approved') {
      await db
        .update(businesses)
        .set({ featured: true })
        .where(eq(businesses.placeid, updated.businessId));
    }

    return {
      ...updated,
      status: updated.status as 'pending' | 'approved' | 'rejected',
      message: updated.message || undefined,
      adminMessage: updated.adminMessage || undefined,
      reviewedBy: updated.reviewedBy || undefined,
      createdAt: new Date(updated.createdAt),
      reviewedAt: updated.reviewedAt ? new Date(updated.reviewedAt) : undefined,
      updatedAt: updated.updatedAt ? new Date(updated.updatedAt) : undefined
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