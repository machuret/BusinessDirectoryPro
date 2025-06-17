import { Switch } from "wouter";
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

// Route components
import { PublicRoutes } from "@/components/routing/PublicRoutes";
import { AdminRoutes } from "@/components/routing/AdminRoutes";
import { UserRoutes } from "@/components/routing/UserRoutes";
import { DevRoutes } from "@/components/routing/DevRoutes";



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
      
      {/* Clean URLs for categories and cities */}
      <Route path="/businesses/category/:categorySlug" component={BusinessesPage} />
      <Route path="/businesses/city/:cityName" component={BusinessesPage} />
      
      {/* Direct city access - e.g., /Coorparoo, /Brisbane */}
      <Route path="/:cityName" component={(props) => {
        // Check if this is a city name by comparing with common Australian cities
        const cityName = props.params.cityName;
        const commonCities = ['Brisbane', 'Sydney', 'Melbourne', 'Adelaide', 'Perth', 'Darwin', 'Hobart', 'Canberra', 'Gold-Coast', 'Sunshine-Coast', 'Newcastle', 'Wollongong', 'Geelong', 'Townsville', 'Cairns', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston', 'Mackay', 'Rockhampton', 'Bunbury', 'Bundaberg', 'Coffs-Harbour', 'Wagga-Wagga', 'Hervey-Bay', 'Mildura', 'Shepparton', 'Port-Macquarie', 'Gladstone', 'Tamworth', 'Traralgon', 'Orange', 'Bowral', 'Geraldton', 'Dubbo', 'Nowra', 'Warrnambool', 'Kalgoorlie', 'Whyalla', 'Murray-Bridge', 'Devonport', 'Burnie', 'Alice-Springs', 'Mount-Gambier', 'Lismore', 'Nelson-Bay', 'Victor-Harbor', 'Goulburn', 'Taree', 'Coorparoo', 'Woolloongabba', 'South-Brisbane', 'Fortitude-Valley', 'New-Farm', 'Paddington', 'Milton', 'Toowong', 'St-Lucia', 'Indooroopilly', 'Chermside', 'Carindale', 'Garden-City'];
        
        if (commonCities.includes(cityName) || cityName.includes('-')) {
          return <BusinessesPage />;
        }
        
        // If not a recognized city, let it fall through to SlugRouter
        return null;
      }} />
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
