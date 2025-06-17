/**
 * Admin Route Protection System
 * Centralizes all admin routes and provides protection against breakage
 */

export interface AdminRoute {
  path: string;
  label: string;
  icon?: string;
  requiresAuth: boolean;
  apiEndpoint?: string;
  fallbackPath?: string;
}

/**
 * Centralized admin route definitions
 * These routes are version-locked and protected against changes
 */
export const ADMIN_ROUTES: Record<string, AdminRoute> = {
  DASHBOARD: {
    path: '/admin',
    label: 'Dashboard',
    icon: 'home',
    requiresAuth: true,
    fallbackPath: '/admin'
  },
  BUSINESSES: {
    path: '/admin/businesses',
    label: 'Businesses',
    icon: 'building',
    requiresAuth: true,
    apiEndpoint: '/api/admin/businesses',
    fallbackPath: '/admin'
  },
  USERS: {
    path: '/admin/users',
    label: 'Users',
    icon: 'users',
    requiresAuth: true,
    apiEndpoint: '/api/admin/users',
    fallbackPath: '/admin'
  },
  CATEGORIES: {
    path: '/admin/categories',
    label: 'Categories',
    icon: 'tag',
    requiresAuth: true,
    apiEndpoint: '/api/admin/categories',
    fallbackPath: '/admin'
  },
  REVIEWS: {
    path: '/admin/reviews',
    label: 'Reviews',
    icon: 'star',
    requiresAuth: true,
    apiEndpoint: '/api/admin/reviews',
    fallbackPath: '/admin'
  },
  CITIES: {
    path: '/admin/cities',
    label: 'Cities',
    icon: 'map',
    requiresAuth: true,
    apiEndpoint: '/api/admin/cities',
    fallbackPath: '/admin'
  },
  SOCIAL_MEDIA: {
    path: '/admin/social-media',
    label: 'Social Media',
    icon: 'link',
    requiresAuth: true,
    apiEndpoint: '/api/admin/social-media',
    fallbackPath: '/admin'
  },
  FEATURED: {
    path: '/admin/featured',
    label: 'Featured',
    icon: 'star',
    requiresAuth: true,
    apiEndpoint: '/api/admin/featured-requests',
    fallbackPath: '/admin'
  },
  PAGES: {
    path: '/admin/pages',
    label: 'Pages',
    icon: 'file-text',
    requiresAuth: true,
    apiEndpoint: '/api/admin/pages',
    fallbackPath: '/admin'
  },
  CONTENT: {
    path: '/admin/content',
    label: 'Content',
    icon: 'edit',
    requiresAuth: true,
    apiEndpoint: '/api/admin/content-strings',
    fallbackPath: '/admin'
  },
  SETTINGS: {
    path: '/admin/settings',
    label: 'Settings',
    icon: 'settings',
    requiresAuth: true,
    apiEndpoint: '/api/admin/site-settings',
    fallbackPath: '/admin'
  },
  EXPORT: {
    path: '/admin/export',
    label: 'Export',
    icon: 'download',
    requiresAuth: true,
    apiEndpoint: '/api/admin/export',
    fallbackPath: '/admin'
  },
  IMPORT: {
    path: '/admin/import',
    label: 'Import',
    icon: 'upload',
    requiresAuth: true,
    apiEndpoint: '/api/admin/import',
    fallbackPath: '/admin'
  },
  API: {
    path: '/admin/api',
    label: 'API',
    icon: 'key',
    requiresAuth: true,
    apiEndpoint: '/api/admin/api-keys',
    fallbackPath: '/admin'
  }
};

/**
 * Get admin route by key with fallback protection
 */
export function getAdminRoute(routeKey: keyof typeof ADMIN_ROUTES): AdminRoute {
  const route = ADMIN_ROUTES[routeKey];
  if (!route) {
    console.warn(`Admin route ${routeKey} not found, falling back to dashboard`);
    return ADMIN_ROUTES.DASHBOARD;
  }
  return route;
}

/**
 * Generate protected admin URL
 */
export function generateAdminUrl(routeKey: keyof typeof ADMIN_ROUTES): string {
  const route = getAdminRoute(routeKey);
  return route.path;
}

/**
 * Validate if a path is a valid admin route
 */
export function isValidAdminRoute(path: string): boolean {
  return Object.values(ADMIN_ROUTES).some(route => route.path === path);
}

/**
 * Get fallback route for failed navigation
 */
export function getFallbackRoute(failedPath: string): string {
  const route = Object.values(ADMIN_ROUTES).find(r => r.path === failedPath);
  return route?.fallbackPath || ADMIN_ROUTES.DASHBOARD.path;
}

/**
 * Get all admin routes for navigation generation
 */
export function getAllAdminRoutes(): AdminRoute[] {
  return Object.values(ADMIN_ROUTES);
}

/**
 * Check if route requires authentication
 */
export function requiresAuthentication(path: string): boolean {
  const route = Object.values(ADMIN_ROUTES).find(r => r.path === path);
  return route?.requiresAuth ?? true; // Default to requiring auth
}