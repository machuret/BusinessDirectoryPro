import { eq, desc, and } from "drizzle-orm";
import { db } from "../db";
import { 
  reviews, users, businesses,
  type Review, type InsertReview, type User
} from "@shared/schema";

export class ReviewsStorage {
  async getReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    const result = await db
      .select({
        id: reviews.id,
        businessId: reviews.businessId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        authorName: reviews.authorName,
        authorEmail: reviews.authorEmail,
        status: reviews.status,
        adminNotes: reviews.adminNotes,
        createdAt: reviews.createdAt,
        reviewedAt: reviews.reviewedAt,
        reviewedBy: reviews.reviewedBy,
        userFirstName: users.firstName,
        userLastName: users.lastName
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.businessId, businessId))
      .orderBy(desc(reviews.createdAt));

    return result.map(row => ({
      id: row.id,
      businessId: row.businessId,
      userId: row.userId,
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      authorName: row.authorName,
      authorEmail: row.authorEmail,
      status: row.status,
      adminNotes: row.adminNotes,
      createdAt: row.createdAt,
      reviewedAt: row.reviewedAt,
      reviewedBy: row.reviewedBy,
      user: {
        firstName: row.userFirstName,
        lastName: row.userLastName
      }
    }));
  }

  async getApprovedReviewsByBusiness(businessId: string): Promise<(Review & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    const result = await db
      .select({
        id: reviews.id,
        businessId: reviews.businessId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        authorName: reviews.authorName,
        authorEmail: reviews.authorEmail,
        status: reviews.status,
        adminNotes: reviews.adminNotes,
        createdAt: reviews.createdAt,
        reviewedAt: reviews.reviewedAt,
        reviewedBy: reviews.reviewedBy,
        userFirstName: users.firstName,
        userLastName: users.lastName
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(
        eq(reviews.businessId, businessId),
        eq(reviews.status, 'approved')
      ))
      .orderBy(desc(reviews.createdAt));

    // Transform the result to include user object
    return result.map(row => ({
      id: row.id,
      businessId: row.businessId,
      userId: row.userId,
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      authorName: row.authorName,
      authorEmail: row.authorEmail,
      status: row.status,
      adminNotes: row.adminNotes,
      createdAt: row.createdAt,
      reviewedAt: row.reviewedAt,
      reviewedBy: row.reviewedBy,
      user: {
        firstName: row.userFirstName,
        lastName: row.userLastName
      }
    }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async createPublicReview(businessId: string, reviewData: any): Promise<Review> {
    const review: InsertReview = {
      businessId,
      rating: reviewData.rating,
      title: reviewData.title || null,
      comment: reviewData.comment || null,
      authorName: reviewData.authorName || null,
      authorEmail: reviewData.authorEmail || null,
      status: 'pending',
      userId: reviewData.userId || null
    };

    const [created] = await db.insert(reviews).values(review).returning();
    
    // Update business average rating
    await this.updateBusinessRating(businessId);
    
    return created;
  }

  async getPendingReviews(): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.status, 'pending'))
      .orderBy(desc(reviews.createdAt));
  }

  async approveReview(reviewId: number, adminId: string, notes?: string): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({
        status: 'approved',
        adminNotes: notes,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    // Update business rating after approval
    if (updated) {
      await this.updateBusinessRating(updated.businessId);
    }

    return updated;
  }

  async rejectReview(reviewId: number, adminId: string, notes?: string): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({
        status: 'rejected',
        adminNotes: notes,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    return updated;
  }

  async getBusinessReviews(businessId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.businessId, businessId))
      .orderBy(desc(reviews.createdAt));
  }

  async getAllReviewsForAdmin(): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.createdAt));
  }

  async deleteReview(reviewId: number): Promise<void> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId));
    
    await db.delete(reviews).where(eq(reviews.id, reviewId));
    
    // Update business rating after deletion
    if (review) {
      await this.updateBusinessRating(review.businessId);
    }
  }

  private async updateBusinessRating(businessId: string): Promise<void> {
    // Calculate average rating from approved reviews
    const approvedReviews = await db
      .select()
      .from(reviews)
      .where(and(
        eq(reviews.businessId, businessId),
        eq(reviews.status, 'approved')
      ));

    if (approvedReviews.length === 0) {
      // No approved reviews, set rating to null
      await db
        .update(businesses)
        .set({ 
          averageRating: null,
          reviewCount: 0
        })
        .where(eq(businesses.placeid, businessId));
    } else {
      // Calculate average rating
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / approvedReviews.length;

      await db
        .update(businesses)
        .set({ 
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          reviewCount: approvedReviews.length
        })
        .where(eq(businesses.placeid, businessId));
    }
  }
}