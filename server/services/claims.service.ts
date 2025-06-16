import { storage } from "../storage";

/**
 * Claims Service Layer
 * Handles business logic for ownership claim management including transactional operations
 */

/**
 * Validates claim approval data
 * @param claimId - The claim ID to validate
 * @param adminId - The admin ID performing the approval
 * @returns Object with validation result and error message if invalid
 */
export function validateClaimApproval(claimId: number, adminId: string): { isValid: boolean; error?: string } {
  if (!claimId || typeof claimId !== 'number' || claimId <= 0) {
    return {
      isValid: false,
      error: 'Valid claim ID is required'
    };
  }

  if (!adminId || typeof adminId !== 'string' || adminId.trim().length === 0) {
    return {
      isValid: false,
      error: 'Admin ID is required for claim approval'
    };
  }

  return { isValid: true };
}

/**
 * Validates claim status update data
 * @param status - The status to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateClaimStatus(status: string): { isValid: boolean; error?: string } {
  const validStatuses = ['pending', 'approved', 'rejected'];
  
  if (!status || typeof status !== 'string') {
    return {
      isValid: false,
      error: 'Status is required'
    };
  }

  if (!validStatuses.includes(status)) {
    return {
      isValid: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Approves an ownership claim and transfers business ownership
 * This function performs a complete transaction: updates claim status and business ownership
 * @param claimId - The claim ID to approve
 * @param adminId - The admin ID performing the approval
 * @param adminMessage - Optional admin message/notes
 * @returns Promise with the updated claim and business ownership details
 */
