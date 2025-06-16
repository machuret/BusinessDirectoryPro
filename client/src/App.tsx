import { Switch, Route, useLocation } from "wouter";
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
import Home from "@/pages/home";
import Categories from "@/pages/categories";
import Cities from "@/pages/cities";
import Featured from "@/pages/featured";
import BusinessDetailRefactored from "@/pages/business-detail-refactored";
import BusinessListing from "@/pages/business-listing";
import BusinessOwnerPortal from "@/pages/business-owner-portal";
import SearchResults from "@/pages/search-results";
import Dashboard from "@/pages/dashboard";
import AdminLayout from "@/components/admin/AdminLayout";
import MenuEdit from "@/pages/menu-edit";
import PageDisplay from "@/pages/page-display";
import Login from "@/pages/login-migrated";
import AddBusiness from "@/pages/add-business";
import BusinessesPage from "@/pages/businesses";
import SlugRouter from "@/components/SlugRouter";
import BusinessDebug from "@/pages/business-debug";
import FormsDemo from "@/pages/forms-demo";

// Admin page imports
import AdminBusinessesPage from "@/pages/admin/businesses";
import AdminUsersPage from "@/pages/admin/users";
import AdminCategoriesPage from "@/pages/admin/categories";
import AdminReviewsPage from "@/pages/admin/reviews";
import AdminCitiesPage from "@/pages/admin/cities";
import AdminMenusPage from "@/pages/admin/menus";
import AdminPagesPage from "@/pages/admin/pages";
import AdminSEOPage from "@/pages/admin/seo";
import AdminInboxPage from "@/pages/admin/inbox";
import AdminHomepagePage from "@/pages/admin/homepage";
import AdminOwnershipPage from "@/pages/admin/ownership";
import AdminSubmissionsPage from "@/pages/admin/submissions";
import AdminAPIPage from "@/pages/admin/api";
import AdminLeadsPage from "@/pages/admin/leads";
import AdminImportPage from "@/pages/admin/import";
import AdminExportPage from "@/pages/admin/export";
import AdminFeaturedPage from "@/pages/admin/featured";
import AdminServicesPage from "@/pages/admin/services";
import AdminSocialMedia from "@/pages/admin-social-media";
import AdminContentPage from "@/pages/admin/content";
import AdminSettingsPage from "@/pages/admin/settings";
import AccessibilityDemo from "@/pages/accessibility-demo";
import { ContentTest } from "@/components/ContentTest";
import NotFound from "@/pages/not-found";
import { AdminRedirect } from "@/components/AdminRedirect";


import GetFeaturedPage from "@/pages/get-featured";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState variant="spinner" size="lg" message="Initializing application..." />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/categories/:slug" component={Categories} />
      <Route path="/cities" component={Cities} />
      <Route path="/cities/:city" component={Cities} />
      <Route path="/featured" component={Featured} />
      <Route path="/businesses" component={BusinessesPage} />
      <Route path="/search" component={SearchResults} />
      <Route path="/business-portal/:businessId" component={BusinessOwnerPortal} />
      <Route path="/pages/:slug" component={PageDisplay} />
      <Route path="/login" component={Login} />
      <Route path="/add-business" component={AddBusiness} />
      <Route path="/debug/:slug" component={BusinessDebug} />
      <Route path="/forms-demo" component={FormsDemo} />
      <Route path="/accessibility-demo" component={AccessibilityDemo} />
      <Route path="/content-test" component={() => <div className="container mx-auto py-8"><ContentTest /></div>} />
      
      {/* Admin routes - handle both authenticated and unauthenticated access */}
      <Route path="/admin" component={AdminRedirect} />
      <Route path="/admin/businesses" component={() => isAuthenticated ? <AdminLayout><AdminBusinessesPage /></AdminLayout> : <Login />} />
      <Route path="/admin/users" component={() => isAuthenticated ? <AdminLayout><AdminUsersPage /></AdminLayout> : <Login />} />
      <Route path="/admin/categories" component={() => isAuthenticated ? <AdminLayout><AdminCategoriesPage /></AdminLayout> : <Login />} />
      <Route path="/admin/reviews" component={() => isAuthenticated ? <AdminLayout><AdminReviewsPage /></AdminLayout> : <Login />} />
      <Route path="/admin/cities" component={() => isAuthenticated ? <AdminLayout><AdminCitiesPage /></AdminLayout> : <Login />} />
      <Route path="/admin/menus" component={() => isAuthenticated ? <AdminLayout><AdminMenusPage /></AdminLayout> : <Login />} />
      <Route path="/admin/pages" component={() => isAuthenticated ? <AdminLayout><AdminPagesPage /></AdminLayout> : <Login />} />
      <Route path="/admin/seo" component={() => isAuthenticated ? <AdminLayout><AdminSEOPage /></AdminLayout> : <Login />} />
      <Route path="/admin/inbox" component={() => isAuthenticated ? <AdminLayout><AdminInboxPage /></AdminLayout> : <Login />} />
      <Route path="/admin/homepage" component={() => isAuthenticated ? <AdminLayout><AdminHomepagePage /></AdminLayout> : <Login />} />
      <Route path="/admin/ownership" component={() => isAuthenticated ? <AdminLayout><AdminOwnershipPage /></AdminLayout> : <Login />} />
      <Route path="/admin/submissions" component={() => isAuthenticated ? <AdminLayout><AdminSubmissionsPage /></AdminLayout> : <Login />} />
      <Route path="/admin/api" component={() => isAuthenticated ? <AdminLayout><AdminAPIPage /></AdminLayout> : <Login />} />
      <Route path="/admin/leads" component={() => isAuthenticated ? <AdminLayout><AdminLeadsPage /></AdminLayout> : <Login />} />
      <Route path="/admin/import" component={() => isAuthenticated ? <AdminLayout><AdminImportPage /></AdminLayout> : <Login />} />
      <Route path="/admin/export" component={() => isAuthenticated ? <AdminLayout><AdminExportPage /></AdminLayout> : <Login />} />
      <Route path="/admin/featured" component={() => isAuthenticated ? <AdminLayout><AdminFeaturedPage /></AdminLayout> : <Login />} />
      <Route path="/admin/services" component={() => isAuthenticated ? <AdminLayout><AdminServicesPage /></AdminLayout> : <Login />} />
      <Route path="/admin/social-media" component={() => isAuthenticated ? <AdminLayout><AdminSocialMedia /></AdminLayout> : <Login />} />
      <Route path="/admin/content" component={() => isAuthenticated ? <AdminLayout><AdminContentPage /></AdminLayout> : <Login />} />
      <Route path="/admin/settings" component={() => isAuthenticated ? <AdminLayout><AdminSettingsPage /></AdminLayout> : <Login />} />
      <Route path="/admin/menu/:id" component={() => isAuthenticated ? <AdminLayout><MenuEdit /></AdminLayout> : <Login />} />
      
      {/* Authenticated-only routes */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/get-featured" component={GetFeaturedPage} />
        </>
      )}
      
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
