import { Switch, Route } from "wouter";
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
import AccessibilityDemo from "@/pages/accessibility-demo";
import { ContentTest } from "@/components/ContentTest";
import NotFound from "@/pages/not-found";

// Admin Pages
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
import AdminSettingsPage from "@/pages/admin/settings";
import AdminContentPage from "@/pages/admin/content";
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
      
      {/* Admin routes - must come before slug router */}
      {isAuthenticated && (
        <>
          <Route path="/admin" component={() => <AdminLayout />} />
          <Route path="/admin/*" component={() => <AdminLayout />} />
          <Route path="/admin/businesses" component={AdminBusinessesPage} />
          <Route path="/admin/users" component={AdminUsersPage} />
          <Route path="/admin/categories" component={AdminCategoriesPage} />
          <Route path="/admin/reviews" component={AdminReviewsPage} />
          <Route path="/admin/cities" component={AdminCitiesPage} />
          <Route path="/admin/menus" component={AdminMenusPage} />
          <Route path="/admin/pages" component={AdminPagesPage} />
          <Route path="/admin/seo" component={AdminSEOPage} />
          <Route path="/admin/inbox" component={AdminInboxPage} />
          <Route path="/admin/homepage" component={AdminHomepagePage} />
          <Route path="/admin/ownership" component={AdminOwnershipPage} />
          <Route path="/admin/submissions" component={AdminSubmissionsPage} />
          <Route path="/admin/api" component={AdminAPIPage} />
          <Route path="/admin/leads" component={AdminLeadsPage} />
          <Route path="/admin/import" component={AdminImportPage} />
          <Route path="/admin/export" component={AdminExportPage} />
          <Route path="/admin/featured" component={AdminFeaturedPage} />
          <Route path="/admin/services" component={AdminServicesPage} />
          <Route path="/admin/content" component={AdminContentPage} />
          <Route path="/admin/settings" component={AdminSettingsPage} />
          <Route path="/admin/menu/:id" component={MenuEdit} />
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
