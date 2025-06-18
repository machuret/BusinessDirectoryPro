/**
 * Deployment-Specific Authentication Handler
 * Handles session persistence issues in production environment
 */

import { queryClient } from "@/lib/queryClient";

interface SessionData {
  user: any;
  timestamp: number;
  sessionId?: string;
}

const SESSION_STORAGE_KEY = 'admin_session_data';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Enhanced authentication for deployment environment
 */
export class DeploymentAuth {
  private static instance: DeploymentAuth;
  private sessionData: SessionData | null = null;

  static getInstance(): DeploymentAuth {
    if (!DeploymentAuth.instance) {
      DeploymentAuth.instance = new DeploymentAuth();
    }
    return DeploymentAuth.instance;
  }

  /**
   * Perform login with session backup
   */
  async login(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        return { success: false, error: errorData.message };
      }

      const userData = await response.json();
      
      // Store session data with timestamp
      this.sessionData = {
        user: userData,
        timestamp: Date.now(),
        sessionId: this.generateSessionId(),
      };

      // Backup to localStorage
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.sessionData));
      
      // Clear and refetch all admin data
      queryClient.clear();
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: 'Network error during login' };
    }
  }

  /**
   * Check authentication with fallback to localStorage
   */
  async checkAuth(): Promise<{ isAuthenticated: boolean; user?: any }> {
    try {
      // First try server authentication
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Update session data
        this.sessionData = {
          user: userData,
          timestamp: Date.now(),
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.sessionData));
        
        return { isAuthenticated: true, user: userData };
      }

      // If server auth fails, try localStorage backup
      return this.checkLocalSession();
    } catch (error) {
      // Network error - use localStorage backup
      return this.checkLocalSession();
    }
  }

  /**
   * Check localStorage for valid session
   */
  private checkLocalSession(): { isAuthenticated: boolean; user?: any } {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return { isAuthenticated: false };

      const sessionData: SessionData = JSON.parse(stored);
      
      // Check if session is still valid (not expired)
      if (Date.now() - sessionData.timestamp > SESSION_TIMEOUT) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return { isAuthenticated: false };
      }

      this.sessionData = sessionData;
      return { isAuthenticated: true, user: sessionData.user };
    } catch (error) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return { isAuthenticated: false };
    }
  }

  /**
   * Create authenticated fetch for admin API calls
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const authResult = await this.checkAuth();
    
    if (!authResult.isAuthenticated) {
      throw new Error('Authentication required');
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    // If 401 and we have local session, clear it
    if (response.status === 401 && this.sessionData) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      this.sessionData = null;
      throw new Error('Session expired');
    }

    return response;
  }

  /**
   * Logout and cleanup
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    }

    // Clear all session data
    this.sessionData = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    queryClient.clear();
  }

  /**
   * Get current user data
   */
  getCurrentUser(): any | null {
    return this.sessionData?.user || null;
  }

  /**
   * Check if currently authenticated
   */
  isAuthenticated(): boolean {
    return !!this.sessionData?.user;
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const deploymentAuth = DeploymentAuth.getInstance();