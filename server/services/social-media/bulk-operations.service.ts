/**
 * Social Media Bulk Operations Service
 * Handles bulk updates and actions for social media links
 */

import { storage } from '../../storage';
import type { InsertSocialMediaLink } from '@shared/schema';

/**
 * Performs bulk updates on multiple social media links
 * @param updates - Array of update objects with id and data
 * @returns Promise with summary of updates performed
 */
export async function performBulkSocialMediaLinkUpdates(
  updates: Array<{ id: number; data: Partial<InsertSocialMediaLink> }>
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('[SOCIAL MEDIA BULK OPERATIONS] Performing bulk social media link updates:', { updateCount: updates.length });

  if (!updates || updates.length === 0) {
    throw new Error('Updates array is required');
  }

  const result = { success: 0, failed: 0, errors: [] as string[] };

  for (const update of updates) {
    try {
      await storage.updateSocialMediaLink(update.id, update.data);
      result.success++;
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Link ${update.id}: ${errorMessage}`);
    }
  }

  console.log('[SOCIAL MEDIA BULK OPERATIONS] Bulk updates completed:', result);
  return result;
}

/**
 * Performs bulk operations on multiple social media links
 * @param linkIds - Array of social media link IDs to operate on
 * @param action - The action to perform ('activate', 'deactivate', 'delete')
 * @returns Promise with summary of actions performed
 */
export async function performBulkSocialMediaLinkAction(
  linkIds: number[], 
  action: 'activate' | 'deactivate' | 'delete'
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('[SOCIAL MEDIA BULK OPERATIONS] Performing bulk social media link action:', { action, linkCount: linkIds.length });

  if (!linkIds || linkIds.length === 0) {
    throw new Error('Link IDs array is required');
  }

  if (!['activate', 'deactivate', 'delete'].includes(action)) {
    throw new Error('Invalid action. Must be activate, deactivate, or delete');
  }

  const result = { success: 0, failed: 0, errors: [] as string[] };

  for (const linkId of linkIds) {
    try {
      switch (action) {
        case 'activate':
          await storage.updateSocialMediaLink(linkId, { isActive: true });
          break;
        case 'deactivate':
          await storage.updateSocialMediaLink(linkId, { isActive: false });
          break;
        case 'delete':
          await storage.deleteSocialMediaLink(linkId);
          break;
      }
      result.success++;
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Link ${linkId}: ${errorMessage}`);
    }
  }

  console.log('[SOCIAL MEDIA BULK OPERATIONS] Bulk action completed:', { action, ...result });
  return result;
}

/**
 * Performs bulk toggle operations on multiple social media links
 * @param linkIds - Array of social media link IDs to toggle
 * @param isActive - The active status to set for all links
 * @returns Promise with summary of toggle operations performed
 */
export async function performBulkSocialMediaLinkToggle(
  linkIds: number[],
  isActive: boolean
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('[SOCIAL MEDIA BULK OPERATIONS] Performing bulk social media link toggle:', { 
    isActive, 
    linkCount: linkIds.length 
  });

  if (!linkIds || linkIds.length === 0) {
    throw new Error('Link IDs array is required');
  }

  const result = { success: 0, failed: 0, errors: [] as string[] };

  for (const linkId of linkIds) {
    try {
      await storage.updateSocialMediaLink(linkId, { isActive });
      result.success++;
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Link ${linkId}: ${errorMessage}`);
    }
  }

  console.log('[SOCIAL MEDIA BULK OPERATIONS] Bulk toggle completed:', { 
    isActive, 
    ...result 
  });
  return result;
}

/**
 * Validates bulk operation input data
 * @param data - The bulk operation data to validate
 * @param operation - The type of operation ('updates', 'action', 'toggle')
 * @returns Boolean indicating if data is valid
 */
export function validateBulkOperationData(
  data: unknown,
  operation: 'updates' | 'action' | 'toggle'
): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  switch (operation) {
    case 'updates':
      const updatesData = data as { updates?: unknown };
      return Array.isArray(updatesData.updates) && updatesData.updates.length > 0;
      
    case 'action':
      const actionData = data as { linkIds?: unknown; action?: unknown };
      return Array.isArray(actionData.linkIds) && 
             actionData.linkIds.length > 0 &&
             typeof actionData.action === 'string' &&
             ['activate', 'deactivate', 'delete'].includes(actionData.action);
             
    case 'toggle':
      const toggleData = data as { linkIds?: unknown; isActive?: unknown };
      return Array.isArray(toggleData.linkIds) && 
             toggleData.linkIds.length > 0 &&
             typeof toggleData.isActive === 'boolean';
             
    default:
      return false;
  }
}

/**
 * Formats bulk operation results for API responses
 * @param result - The bulk operation result
 * @param operation - The type of operation performed
 * @returns Formatted response object
 */
export function formatBulkOperationResponse(
  result: { success: number; failed: number; errors: string[] },
  operation: string
): {
  message: string;
  success: number;
  failed: number;
  errors?: string[];
  status: 'complete' | 'partial' | 'failed';
} {
  const { success, failed, errors } = result;
  const total = success + failed;
  
  let status: 'complete' | 'partial' | 'failed';
  let message: string;
  
  if (failed === 0) {
    status = 'complete';
    message = `Successfully ${operation}d ${success} social media links`;
  } else if (success === 0) {
    status = 'failed';
    message = `Failed to ${operation} any social media links`;
  } else {
    status = 'partial';
    message = `${operation} completed with ${success}/${total} successful operations`;
  }
  
  const response = {
    message,
    success,
    failed,
    status
  };
  
  if (failed > 0) {
    return { ...response, errors };
  }
  
  return response;
}