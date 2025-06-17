import { Route } from "wouter";
import { lazy, Suspense } from "react";
import { LoadingState } from "@/components/loading/LoadingState";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy load user dashboard components
const Dashboard = lazy(() => import("@/pages/dashboard"));
const BusinessOwnerDashboard = lazy(() => import("@/pages/business-owner"));

function UserSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingState variant="spinner" size="lg" message="Loading dashboard..." />}>
      {children}
    </Suspense>
  );
}

export function UserRoutes() {
  return (
    <>
      {/* User dashboard */}
      <Route path="/dashboard">
        <UserSuspense>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </UserSuspense>
      </Route>

      {/* Business owner dashboard */}
      <Route path="/business-owner">
        <UserSuspense>
          <ProtectedRoute>
            <BusinessOwnerDashboard />
          </ProtectedRoute>
        </UserSuspense>
      </Route>
    </>
  );
}