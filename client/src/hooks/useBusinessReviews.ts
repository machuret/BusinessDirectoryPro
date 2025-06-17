import { useQuery } from "@tanstack/react-query";

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  customerName?: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  user?: {
    firstName?: string;
  };
}

/**
 * Custom hook for fetching business reviews
 * @param businessId - The business ID to fetch reviews for
 * @param enabled - Whether the query should be enabled
 */
export function useBusinessReviews(businessId: string | null, enabled: boolean = true) {
  return useQuery<Review[]>({
    queryKey: [`/api/reviews`, businessId],
    enabled: !!businessId && enabled,
    select: (data) => {
      // Ensure data is always an array
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}