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
          <ProtectedRoute>
            <AdminLayout>
              <AdminBusinessesPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin users */}
      <Route path="/admin/users">
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin categories */}
      <Route path="/admin/categories">
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminCategoriesPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin reviews */}
      <Route path="/admin/reviews">
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminReviewsPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin cities */}
      <Route path="/admin/cities">
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminCitiesPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Menu editor */}
      <Route path="/admin/menu-editor">
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <MenuEditor />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin pages */}
      <Route path="/admin/pages">
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminPagesPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin SEO */}
      <Route path="/admin/seo">
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminSEOPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin inbox */}
      <Route path="/admin/inbox">
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminInboxPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin homepage */}
      <Route path="/admin/homepage">
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminHomepagePage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin ownership */}
      <Route path="/admin/ownership">
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminOwnershipPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>

      {/* Admin leads */}
      <Route path="/admin/leads">
        <AdminSuspense>
          <ProtectedRoute>
            <AdminLayout>
              <AdminLeadsPage />
            </AdminLayout>
          </ProtectedRoute>
        </AdminSuspense>
      </Route>
    </>
  );
}