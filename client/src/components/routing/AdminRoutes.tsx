import { Route, Redirect } from "wouter";
import { lazy, Suspense } from "react";
import { LoadingState } from "@/components/loading/LoadingState";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Lazy load admin components
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
const AdminSocialMediaPage = lazy(() => import("@/pages/admin/social-media"));
const AdminFeaturedRequestsPage = lazy(() => import("@/pages/admin/featured-requests"));
const AdminSiteSettingsPage = lazy(() => import("@/pages/admin/site-settings"));

function AdminSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingState variant="spinner" size="lg" message="Loading admin..." />}>
      {children}
    </Suspense>
  );
}

export function AdminRoutes() {
  return (
    <>
      {/* Admin redirect */}
      <Route path="/admin">
        <Redirect to="/admin/businesses" />
      </Route>

      {/* Admin businesses */}
      <Route path="/admin/businesses">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminBusinessesPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin users */}
      <Route path="/admin/users">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin categories */}
      <Route path="/admin/categories">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminCategoriesPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin reviews */}
      <Route path="/admin/reviews">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminReviewsPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin cities */}
      <Route path="/admin/cities">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminCitiesPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin menu editor */}
      <Route path="/admin/menu">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <MenuEditor />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin pages */}
      <Route path="/admin/pages">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminPagesPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin SEO */}
      <Route path="/admin/seo">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminSEOPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin inbox */}
      <Route path="/admin/inbox">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminInboxPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin homepage */}
      <Route path="/admin/homepage">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminHomepagePage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin ownership claims */}
      <Route path="/admin/ownership">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminOwnershipPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin leads */}
      <Route path="/admin/leads">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminLeadsPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin social media */}
      <Route path="/admin/social-media">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminSocialMediaPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin featured requests */}
      <Route path="/admin/featured-requests">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminFeaturedRequestsPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin site settings */}
      <Route path="/admin/site-settings">
        <AdminSuspense>
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminSiteSettingsPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>
    </>
  );
}