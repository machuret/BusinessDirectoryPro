import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Helper function to determine auth error type
const getAuthErrorType = (error: any): 'network' | 'unauthorized' | 'server' | 'unknown' => {
  if (!error) return 'unknown';
  
  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.response?.status;
  
  if (status === 401 || message.includes('unauthorized')) return 'unauthorized';
  if (status >= 500 || message.includes('server error')) return 'server';
  if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) return 'network';
  
  return 'unknown';
};

export function useAuth() {
  const { toast } = useToast();
  const [hasShownNetworkError, setHasShownNetworkError] = useState(false);
  const [lastErrorType, setLastErrorType] = useState<string | null>(null);

  const { 
    data: user, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: (failureCount, error: any) => {
      const errorType = getAuthErrorType(error);
      // Retry network errors up to 3 times, but not auth errors
      return errorType === 'network' && failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle authentication errors with user feedback
  useEffect(() => {
    if (error) {
      const errorType = getAuthErrorType(error);
      
      // Avoid showing duplicate error messages
      if (lastErrorType === errorType) return;
      setLastErrorType(errorType);

      switch (errorType) {
        case 'network':
          if (!hasShownNetworkError) {
            setHasShownNetworkError(true);
            toast({
              title: "Connection Issue",
              description: "Unable to verify authentication status. Please check your connection.",
              variant: "destructive",
              action: {
                altText: "Retry",
                onClick: () => {
                  setHasShownNetworkError(false);
                  refetch();
                }
              }
            });
          }
          break;
        
        case 'server':
          toast({
            title: "Server Error",
            description: "Authentication service is temporarily unavailable. Please try again.",
            variant: "destructive",
          });
          break;
        
        case 'unknown':
          // Only show for significant unknown errors
          if (!error.message?.includes('401')) {
            toast({
              title: "Authentication Error",
              description: "Unable to verify login status. Please refresh the page.",
              variant: "destructive",
            });
          }
          break;
        
        // Don't show toast for 'unauthorized' - this is expected behavior
      }
    } else {
      // Reset error tracking when error clears
      setLastErrorType(null);
      setHasShownNetworkError(false);
    }
  }, [error, toast, refetch, hasShownNetworkError, lastErrorType]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    authErrorType: error ? getAuthErrorType(error) : null,
    retryAuth: refetch,
  };
}
