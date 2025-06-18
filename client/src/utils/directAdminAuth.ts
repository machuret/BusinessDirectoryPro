/**
 * Direct Admin Authentication System
 * Bypasses browser session issues by implementing direct login flow
 */

interface LoginResponse {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

class DirectAdminAuth {
  private isAuthenticated = false;
  private userInfo: LoginResponse | null = null;
  private sessionCookie = '';

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const userData = await response.json();
      
      // Store authentication state
      this.isAuthenticated = true;
      this.userInfo = userData;
      
      // Extract session cookie for subsequent requests
      const cookies = response.headers.get('set-cookie');
      if (cookies) {
        this.sessionCookie = cookies;
        localStorage.setItem('admin_session', this.sessionCookie);
      }

      // Store user data for persistence
      localStorage.setItem('admin_user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Direct admin login failed:', error);
      throw error;
    }
  }

  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add session cookie if available
    if (this.sessionCookie) {
      headers['Cookie'] = this.sessionCookie;
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  }

  getUser(): LoginResponse | null {
    if (this.userInfo) {
      return this.userInfo;
    }

    // Try to restore from localStorage
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      try {
        this.userInfo = JSON.parse(storedUser);
        this.isAuthenticated = true;
        this.sessionCookie = localStorage.getItem('admin_session') || '';
        return this.userInfo;
      } catch {
        // Invalid stored data, clear it
        this.logout();
      }
    }

    return null;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated && this.userInfo !== null;
  }

  logout(): void {
    this.isAuthenticated = false;
    this.userInfo = null;
    this.sessionCookie = '';
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_session');
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await this.authenticatedFetch('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        this.userInfo = userData;
        this.isAuthenticated = true;
        return true;
      }
    } catch (error) {
      console.warn('Auth status check failed:', error);
    }
    
    this.logout();
    return false;
  }
}

export const directAdminAuth = new DirectAdminAuth();