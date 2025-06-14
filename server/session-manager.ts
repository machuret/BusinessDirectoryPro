/**
 * Session Management Utilities
 * Provides comprehensive session cleanup and management to prevent session persistence issues
 */

export class SessionManager {
  private static sessionStore = new Map<string, any>();

  /**
   * Clear all existing sessions in memory store
   * Used to prevent session persistence across server restarts
   */
  static clearAllSessions(): void {
    this.sessionStore.clear();
    console.log('[SESSION MANAGER] All sessions cleared');
  }

  /**
   * Force destroy a specific session by ID
   */
  static destroySession(sessionId: string): void {
    this.sessionStore.delete(sessionId);
    console.log('[SESSION MANAGER] Session destroyed:', sessionId);
  }

  /**
   * Get session count for debugging
   */
  static getSessionCount(): number {
    return this.sessionStore.size;
  }

  /**
   * List all active session IDs for debugging
   */
  static getActiveSessions(): string[] {
    return Array.from(this.sessionStore.keys());
  }

  /**
   * Complete session reset for user switching
   * Clears all session data and forces new session creation
   */
  static resetAllUserSessions(): void {
    this.clearAllSessions();
    console.log('[SESSION MANAGER] Complete session reset performed');
  }
}

/**
 * Enhanced logout function that completely clears session state
 */
export function performCompleteLogout(req: any, res: any): Promise<void> {
  return new Promise((resolve) => {
    const sessionId = req.sessionID;
    
    console.log('[COMPLETE LOGOUT] Starting for session:', sessionId);
    
    // Clear all session properties
    if (req.session) {
      Object.keys(req.session).forEach(key => {
        if (key !== 'id') { // Preserve session ID temporarily
          delete (req.session as any)[key];
        }
      });
    }
    
    // Clear from session manager
    SessionManager.destroySession(sessionId);
    
    // Regenerate session with new ID
    req.session.regenerate((err: any) => {
      if (err) {
        console.error('[COMPLETE LOGOUT] Regenerate error:', err);
        // Fallback to destroy
        req.session.destroy(() => {
          clearAllCookies(res);
          resolve();
        });
        return;
      }
      
      console.log('[COMPLETE LOGOUT] New session created:', req.sessionID);
      clearAllCookies(res);
      resolve();
    });
  });
}

/**
 * Clear all possible session-related cookies
 */
function clearAllCookies(res: any): void {
  const cookieNames = [
    'connect.sid',
    'session',
    'sessionId', 
    'express.sid',
    'sess',
    'session.sig'
  ];
  
  const cookieOptions = [
    {},
    { path: '/' },
    { path: '/', httpOnly: true },
    { path: '/', secure: false },
    { path: '/', secure: true },
    { path: '/', domain: undefined },
    { path: '/', httpOnly: true, secure: false, sameSite: 'lax' },
    { path: '/', httpOnly: true, secure: true, sameSite: 'strict' }
  ];
  
  cookieNames.forEach(name => {
    cookieOptions.forEach(options => {
      res.clearCookie(name, options);
    });
  });
  
  // Set anti-cache headers
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Clear-Site-Data': '"cache", "cookies", "storage"'
  });
  
  console.log('[COMPLETE LOGOUT] All cookies cleared');
}