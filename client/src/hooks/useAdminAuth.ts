/**
 * Admin Authentication Hook
 * Handles admin-specific authentication with proper session management
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { deploymentAuth } from '@/utils/deploymentAuth';

export function useAdminAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Query to check authentication status using deployment auth
  const { 
    data: authData, 
    isLoading: isCheckingAuth, 
    error,
    refetch: recheckAuth 
  } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const result = await deploymentAuth.checkAuth();
      return result.isAuthenticated ? result.user : null;
    },
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for more responsive updates)
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
    const result = await deploymentAuth.login(email, password);
    
    if (result.success) {
      // Invalidate and refetch auth data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      await recheckAuth();
      
      return {
        isAuthenticated: true,
        user: result.user,
        error: null,
      };
    }
    
    return {
      isAuthenticated: false,
      user: null,
      error: result.error || 'Login failed',
    };
  };

  const logout = async () => {
    await deploymentAuth.logout();
    queryClient.clear();
    window.location.reload();
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