import { storage } from "../storage";

/**
 * Business Service Layer
 * Handles business logic for business management operations
 */

/**
 * Result type for bulk operations
 */
export interface BulkDeleteResult {
  deletedCount: number;
  errors: Array<{ businessId: string; error: string }>;
  totalRequested: number;
}

/**
 * Performs bulk deletion of businesses with comprehensive error handling
 * @param businessIds - Array of business IDs to delete
 * @returns Promise with deletion results including success count and errors
 */
export async function bulkDeleteBusinesses(businessIds: string[]): Promise<BulkDeleteResult> {
  let deletedCount = 0;
  const errors: Array<{ businessId: string; error: string }> = [];

  // Process each business deletion individually to collect partial results
  for (const businessId of businessIds) {
    try {
      await storage.deleteBusiness(businessId);
      deletedCount++;
    } catch (error) {
      errors.push({ 
        businessId, 
        error: (error as Error).message 
      });
    }
  }

  return {
    deletedCount,
    errors,
    totalRequested: businessIds.length
  };
}

/**
 * Validates business data for creation or updates
 * @param businessData - The business data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateBusinessData(businessData: any): { isValid: boolean; error?: string } {
  const { title, placeid } = businessData;

  // Check required fields
  if (!title || !placeid) {
    return {
      isValid: false,
      error: 'Missing required fields: title and placeid are required'
    };
  }

  // Validate title length
  if (title.length < 2 || title.length > 255) {
    return {
      isValid: false,
      error: 'Business title must be between 2 and 255 characters'
    };
  }

  // Validate placeid format (basic check)
  if (typeof placeid !== 'string' || placeid.length < 10) {
    return {
      isValid: false,
      error: 'Invalid placeid format'
    };
  }

  return { isValid: true };
}

/**
 * Validates bulk operation request data
 * @param requestData - The request data containing businessIds array
 * @returns Object with validation result and error message if invalid
 */
export function validateBulkDeleteRequest(requestData: any): { isValid: boolean; error?: string } {
  const { businessIds } = requestData;

  if (!businessIds) {
    return {
      isValid: false,
      error: 'businessIds field is required'
    };
  }

  if (!Array.isArray(businessIds)) {
    return {
      isValid: false,
      error: 'businessIds must be an array'
    };
  }

  if (businessIds.length === 0) {
    return {
      isValid: false,
      error: 'businessIds array cannot be empty'
    };
  }

  if (businessIds.length > 100) {
    return {
      isValid: false,
      error: 'Cannot delete more than 100 businesses at once'
    };
  }

  // Validate each business ID
  for (const id of businessIds) {
    if (typeof id !== 'string' || id.trim().length === 0) {
      return {
        isValid: false,
        error: 'All business IDs must be non-empty strings'
      };
    }
  }

  return { isValid: true };
}

/**
 * Generates a comprehensive summary message for bulk operations
 * @param result - The bulk delete result
 * @returns User-friendly summary message
 */
export function generateBulkDeleteSummary(result: BulkDeleteResult): string {
  const { deletedCount, totalRequested, errors } = result;
  
  if (deletedCount === totalRequested) {
    return `Successfully deleted all ${deletedCount} business(es)`;
  } else if (deletedCount === 0) {
    return `Failed to delete any businesses. ${errors.length} error(s) occurred`;
  } else {
    return `Partially successful: ${deletedCount} of ${totalRequested} business(es) deleted. ${errors.length} error(s) occurred`;
  }
}