export async function approveClaim(claimId: number, adminId: string, adminMessage?: string) {
  try {
    // Validate input
    const validation = validateClaimApproval(claimId, adminId);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // First, get the claim details to extract businessId and userId
    const claims = await storage.getOwnershipClaims();
    const claim = claims.find(c => c.id === claimId);
    
    if (!claim) {
      throw new Error('Ownership claim not found');
    }

    if (claim.status === 'approved') {
      throw new Error('Claim is already approved');
    }

    if (!claim.businessId) {
      throw new Error('Claim does not have a valid business ID');
    }

    if (!claim.userId) {
      throw new Error('Claim does not have a valid user ID');
    }

    // Check if business exists
    const business = await storage.getBusinessById(claim.businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    // Perform the transaction: update claim status and business ownership
    console.log(`[CLAIMS SERVICE] Approving claim ${claimId}: transferring business ${claim.businessId} to user ${claim.userId}`);

    // Step 1: Update the claim status to 'approved'
    const updatedClaim = await storage.updateOwnershipClaim(
      claimId, 
      'approved', 
      adminMessage || 'Claim approved - ownership transferred', 
      adminId
    );

    if (!updatedClaim) {
      throw new Error('Failed to update claim status');
    }

    // Step 2: Update business ownership (transfer ownership to claiming user)
    const businessUpdate = await storage.updateBusiness(claim.businessId, {
      ownerid: claim.userId
    });

    if (!businessUpdate) {
      // If business update fails, we should ideally rollback the claim status
      // For now, we'll throw an error to indicate the partial failure
      throw new Error('Failed to transfer business ownership - claim approved but ownership not transferred');
    }

    console.log(`[CLAIMS SERVICE] Successfully approved claim ${claimId} and transferred ownership of business ${claim.businessId} to user ${claim.userId}`);

    return {
      claim: updatedClaim,
      business: businessUpdate,
      message: 'Claim approved and business ownership transferred successfully'
    };

  } catch (error) {
    console.error('Error in approveClaim service:', error);
    throw error;
  }
}

/**
 * Rejects an ownership claim
 * @param claimId - The claim ID to reject
 * @param adminId - The admin ID performing the rejection
 * @param adminMessage - Required admin message explaining rejection
 * @returns Promise with the updated claim
 */
export async function rejectClaim(claimId: number, adminId: string, adminMessage: string) {
  try {
    // Validate input
    const validation = validateClaimApproval(claimId, adminId);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    if (!adminMessage || adminMessage.trim().length < 10) {
      throw new Error('Admin message is required for claim rejection and must be at least 10 characters');
    }

    // Get the claim to verify it exists
    const claims = await storage.getOwnershipClaims();
    const claim = claims.find(c => c.id === claimId);
    
    if (!claim) {
      throw new Error('Ownership claim not found');
    }

    if (claim.status === 'rejected') {
      throw new Error('Claim is already rejected');
    }

    // Update the claim status to 'rejected'
    const updatedClaim = await storage.updateOwnershipClaim(
      claimId, 
      'rejected', 
      adminMessage.trim(), 
      adminId
    );

    if (!updatedClaim) {
      throw new Error('Failed to update claim status');
    }

    console.log(`[CLAIMS SERVICE] Successfully rejected claim ${claimId} by admin ${adminId}`);

    return updatedClaim;

  } catch (error) {
    console.error('Error in rejectClaim service:', error);
    throw error;
  }
}

/**
 * Updates an ownership claim status with proper validation
 * @param claimId - The claim ID to update
 * @param status - The new status ('pending', 'approved', 'rejected')
 * @param adminId - The admin ID performing the update
 * @param adminMessage - Optional admin message
 * @returns Promise with the updated claim
 */
export async function updateClaimStatus(claimId: number, status: string, adminId: string, adminMessage?: string) {
  try {
    // Validate input
    const claimValidation = validateClaimApproval(claimId, adminId);
    if (!claimValidation.isValid) {
      throw new Error(claimValidation.error);
    }

    const statusValidation = validateClaimStatus(status);
    if (!statusValidation.isValid) {
      throw new Error(statusValidation.error);
    }

    // Handle approval and rejection through specialized functions
    if (status === 'approved') {
      return await approveClaim(claimId, adminId, adminMessage);
    }

    if (status === 'rejected') {
      if (!adminMessage || adminMessage.trim().length < 10) {
        throw new Error('Admin message is required for rejection and must be at least 10 characters');
      }
      return await rejectClaim(claimId, adminId, adminMessage);
    }

    // Handle pending status (simple update)
    const updatedClaim = await storage.updateOwnershipClaim(
      claimId, 
      status, 
      adminMessage || 'Status updated to pending', 
      adminId
    );

    if (!updatedClaim) {
      throw new Error('Failed to update claim status');
    }

    return updatedClaim;

  } catch (error) {
    console.error('Error in updateClaimStatus service:', error);
    throw error;
  }
}

/**
 * Validates ownership claim creation data
 * @param claimData - The claim data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateClaimCreation(claimData: any): { isValid: boolean; error?: string } {
  const { userId, businessId, message } = claimData;

  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return {
      isValid: false,
      error: 'User ID is required'
    };
  }

  if (!businessId || typeof businessId !== 'string' || businessId.trim().length === 0) {
    return {
      isValid: false,
      error: 'Business ID is required'
    };
  }

  if (!message || typeof message !== 'string' || message.trim().length < 50) {
    return {
      isValid: false,
      error: 'Message is required and must be at least 50 characters long'
    };
  }

  return { isValid: true };
}

/**
 * Creates a new ownership claim with validation
 * @param claimData - The claim data including userId, businessId, and message
 * @returns Promise with the created claim
 */
export async function createClaim(claimData: any) {
  try {
    // Validate claim data
    const validation = validateClaimCreation(claimData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const { userId, businessId, message } = claimData;

    // Check if business exists
    const business = await storage.getBusinessById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    // Check if user already has a pending or approved claim for this business
    const existingClaims = await storage.getOwnershipClaimsByUser(userId);
    const existingClaim = existingClaims.find(
      claim => claim.businessId === businessId && ['pending', 'approved'].includes(claim.status)
    );

    if (existingClaim) {
      throw new Error(`You already have a ${existingClaim.status} claim for this business`);
    }

    // Create the claim
    const newClaimData = {
      userId: userId.trim(),
      businessId: businessId.trim(),
      message: message.trim(),
      status: 'pending'
    };

    const createdClaim = await storage.createOwnershipClaim(newClaimData);

    console.log(`[CLAIMS SERVICE] Successfully created ownership claim for business ${businessId} by user ${userId}`);

    return createdClaim;

  } catch (error) {
    console.error('Error in createClaim service:', error);
    throw error;
  }
}