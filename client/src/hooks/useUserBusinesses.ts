import { useToast } from "@/hooks/use-toast";
import type { BusinessWithCategory } from "@shared/schema";

/**
 * useUserBusinesses - Manages user business data and loading states
 * 
 * Provides centralized business data management for dashboard components,
 * handling loading states, error conditions, and user feedback for business
 * operations. Focuses on data presentation and state management.
 * 
 * @param businesses - Array of user's businesses with category information
 * @param isLoading - Loading state for business data fetch operations
 * 
 * @returns Object containing business data, loading states, and helper functions
 */
export function useUserBusinesses(businesses: BusinessWithCategory[], isLoading: boolean) {
  const { toast } = useToast();

  const hasBusinesses = businesses && businesses.length > 0;
  
  const getBusinessStatus = (business: BusinessWithCategory) => {
    return business.featured ? "featured" : "standard";
  };

  const getBusinessRating = (business: BusinessWithCategory) => {
    return (business as any).averagerating || null;
  };

  const showBusinessNotification = (type: 'success' | 'error', message: string) => {
    toast({
      title: type === 'success' ? "Success" : "Error",
      description: message,
      variant: type === 'error' ? "destructive" : "default",
    });
  };

  const logBusinessData = (message: string, data?: any) => {
    console.log(`[BusinessesSection] ${message}`, data);
  };

  return {
    // Business data
    businesses,
    hasBusinesses,
    isLoading,
    
    // Helper functions
    getBusinessStatus,
    getBusinessRating,
    showBusinessNotification,
    logBusinessData,
    
    // Computed values
    businessCount: businesses?.length || 0,
  };
}