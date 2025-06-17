/**
 * Protected Navigation System
 * Prevents admin link breakage through validation and fallback mechanisms
 */

import { ADMIN_ROUTES, getFallbackRoute, isValidAdminRoute, requiresAuthentication } from './adminRoutes';

/**
 * Navigation state persistence
 */
const NAVIGATION_STORAGE_KEY = 'admin_navigation_state';

interface NavigationState {
  currentRoute: string;
  previousRoute: string;
  timestamp: number;
}

/**
 * Save navigation state for recovery
 */
export function saveNavigationState(currentRoute: string, previousRoute?: string): void {
  try {
    const state: NavigationState = {
      currentRoute,
      previousRoute: previousRoute || '/admin',
      timestamp: Date.now()
    };
    localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save navigation state:', error);
  }
}

/**
 * Restore navigation state after failure
 */
export function restoreNavigationState(): NavigationState | null {
  try {
    const stored = localStorage.getItem(NAVIGATION_STORAGE_KEY);
    if (!stored) return null;
    
    const state: NavigationState = JSON.parse(stored);
    
    // Expire old navigation states (1 hour)
    if (Date.now() - state.timestamp > 3600000) {
      localStorage.removeItem(NAVIGATION_STORAGE_KEY);
      return null;
    }
    
    return state;
  } catch (error) {
    console.warn('Failed to restore navigation state:', error);
    return null;
  }
}

/**
 * Validate route before navigation
 */
export function validateRoute(path: string): { valid: boolean; safePath: string; reason?: string } {
  // Check if it's a valid admin route
  if (!isValidAdminRoute(path)) {
    return {
      valid: false,
      safePath: getFallbackRoute(path),
      reason: 'Invalid admin route'
    };
  }
  
  // Check authentication requirement
  if (requiresAuthentication(path)) {
    // This would be checked by the auth context in practice
    // For now, assume we need to validate authentication
    return {
      valid: true,
      safePath: path
    };
  }
  
  return {
    valid: true,
    safePath: path
  };
}

/**
 * Safe navigation with automatic fallback
 */
export function safeNavigate(path: string, navigate: (path: string) => void): void {
  const validation = validateRoute(path);
  
  if (!validation.valid) {
    console.warn(`Navigation to ${path} failed: ${validation.reason}. Redirecting to ${validation.safePath}`);
    saveNavigationState(validation.safePath, path);
    navigate(validation.safePath);
    return;
  }
  
  // Save successful navigation
  const currentState = restoreNavigationState();
  saveNavigationState(path, currentState?.currentRoute);
  navigate(path);
}

/**
 * Route health check - validates all admin routes
 */
export async function checkRouteHealth(): Promise<{ healthy: boolean; issues: string[] }> {
  const issues: string[] = [];
  
  try {
    // Check if all admin routes are properly defined
    const routes = Object.values(ADMIN_ROUTES);
    
    for (const route of routes) {
      if (!route.path) {
        issues.push(`Route ${route.label} missing path`);
      }
      
      if (!route.label) {
        issues.push(`Route ${route.path} missing label`);
      }
      
      if (route.requiresAuth === undefined) {
        issues.push(`Route ${route.path} missing auth requirement`);
      }
    }
    
    // Check for duplicate paths
    const paths = routes.map(r => r.path);
    const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
    
    if (duplicates.length > 0) {
      issues.push(`Duplicate paths found: ${duplicates.join(', ')}`);
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
    
  } catch (error) {
    issues.push(`Route health check failed: ${error.message}`);
    return {
      healthy: false,
      issues
    };
  }
}

/**
 * Emergency recovery - restore to last known good state
 */
export function emergencyRecover(navigate: (path: string) => void): void {
  const state = restoreNavigationState();
  
  if (state && isValidAdminRoute(state.previousRoute)) {
    console.log('Attempting emergency recovery to:', state.previousRoute);
    navigate(state.previousRoute);
    return;
  }
  
  // Ultimate fallback to dashboard
  console.log('Emergency recovery: returning to dashboard');
  navigate(ADMIN_ROUTES.DASHBOARD.path);
}