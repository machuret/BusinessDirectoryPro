import { storage } from "../storage";

/**
 * Lead Service Layer
 * Handles business logic for lead management including access control
 */

/**
 * Determines if a user can access a specific lead based on business ownership rules
 * @param userId - The ID of the user requesting access
 * @param leadId - The ID of the lead being accessed
 * @returns Promise<boolean> - true if user has access, false otherwise
 */
export async function canUserAccessLead(userId: string, leadId: number): Promise<boolean> {
  try {
    // Get the lead to check which business it belongs to
    const lead = await storage.getLead(leadId);
    if (!lead) {
      return false; // Lead doesn't exist
    }

    // Get user information to check role
    const user = await storage.getUser(userId);
    if (!user) {
      return false; // User doesn't exist
    }

    // Check business ownership status
    const { isClaimed, ownerId } = await storage.isBusinessClaimed(lead.businessId);

    // Apply business rules for access control
    if (user.role === 'admin' && !isClaimed) {
      // Admin can access leads from unclaimed businesses
      return true;
    } else if (isClaimed && ownerId === user.id) {
      // Business owner can access leads from their claimed businesses
      return true;
    }

    // No access by default
    return false;
  } catch (error) {
    console.error('Error checking lead access:', error);
    return false; // Deny access on error for security
  }
}

/**
 * Gets leads for a user based on their role and business ownership
 * @param userId - The ID of the user requesting leads
 * @returns Promise with appropriate leads based on user permissions
 */
export async function getLeadsForUser(userId: string) {
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      // Admin sees leads from unclaimed businesses
      return await storage.getAdminLeads();
    } else {
      // Business owners see leads from their claimed businesses
      return await storage.getOwnerLeads(user.id);
    }
  } catch (error) {
    console.error('Error fetching leads for user:', error);
    throw error;
  }
}

/**
 * Validates lead data for creation
 * @param leadData - The lead data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateLeadData(leadData: any): { isValid: boolean; error?: string } {
  const { businessId, senderName, senderEmail, message } = leadData;

  // Check required fields
  if (!businessId || !senderName || !senderEmail || !message) {
    return {
      isValid: false,
      error: 'Missing required fields: businessId, senderName, senderEmail, message'
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(senderEmail)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  return { isValid: true };
}

/**
 * Validates lead status values
 * @param status - The status to validate
 * @returns boolean indicating if status is valid
 */
export function isValidLeadStatus(status: string): boolean {
  const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'closed'];
  return validStatuses.includes(status);
}