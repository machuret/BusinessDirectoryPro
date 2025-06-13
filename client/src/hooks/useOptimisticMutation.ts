import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useState, useCallback } from 'react';

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onOptimisticUpdate?: (variables: TVariables) => TData;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  queryKey: string[];
  updateFn?: (oldData: any, newData: TData) => any;
  rollbackFn?: (oldData: any, variables: TVariables) => any;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  onOptimisticUpdate,
  onSuccess,
  onError,
  queryKey,
  updateFn,
  rollbackFn,
  successMessage,
  errorMessage
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [optimisticData, setOptimisticData] = useState<TData | null>(null);

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      if (onOptimisticUpdate && updateFn) {
        const optimisticResult = onOptimisticUpdate(variables);
        setOptimisticData(optimisticResult);
        
        queryClient.setQueryData(queryKey, (old: any) => 
          updateFn(old, optimisticResult)
        );
      }

      return { previousData };
    },
    onError: (error: Error, variables: TVariables, context: any) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      setOptimisticData(null);
      
      toast({
        title: "Action Failed",
        description: errorMessage || error.message,
        variant: "destructive",
      });

      onError?.(error, variables);
    },
    onSuccess: (data: TData, variables: TVariables) => {
      setOptimisticData(null);
      
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }

      onSuccess?.(data, variables);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const mutateOptimistic = useCallback((variables: TVariables) => {
    mutation.mutate(variables);
  }, [mutation]);

  return {
    ...mutation,
    mutateOptimistic,
    optimisticData,
    isOptimistic: optimisticData !== null,
  };
}

// Specialized hook for review submissions
export function useOptimisticReview() {
  return useOptimisticMutation({
    mutationFn: async (reviewData: any) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      return response.json();
    },
    onOptimisticUpdate: (variables) => ({
      id: `temp-${Date.now()}`,
      ...variables,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }),
    queryKey: ['reviews'],
    updateFn: (oldData: any[], newReview: any) => 
      oldData ? [newReview, ...oldData] : [newReview],
    successMessage: "Review submitted successfully!",
    errorMessage: "Failed to submit review. Please try again.",
  });
}

// Specialized hook for favorite actions
export function useOptimisticFavorite() {
  return useOptimisticMutation({
    mutationFn: async ({ businessId, action }: { businessId: string; action: 'add' | 'remove' }) => {
      const response = await fetch(`/api/businesses/${businessId}/favorite`, {
        method: action === 'add' ? 'POST' : 'DELETE',
      });
      return response.json();
    },
    onOptimisticUpdate: ({ businessId, action }) => ({
      businessId,
      isFavorited: action === 'add',
    }),
    queryKey: ['favorites'],
    updateFn: (oldData: any[], newFavorite: any) => {
      if (!oldData) return [newFavorite];
      
      if (newFavorite.isFavorited) {
        return [...oldData, newFavorite];
      } else {
        return oldData.filter(fav => fav.businessId !== newFavorite.businessId);
      }
    },
    successMessage: undefined, // Silent success for better UX
  });
}

// Specialized hook for rating submissions
export function useOptimisticRating() {
  return useOptimisticMutation({
    mutationFn: async (ratingData: any) => {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData),
      });
      return response.json();
    },
    onOptimisticUpdate: (variables) => ({
      id: `temp-${Date.now()}`,
      ...variables,
      createdAt: new Date().toISOString(),
    }),
    queryKey: ['ratings'],
    updateFn: (oldData: any[], newRating: any) => 
      oldData ? [newRating, ...oldData] : [newRating],
    successMessage: "Rating submitted!",
  });
}