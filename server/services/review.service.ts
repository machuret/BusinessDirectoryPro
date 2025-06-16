import { storage } from "../storage";

/**
 * Review Service Layer
 * Handles business logic for review management including automatic rating recalculation
 */

/**
 * Validates review data for creation
 * @param reviewData - The review data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateReviewData(reviewData: any): { isValid: boolean; error?: string } {
  const { rating, title, content } = reviewData;

  // Check required fields
  if (rating === undefined || rating === null) {
    return {
      isValid: false,
      error: 'Rating is required'
    };
  }

  // Validate rating range
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return {
      isValid: false,
      error: 'Rating must be a number between 1 and 5'
    };
  }

  // Validate title length if provided
  if (title && (typeof title !== 'string' || title.length > 255)) {
    return {
      isValid: false,
      error: 'Review title must be a string with maximum 255 characters'
    };
  }

  // Validate content length if provided
  if (content && (typeof content !== 'string' || content.length > 2000)) {
    return {
      isValid: false,
      error: 'Review content must be a string with maximum 2000 characters'
    };
  }

  return { isValid: true };
}

/**
 * Validates public review data (includes additional required fields)
 * @param reviewData - The public review data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validatePublicReviewData(reviewData: any): { isValid: boolean; error?: string } {
  const { authorName, authorEmail } = reviewData;

  // First validate base review data
  const baseValidation = validateReviewData(reviewData);
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  // Check required fields for public reviews
  if (!authorName || typeof authorName !== 'string' || authorName.trim().length === 0) {
    return {
      isValid: false,
      error: 'Author name is required for public reviews'
    };
  }

  if (!authorEmail || typeof authorEmail !== 'string') {
    return {
      isValid: false,
      error: 'Author email is required for public reviews'
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(authorEmail)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  return { isValid: true };
}

/**
 * Creates a public review and updates business rating
 * @param businessId - The business ID to create review for
 * @param reviewData - The review data
 * @returns Promise with the created review
 */
export async function createPublicReview(businessId: string, reviewData: any) {
  try {
    // Validate review data
    const validation = validatePublicReviewData(reviewData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create the review
    const review = await storage.createPublicReview(businessId, reviewData);

    // Recalculate and update business rating
    if (businessId) {
      await updateBusinessRating(businessId);
    }

    return review;
  } catch (error) {
    console.error('Error in createPublicReview service:', error);
    throw error;
  }
}

/**
 * Creates an authenticated user review and updates business rating
 * @param reviewData - The review data including userId
 * @returns Promise with the created review
 */
export async function createUserReview(reviewData: any) {
  try {
    // Validate review data
    const validation = validateReviewData(reviewData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    if (!reviewData.businessId) {
      throw new Error('Business ID is required');
    }

    if (!reviewData.userId) {
      throw new Error('User ID is required');
    }

    // Create the review
    const review = await storage.createReview(reviewData);

    // Recalculate and update business rating
    if (reviewData.businessId) {
      await updateBusinessRating(reviewData.businessId);
    }

    return review;
  } catch (error) {
    console.error('Error in createUserReview service:', error);
    throw error;
  }
}

/**
 * Deletes a review and updates business rating
 * @param reviewId - The review ID to delete
 * @returns Promise that resolves when deletion and rating update are complete
 */
export async function deleteReview(reviewId: number) {
  try {
    // Get review details before deletion to know which business to update
    const existingReviews = await storage.getAllReviewsForAdmin();
    const reviewToDelete = existingReviews.find(r => r.id === reviewId);
    
    if (!reviewToDelete) {
      throw new Error('Review not found');
    }

    const businessId = reviewToDelete.businessId;

    // Delete the review
    await storage.deleteReview(reviewId);

    // Recalculate and update business rating
    if (businessId) {
      await updateBusinessRating(businessId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteReview service:', error);
    throw error;
  }
}

/**
 * Approves a review and updates business rating
 * @param reviewId - The review ID to approve
 * @param adminId - The admin ID performing the approval
 * @param notes - Optional admin notes
 * @returns Promise with the approved review
 */
export async function approveReview(reviewId: number, adminId: string, notes?: string) {
  try {
    // Approve the review
    const review = await storage.approveReview(reviewId, adminId, notes);

    // Recalculate and update business rating (approval affects visible ratings)
    if (review.businessId) {
      await updateBusinessRating(review.businessId);
    }

    return review;
  } catch (error) {
    console.error('Error in approveReview service:', error);
    throw error;
  }
}

/**
 * Rejects a review and updates business rating
 * @param reviewId - The review ID to reject
 * @param adminId - The admin ID performing the rejection
 * @param notes - Optional admin notes
 * @returns Promise with the rejected review
 */
export async function rejectReview(reviewId: number, adminId: string, notes?: string) {
  try {
    // Reject the review
    const review = await storage.rejectReview(reviewId, adminId, notes);

    // Recalculate and update business rating (rejection affects visible ratings)
    if (review.businessId) {
      await updateBusinessRating(review.businessId);
    }

    return review;
  } catch (error) {
    console.error('Error in rejectReview service:', error);
    throw error;
  }
}

/**
 * Recalculates and updates the average rating for a business
 * @param businessId - The business ID to update rating for
 */
async function updateBusinessRating(businessId: string) {
  try {
    // Use the existing storage method to update business rating
    await storage.updateBusinessRating(businessId);
  } catch (error) {
    console.error('Error updating business rating:', error);
    // Don't throw here - rating update failure shouldn't break review operations
  }
}

/**
 * Validates mass review action request
 * @param requestData - The request data containing reviewIds and action
 * @returns Object with validation result and error message if invalid
 */
export function validateMassReviewAction(requestData: any): { isValid: boolean; error?: string } {
  const { reviewIds, action } = requestData;

  if (!reviewIds) {
    return {
      isValid: false,
      error: 'reviewIds field is required'
    };
  }

  if (!Array.isArray(reviewIds)) {
    return {
      isValid: false,
      error: 'reviewIds must be an array'
    };
  }

  if (reviewIds.length === 0) {
    return {
      isValid: false,
      error: 'reviewIds array cannot be empty'
    };
  }

  if (reviewIds.length > 50) {
    return {
      isValid: false,
      error: 'Cannot process more than 50 reviews at once'
    };
  }

  if (!action || !['approve', 'reject', 'delete'].includes(action)) {
    return {
      isValid: false,
      error: 'action must be one of: approve, reject, delete'
    };
  }

  // Validate each review ID
  for (const id of reviewIds) {
    if (typeof id !== 'number' || id <= 0) {
      return {
        isValid: false,
        error: 'All review IDs must be positive numbers'
      };
    }
  }

  return { isValid: true };
}