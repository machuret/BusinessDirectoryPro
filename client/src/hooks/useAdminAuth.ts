/**
 * Admin Authentication Hook
 * Handles admin-specific authentication with proper session management
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminLogin, checkAuthStatus } from '@/utils/adminAuth';

export function useAdminAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Query to check authentication status
  const { 
    data: authData, 
    isLoading: isCheckingAuth, 
    error,
    refetch: recheckAuth 
  } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const result = await checkAuthStatus();
      return result.isAuthenticated ? result.user : null;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Initialize auth check on mount
  useEffect(() => {
    if (!isInitialized) {
      recheckAuth();
      setIsInitialized(true);
    }
  }, [isInitialized, recheckAuth]);

  const login = async (email: string, password: string) => {
    const result = await adminLogin(email, password);
    
    if (result.isAuthenticated) {
      // Invalidate and refetch auth data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      await recheckAuth();
    }
    
    return result;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      queryClient.clear();
      window.location.reload();
    }
  };

  return {
    user: authData,
    isAuthenticated: !!authData,
    isLoading: isCheckingAuth && !isInitialized,
    error,
    login,
    logout,
    refetch: recheckAuth,
  };
}