/**
 * Admin Authentication Utilities
 * Centralized authentication management for admin interfaces
 */

import { queryClient } from "@/lib/queryClient";

export interface AuthState {
  isAuthenticated: boolean;
  user: any;
  error: string | null;
}

/**
 * Perform admin login with proper session handling
 */
export async function adminLogin(email: string, password: string): Promise<AuthState> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        isAuthenticated: false,
        user: null,
        error: errorData.message || 'Login failed',
      };
    }

    const userData = await response.json();
    
    // Invalidate all queries to ensure fresh data after login
    queryClient.invalidateQueries();
    
    return {
      isAuthenticated: true,
      user: userData,
      error: null,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
      error: 'Network error during login',
    };
  }
}

/**
 * Check current authentication status
 */
export async function checkAuthStatus(): Promise<AuthState> {
  try {
    const response = await fetch('/api/auth/user', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      return {
        isAuthenticated: false,
        user: null,
        error: null,
      };
    }

    if (!response.ok) {
      return {
        isAuthenticated: false,
        user: null,
        error: 'Authentication check failed',
      };
    }

    const userData = await response.json();
    return {
      isAuthenticated: true,
      user: userData,
      error: null,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
      error: 'Network error during authentication check',
    };
  }
}

/**
 * Create authenticated fetch wrapper for admin API calls
 */
export function createAuthenticatedFetch() {
  return async (url: string, options: RequestInit = {}) => {
    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, defaultOptions);
    
    // If unauthorized, redirect to login
    if (response.status === 401) {
      // Clear any cached authentication data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      throw new Error('Authentication required');
    }

    return response;
  };
}

/**
 * Admin logout with cleanup
 */
export async function adminLogout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.warn('Logout request failed:', error);
  } finally {
    // Clear all cached data regardless of logout response
    queryClient.clear();
    window.location.reload();
  }
}