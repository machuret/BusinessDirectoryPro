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

/**
 * useAuth - Authentication hook with robust error handling and user feedback
 * 
 * Manages user authentication state with automatic retry logic for network failures,
 * proper error categorization, and user-friendly toast notifications. Handles
 * authentication token validation, session management, and provides loading states
 * for UI components. Includes intelligent retry strategy that distinguishes between
 * network issues and authentication failures.
 * 
 * @returns Object containing authentication state and helper functions
 * @returns returns.user - Current authenticated user object or null if not authenticated
 * @returns returns.isAuthenticated - Boolean indicating if user is currently authenticated
 * @returns returns.isLoading - Loading state during authentication checks and retries
 * @returns returns.error - Authentication error object with detailed error information
 * @returns returns.refetch - Function to manually trigger authentication state refresh
 * 
 * @example
 * // Basic authentication check
 * const { user, isAuthenticated, isLoading } = useAuth();
 * 
 * if (isLoading) return <LoadingSpinner />;
 * if (!isAuthenticated) return <LoginPrompt />;
 * return <AuthenticatedContent user={user} />;
 * 
 * @example
 * // Manual refresh after login
 * const { refetch } = useAuth();
 * 
 * const handleLogin = async () => {
 *   await loginUser(credentials);
 *   refetch(); // Refresh auth state
 * };
 */
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
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: true, // Always enabled but returns null on 401
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
