import { Switch, Route } from "wouter";
import React, { lazy, Suspense } from "react";
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
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Lazy load pages
const Home = lazy(() => import("@/pages/home"));
const Categories = lazy(() => import("@/pages/categories"));
const Cities = lazy(() => import("@/pages/cities"));
const BusinessesPage = lazy(() => import("@/pages/businesses"));
const BusinessDetail = lazy(() => import("@/pages/business-detail-refactored"));
const Featured = lazy(() => import("@/pages/featured"));
const SearchResults = lazy(() => import("@/pages/search-results"));
const PageDisplay = lazy(() => import("@/pages/page-display"));
const Login = lazy(() => import("@/pages/login"));
const AddBusiness = lazy(() => import("@/pages/add-business"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Admin pages
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const AdminBusinessesPage = lazy(() => import("@/pages/admin/businesses"));
const AdminUsersPage = lazy(() => import("@/pages/admin/users"));
const AdminCategoriesPage = lazy(() => import("@/pages/admin/categories"));
const AdminReviewsPage = lazy(() => import("@/pages/admin/reviews"));
const AdminCitiesPage = lazy(() => import("@/pages/admin/cities"));
const MenuEditor = lazy(() => import("@/pages/admin/menu-editor"));
const AdminPagesPage = lazy(() => import("@/pages/admin/pages"));
const AdminSEOPage = lazy(() => import("@/pages/admin/seo"));
const AdminInboxPage = lazy(() => import("@/pages/admin/inbox"));
const AdminHomepagePage = lazy(() => import("@/pages/admin/homepage"));
const AdminOwnershipPage = lazy(() => import("@/pages/admin/ownership"));
const AdminLeadsPage = lazy(() => import("@/pages/admin/leads"));

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingState variant="spinner" size="lg" message="Loading page..." />}>
      {children}
    </Suspense>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState variant="spinner" size="lg" message="Initializing application..." />;
  }

  return (
    <Switch>
      {/* Home page */}
      <Route path="/">
        <PageSuspense>
          <Home />
        </PageSuspense>
      </Route>

      {/* Categories pages */}
      <Route path="/categories">
        <PageSuspense>
          <Categories />
        </PageSuspense>
      </Route>
      <Route path="/categories/:categorySlug">
        <PageSuspense>
          <Categories />
        </PageSuspense>
      </Route>

      {/* Cities pages */}
      <Route path="/cities">
        <PageSuspense>
          <Cities />
        </PageSuspense>
      </Route>
      <Route path="/cities/:cityName">
        <PageSuspense>
          <Cities />
        </PageSuspense>
      </Route>
      <Route path="/:cityName">
        <PageSuspense>
          <Cities />
        </PageSuspense>
      </Route>

      {/* Business directory pages */}
      <Route path="/businesses">
        <PageSuspense>
          <BusinessesPage />
        </PageSuspense>
      </Route>
      <Route path="/businesses/:businessSlug">
        <PageSuspense>
          <BusinessDetail />
        </PageSuspense>
      </Route>

      {/* Featured businesses */}
      <Route path="/featured">
        <PageSuspense>
          <Featured />
        </PageSuspense>
      </Route>

      {/* Search results */}
      <Route path="/search">
        <PageSuspense>
          <SearchResults />
        </PageSuspense>
      </Route>

      {/* Add business */}
      <Route path="/add-business">
        <PageSuspense>
          <AddBusiness />
        </PageSuspense>
      </Route>

      {/* User dashboard */}
      <Route path="/dashboard">
        <PageSuspense>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </PageSuspense>
      </Route>

      {/* Login */}
      <Route path="/login">
        <PageSuspense>
          <Login />
        </PageSuspense>
      </Route>

      {/* Admin routes */}
      <Route path="/admin">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminBusinessesPage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/businesses">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminBusinessesPage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/users">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/categories">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminCategoriesPage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/reviews">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminReviewsPage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/cities">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminCitiesPage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/menu-editor">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <MenuEditor />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/pages">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminPagesPage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/seo">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminSEOPage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/inbox">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminInboxPage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/homepage">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminHomepagePage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/ownership">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminOwnershipPage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>
      <Route path="/admin/leads">
        <PageSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminLeadsPage />
            </AdminLayout>
          </ProtectedRoute>
        </PageSuspense>
      </Route>

      {/* Dynamic pages */}
      <Route path="/page/:slug">
        <PageSuspense>
          <PageDisplay />
        </PageSuspense>
      </Route>

      {/* 404 fallback */}
      <Route>
        <PageSuspense>
          <NotFound />
        </PageSuspense>
      </Route>
    </Switch>
  );
}

export default function App() {
  usePerformanceMonitoring();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ContentProvider>
          <UIProvider>
            <TooltipProvider>
              <div className="min-h-screen bg-background text-foreground">
                <NetworkStatusBanner />
                <Router />
                <Toaster />
              </div>
            </TooltipProvider>
          </UIProvider>
        </ContentProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}