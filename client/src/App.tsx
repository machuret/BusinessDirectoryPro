import { Switch, Route, useLocation } from "wouter";
import React from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { UIProvider } from "@/contexts/UIContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { LoadingState } from "@/components/loading/LoadingState";
import { NetworkStatusBanner } from "@/components/NetworkStatusBanner";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";

// Public page imports (loaded immediately for visitors)
import Home from "@/pages/home";
import Categories from "@/pages/categories";
import Cities from "@/pages/cities";
import Featured from "@/pages/featured";
import BusinessDetailRefactored from "@/pages/business-detail-refactored";
import BusinessListing from "@/pages/business-listing";
import SearchResults from "@/pages/search-results";
import PageDisplay from "@/pages/page-display";
import Login from "@/pages/login-migrated";
import AddBusiness from "@/pages/add-business";
import BusinessesPage from "@/pages/businesses";
import SlugRouter from "@/components/SlugRouter";
import NotFound from "@/pages/not-found";

// Lazy-loaded admin components (code-split for performance)
const AdminLayout = React.lazy(() => import("@/components/admin/AdminLayout"));
const AdminBusinessesPage = React.lazy(() => import("@/pages/admin/businesses"));
const AdminUsersPage = React.lazy(() => import("@/pages/admin/users"));
const AdminCategoriesPage = React.lazy(() => import("@/pages/admin/categories"));
const AdminReviewsPage = React.lazy(() => import("@/pages/admin/reviews"));
const AdminCitiesPage = React.lazy(() => import("@/pages/admin/cities"));
const MenuEditor = React.lazy(() => import("@/pages/admin/menu-editor"));
const AdminPagesPage = React.lazy(() => import("@/pages/admin/pages"));
const AdminSEOPage = React.lazy(() => import("@/pages/admin/seo"));
const AdminInboxPage = React.lazy(() => import("@/pages/admin/inbox"));
const AdminHomepagePage = React.lazy(() => import("@/pages/admin/homepage"));
const AdminOwnershipPage = React.lazy(() => import("@/pages/admin/ownership"));
const AdminSubmissionsPage = React.lazy(() => import("@/pages/admin/submissions"));
const AdminAPIPage = React.lazy(() => import("@/pages/admin/api"));
const AdminLeadsPage = React.lazy(() => import("@/pages/admin/leads"));
const AdminImportPage = React.lazy(() => import("@/pages/admin/import"));
const AdminExportPage = React.lazy(() => import("@/pages/admin/export"));
const AdminFeaturedPage = React.lazy(() => import("@/pages/admin/featured"));
const AdminServicesPage = React.lazy(() => import("@/pages/admin/services"));
const SocialMediaEditor = React.lazy(() => import("@/pages/admin/social-media-editor"));
const AdminContentPage = React.lazy(() => import("@/pages/admin/content"));
const AdminSettingsPage = React.lazy(() => import("@/pages/admin/settings"));

// Lazy-loaded user dashboard components
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const BusinessOwnerPortal = React.lazy(() => import("@/pages/business-owner-portal"));
const GetFeaturedPage = React.lazy(() => import("@/pages/get-featured"));
const MenuEdit = React.lazy(() => import("@/pages/menu-edit"));

// Development/testing components (lazy-loaded)
const BusinessDebug = React.lazy(() => import("@/pages/business-debug"));
const FormsDemo = React.lazy(() => import("@/pages/forms-demo"));
const AccessibilityDemo = React.lazy(() => import("@/pages/accessibility-demo"));

// Import components needed for routing
import { AdminRedirect } from "@/components/AdminRedirect";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ContentTest } from "@/components/ContentTest";

