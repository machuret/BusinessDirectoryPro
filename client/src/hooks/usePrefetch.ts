import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

interface PrefetchOptions {
  delay?: number;
  staleTime?: number;
  enabled?: boolean;
}

export function usePrefetch() {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const prefetch = useCallback(
    (queryKey: string[], queryFn: () => Promise<any>, options: PrefetchOptions = {}) => {
      const { delay = 300, staleTime = 5 * 60 * 1000, enabled = true } = options;

      if (!enabled) return;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime,
        });
      }, delay);
    },
    [queryClient]
  );

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  return { prefetch, cancelPrefetch };
}

// Specialized hook for business prefetching
export function useBusinessPrefetch() {
  const { prefetch, cancelPrefetch } = usePrefetch();

  const prefetchBusiness = useCallback(
    (businessId: string) => {
      prefetch(
        ['/api/businesses', businessId],
        () => fetch(`/api/businesses/${businessId}`).then(res => res.json()),
        { delay: 200 }
      );
    },
    [prefetch]
  );

  const prefetchBusinessReviews = useCallback(
    (businessId: string) => {
      prefetch(
        ['/api/businesses', businessId, 'reviews'],
        () => fetch(`/api/businesses/${businessId}/reviews`).then(res => res.json()),
        { delay: 400 }
      );
    },
    [prefetch]
  );

  return { prefetchBusiness, prefetchBusinessReviews, cancelPrefetch };
}

// Hook for category prefetching
export function useCategoryPrefetch() {
  const { prefetch, cancelPrefetch } = usePrefetch();

  const prefetchCategory = useCallback(
    (categorySlug: string) => {
      prefetch(
        ['/api/categories', categorySlug, 'businesses'],
        () => fetch(`/api/categories/${categorySlug}/businesses`).then(res => res.json()),
        { delay: 250 }
      );
    },
    [prefetch]
  );

  return { prefetchCategory, cancelPrefetch };
}

// Hook for search prefetching
export function useSearchPrefetch() {
  const { prefetch, cancelPrefetch } = usePrefetch();

  const prefetchSearch = useCallback(
    (query: string, filters?: any) => {
      const searchParams = new URLSearchParams({
        q: query,
        ...(filters || {})
      });

      prefetch(
        ['/api/search', query, filters],
        () => fetch(`/api/search?${searchParams}`).then(res => res.json()),
        { delay: 150 }
      );
    },
    [prefetch]
  );

  return { prefetchSearch, cancelPrefetch };
}