import React from "react";
import { Route } from "wouter";
import { AdminRedirect } from "@/components/AdminRedirect";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingState } from "@/components/loading/LoadingState";

// Lazy-loaded admin components
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

// Admin Suspense wrapper
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

// Helper component for admin routes
function AdminRoute({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <Route 
      path={path} 
      component={() => (
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              {children}
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      )} 
    />
  );
}

export function AdminRoutes() {
  return (
    <>
      <Route path="/admin" component={AdminRedirect} />
      <AdminRoute path="/admin/businesses"><AdminBusinessesPage /></AdminRoute>
      <AdminRoute path="/admin/users"><AdminUsersPage /></AdminRoute>
      <AdminRoute path="/admin/categories"><AdminCategoriesPage /></AdminRoute>
      <AdminRoute path="/admin/reviews"><AdminReviewsPage /></AdminRoute>
      <AdminRoute path="/admin/cities"><AdminCitiesPage /></AdminRoute>
      <AdminRoute path="/admin/menu"><MenuEditor /></AdminRoute>
      <AdminRoute path="/admin/pages"><AdminPagesPage /></AdminRoute>
      <AdminRoute path="/admin/seo"><AdminSEOPage /></AdminRoute>
      <AdminRoute path="/admin/inbox"><AdminInboxPage /></AdminRoute>
      <AdminRoute path="/admin/homepage"><AdminHomepagePage /></AdminRoute>
      <AdminRoute path="/admin/ownership"><AdminOwnershipPage /></AdminRoute>
      <AdminRoute path="/admin/submissions"><AdminSubmissionsPage /></AdminRoute>
      <AdminRoute path="/admin/api"><AdminAPIPage /></AdminRoute>
      <AdminRoute path="/admin/leads"><AdminLeadsPage /></AdminRoute>
      <AdminRoute path="/admin/import"><AdminImportPage /></AdminRoute>
      <AdminRoute path="/admin/export"><AdminExportPage /></AdminRoute>
      <AdminRoute path="/admin/featured"><AdminFeaturedPage /></AdminRoute>
      <AdminRoute path="/admin/services"><AdminServicesPage /></AdminRoute>
      <AdminRoute path="/admin/social-media"><SocialMediaEditor /></AdminRoute>
      <AdminRoute path="/admin/content"><AdminContentPage /></AdminRoute>
      <AdminRoute path="/admin/settings"><AdminSettingsPage /></AdminRoute>
    </>
  );
}