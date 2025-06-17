/**
 * Authenticated Admin Wrapper
 * Ensures proper authentication state management for all admin components
 */

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AdminLogin } from "./AdminLogin";
import { queryClient } from "@/lib/queryClient";

interface AuthenticatedAdminWrapperProps {
  children: React.ReactNode;
}

export function AuthenticatedAdminWrapper({ children }: AuthenticatedAdminWrapperProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Force authentication check on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          // Invalidate and refetch all queries to ensure fresh data
          queryClient.invalidateQueries();
          console.log('Admin authentication verified:', userData);
        }
      } catch (error) {
        console.log('Admin authentication check failed:', error);
      }
    };

    checkAuth();
  }, []);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show login interface if not authenticated
  if (!isAuthenticated || !user) {
    return <AdminLogin />;
  }

  // Show admin content if authenticated
  return <>{children}</>;
}