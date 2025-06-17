/**
 * Protected Admin Navigation Component
 * Implements route protection and automatic fallback for admin links
 */

import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { ADMIN_ROUTES, getAllAdminRoutes } from "../../utils/adminRoutes";
import { safeNavigate, checkRouteHealth, emergencyRecover, saveNavigationState } from "../../utils/protectedNavigation";
import { useAuth } from "../../hooks/useAuth";

interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
  isActive: boolean;
  isHealthy: boolean;
}

export function ProtectedAdminNavigation() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [healthStatus, setHealthStatus] = useState<{ healthy: boolean; issues: string[] }>({ healthy: true, issues: [] });

  // Initialize navigation and health check
  useEffect(() => {
    initializeNavigation();
    performHealthCheck();
  }, []);

  // Save navigation state on location change
  useEffect(() => {
    if (location.startsWith('/admin')) {
      saveNavigationState(location);
    }
  }, [location]);

  const initializeNavigation = () => {
    const routes = getAllAdminRoutes();
    const items: NavigationItem[] = routes.map(route => ({
      path: route.path,
      label: route.label,
      icon: route.icon,
      isActive: location === route.path,
      isHealthy: true // Will be updated by health check
    }));
    
    setNavigationItems(items);
  };

  const performHealthCheck = async () => {
    try {
      const health = await checkRouteHealth();
      setHealthStatus(health);
      
      if (!health.healthy) {
        console.warn('Navigation health issues detected:', health.issues);
      }
    } catch (error) {
      console.error('Navigation health check failed:', error);
      setHealthStatus({ healthy: false, issues: ['Health check failed'] });
    }
  };

  const handleNavigation = (targetPath: string) => {
    // Use protected navigation with automatic fallback
    safeNavigate(targetPath, navigate);
  };

  const handleEmergencyRecover = () => {
    emergencyRecover(navigate);
  };

  // Don't render navigation if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <nav className="admin-navigation bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex space-x-8">
              {/* Dashboard Link */}
              <Link href={ADMIN_ROUTES.DASHBOARD.path}>
                <a 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === ADMIN_ROUTES.DASHBOARD.path
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(ADMIN_ROUTES.DASHBOARD.path);
                  }}
                >
                  Dashboard
                </a>
              </Link>

              {/* Primary Navigation Items */}
              {[
                ADMIN_ROUTES.BUSINESSES,
                ADMIN_ROUTES.USERS,
                ADMIN_ROUTES.CATEGORIES,
                ADMIN_ROUTES.REVIEWS
              ].map((route) => (
                <Link key={route.path} href={route.path}>
                  <a 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location === route.path
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(route.path);
                    }}
                  >
                    {route.label}
                  </a>
                </Link>
              ))}

              {/* Dropdown for Additional Tools */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Tools
                  <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {[
                      ADMIN_ROUTES.CITIES,
                      ADMIN_ROUTES.SOCIAL_MEDIA,
                      ADMIN_ROUTES.FEATURED,
                      ADMIN_ROUTES.PAGES,
                      ADMIN_ROUTES.CONTENT,
                      ADMIN_ROUTES.SETTINGS,
                      ADMIN_ROUTES.EXPORT,
                      ADMIN_ROUTES.IMPORT,
                      ADMIN_ROUTES.API
                    ].map((route) => (
                      <Link key={route.path} href={route.path}>
                        <a 
                          className={`block px-4 py-2 text-sm ${
                            location === route.path
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavigation(route.path);
                          }}
                        >
                          {route.label}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            {/* Health Status Indicator */}
            {!healthStatus.healthy && (
              <div className="mr-4">
                <button
                  onClick={handleEmergencyRecover}
                  className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full hover:bg-red-200"
                  title={`Navigation issues detected: ${healthStatus.issues.join(', ')}`}
                >
                  Recovery Mode
                </button>
              </div>
            )}

            {/* User Info */}
            <div className="text-sm text-gray-500">
              {user.firstName} {user.lastName}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}