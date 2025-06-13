import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

// Helper function to determine error type
const getErrorType = (error: any): 'network' | 'not_found' | 'server' | 'unknown' => {
  if (!error) return 'unknown';
  
  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.response?.status;
  
  if (status === 404 || message.includes('not found')) return 'not_found';
  if (status >= 500 || message.includes('server error')) return 'server';
  if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) return 'network';
  
  return 'unknown';
};

interface UseApiQueryOptions<TData> extends Omit<UseQueryOptions<TData>, 'retry' | 'retryDelay'> {
  // Override retry to use our smart retry logic
  showErrorToast?: boolean;
  customErrorMessage?: string;
  retryNetworkErrors?: boolean;
  maxRetries?: number;
}

interface UseApiQueryResult<TData> {
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isNotFound: boolean;
  errorType: 'network' | 'not_found' | 'server' | 'unknown' | null;
  refetch: () => void;
}

export function useApiQuery<TData = unknown>(
  options: UseApiQueryOptions<TData>
): UseApiQueryResult<TData> {
  const { toast } = useToast();
  const [hasShownError, setHasShownError] = useState(false);
  
  const {
    showErrorToast = true,
    customErrorMessage,
    retryNetworkErrors = true,
    maxRetries = 3,
    ...queryOptions
  } = options;

  const queryResult = useQuery<TData>({
    ...queryOptions,
    retry: (failureCount, error: any) => {
      const errorType = getErrorType(error);
      // Only retry network and server errors, not 404s or unknown errors
      return retryNetworkErrors && 
             (errorType === 'network' || errorType === 'server') && 
             failureCount < maxRetries;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data, isLoading, error, refetch } = queryResult;
  const errorType = error ? getErrorType(error) : null;
  const isNotFound = errorType === 'not_found';
  const isError = !!error && !isNotFound; // Don't treat 404s as errors

  // Handle error notifications
  useEffect(() => {
    if (error && showErrorToast && !hasShownError && !isNotFound) {
      setHasShownError(true);
      
      const errorMessage = customErrorMessage || (() => {
        switch (errorType) {
          case 'network':
            return "Unable to connect to the server. Please check your internet connection.";
          case 'server':
            return "The server is experiencing issues. Please try again in a moment.";
          default:
            return "An unexpected error occurred. Please try again.";
        }
      })();

      toast({
        title: "Error Loading Data",
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    // Reset error state when error clears
    if (!error) {
      setHasShownError(false);
    }
  }, [error, showErrorToast, customErrorMessage, errorType, isNotFound, hasShownError, toast]);

  return {
    data,
    isLoading,
    isError,
    error,
    isNotFound,
    errorType,
    refetch,
  };
}