// Custom Suspense wrapper with enhanced loading state for admin dashboard
function AdminSuspense({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <LoadingState 
                variant="spinner" 
                size="lg" 
                message="Loading admin dashboard..."
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Initializing management interface...
            </p>
          </div>
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
}

// Custom Suspense wrapper for user dashboard components
function UserSuspense({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingState 
            variant="spinner" 
            size="md" 
            message="Loading dashboard..."
          />
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
}

// Custom Suspense wrapper for development/testing components
function DevSuspense({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <LoadingState variant="spinner" size="sm" message="Loading component..." />
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState variant="spinner" size="lg" message="Initializing application..." />;
  }

  return (
    <Switch>
      {/* Public routes - loaded immediately for optimal visitor performance */}
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/categories/:slug" component={Categories} />
      <Route path="/cities" component={Cities} />
      <Route path="/cities/:city" component={Cities} />
      <Route path="/featured" component={Featured} />
      <Route path="/businesses" component={BusinessesPage} />
      <Route path="/search" component={SearchResults} />
      <Route path="/pages/:slug" component={PageDisplay} />
      <Route path="/login" component={Login} />
      <Route path="/add-business" component={AddBusiness} />
      
      {/* Admin routes - code-split and lazy-loaded */}
      <Route path="/admin" component={AdminRedirect} />
      <Route 
        path="/admin/businesses" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminBusinessesPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/users" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/categories" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminCategoriesPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/reviews" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminReviewsPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/cities" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminCitiesPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/menus" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <MenuEditor />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/pages" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminPagesPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/seo" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminSEOPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/inbox" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminInboxPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/homepage" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminHomepagePage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/ownership" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminOwnershipPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/submissions" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminSubmissionsPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/api" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminAPIPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/leads" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminLeadsPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/import" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminImportPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/export" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminExportPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/featured" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminFeaturedPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/services" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminServicesPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/social-media" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <SocialMediaEditor />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/content" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminContentPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/settings" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <AdminSettingsPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      <Route 
        path="/admin/menu/:id" 
        component={() => (
          <AdminSuspense>
            <ProtectedRoute>
              <AdminLayout>
                <MenuEdit />
              </AdminLayout>
            </ProtectedRoute>
          </AdminSuspense>
        )} 
      />
      
      {/* User dashboard routes - code-split for performance */}
      <Route 
        path="/dashboard" 
        component={() => (
          <UserSuspense>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </UserSuspense>
        )} 
      />
      <Route 
        path="/business-portal/:businessId" 
        component={() => (
          <UserSuspense>
            <BusinessOwnerPortal />
          </UserSuspense>
        )} 
      />
      <Route 
        path="/get-featured" 
        component={() => (
          <UserSuspense>
            <ProtectedRoute>
              <GetFeaturedPage />
            </ProtectedRoute>
          </UserSuspense>
        )} 
      />
      
      {/* Development/testing routes - code-split */}
      <Route 
        path="/debug/:slug" 
        component={() => (
          <DevSuspense>
            <BusinessDebug />
          </DevSuspense>
        )} 
      />
      <Route 
        path="/forms-demo" 
        component={() => (
          <DevSuspense>
            <FormsDemo />
          </DevSuspense>
        )} 
      />
      <Route 
        path="/accessibility-demo" 
        component={() => (
          <DevSuspense>
            <AccessibilityDemo />
          </DevSuspense>
        )} 
      />
      <Route 
        path="/content-test" 
        component={() => (
          <DevSuspense>
            <div className="container mx-auto py-8">
              <ContentTest />
            </div>
          </DevSuspense>
        )} 
      />
      
      {/* Slug router - must come after all specific routes */}
      <Route path="/:slug" component={SlugRouter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize performance monitoring
  usePerformanceMonitoring({
    reportUrl: '/api/analytics/performance',
    sampleRate: 0.1,
    debug: import.meta.env.DEV
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ContentProvider>
        <ErrorBoundary>
          <TooltipProvider>
            <NetworkStatusBanner />
            <Toaster />
            <Router />
          </TooltipProvider>
        </ErrorBoundary>
      </ContentProvider>
    </QueryClientProvider>
  );
}

export default App;
