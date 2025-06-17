import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BusinessWithCategory, InsertBusiness } from "@shared/schema";

/**
 * useBusinesses - Hook for fetching and filtering business listings with pagination
 * 
 * Provides comprehensive business data fetching with support for category filtering,
 * search queries, city-based filtering, featured status, and pagination. Automatically
 * constructs query parameters and manages caching for optimal performance. Supports
 * real-time filtering and search functionality for business directory listings.
 * 
 * @param params - Optional filtering and pagination parameters
 * @param params.categoryId - Filter businesses by specific category ID
 * @param params.search - Search term to filter business names and descriptions
 * @param params.city - Filter businesses by city location
 * @param params.featured - Show only featured businesses when true
 * @param params.limit - Maximum number of businesses to return per page
 * @param params.offset - Number of businesses to skip for pagination
 * 
 * @returns Query result containing business data, loading state, and error information
 * 
 * @example
 * // Basic business listing
 * const { data: businesses, isLoading } = useBusinesses();
 * 
 * @example
 * // Filtered by category and city
 * const { data: restaurants } = useBusinesses({
 *   categoryId: 5,
 *   city: 'Sydney',
 *   limit: 20
 * });
 * 
 * @example
 * // Search with pagination
 * const { data: searchResults } = useBusinesses({
 *   search: 'coffee',
 *   limit: 10,
 *   offset: currentPage * 10
 * });
 */
export function useBusinesses(params?: {
  categoryId?: number;
  search?: string;
  city?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId.toString());
  if (params?.search) searchParams.set("search", params.search);
  if (params?.city) searchParams.set("city", params.city);
  if (params?.featured) searchParams.set("featured", "true");
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.offset) searchParams.set("offset", params.offset.toString());
  
  const queryKey = searchParams.toString() 
    ? ["/api/businesses", params] 
    : ["/api/businesses"];
    
  return useQuery<BusinessWithCategory[]>({
    queryKey,
  });
}

/**
 * useBusiness - Hook for fetching individual business details by identifier
 * 
 * Retrieves comprehensive business information including category, images, reviews,
 * and contact details for a specific business. Uses place ID or slug as identifier
 * and includes automatic caching for performance optimization.
 * 
 * @param identifier - Business place ID or slug identifier
 * 
 * @returns Query result with detailed business data
 * 
 * @example
 * const { data: business, isLoading } = useBusiness('ChIJ123...');
 */
export function useBusiness(identifier: string) {
  return useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/${identifier}`],
    enabled: !!identifier,
  });
}

/**
 * useFeaturedBusinesses - Hook for fetching featured business listings
 * 
 * Retrieves businesses marked as featured with optional limit parameter.
 * Used for homepage carousels, featured sections, and promotional displays.
 * 
 * @param limit - Maximum number of featured businesses to return (default: 6)
 * 
 * @returns Query result with featured business array
 * 
 * @example
 * const { data: featured } = useFeaturedBusinesses(10);
 */
export function useFeaturedBusinesses(limit = 6) {
  return useQuery<BusinessWithCategory[]>({
    queryKey: [`/api/businesses/featured?limit=${limit}`],
  });
}

/**
 * useUserBusinesses - Hook for fetching businesses owned by a specific user
 * 
 * Retrieves all businesses associated with a user account for dashboard
 * management, ownership claims, and business editing functionality.
 * 
 * @param userId - User identifier to fetch associated businesses
 * 
 * @returns Query result with user's business listings
 * 
 * @example
 * const { data: userBusinesses } = useUserBusinesses(user.id);
 */
export function useUserBusinesses(userId?: string) {
  return useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/user/businesses"],
    enabled: !!userId,
  });
}

export function useBusinessMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createBusiness = useMutation({
    mutationFn: async (businessData: InsertBusiness) => {
      const response = await apiRequest("POST", "/api/businesses", businessData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/businesses"] });
      toast({
        title: "Business created",
        description: "Business has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating business",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBusiness = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBusiness> }) => {
      const response = await apiRequest("PATCH", `/api/businesses/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/businesses"] });
      toast({
        title: "Business updated",
        description: "Business has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating business",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBusiness = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/businesses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/businesses"] });
      toast({
        title: "Business deleted",
        description: "Business has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting business",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createBusiness,
    updateBusiness,
    deleteBusiness,
  };
}