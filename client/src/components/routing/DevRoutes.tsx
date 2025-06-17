import { Route } from "wouter";
import { lazy, Suspense } from "react";
import { LoadingState } from "@/components/loading/LoadingState";

// Lazy load development components
const FormsDemo = lazy(() => import("@/pages/forms-demo"));
const BusinessDebug = lazy(() => import("@/pages/business-debug"));
const NotFound = lazy(() => import("@/pages/not-found"));

function DevSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingState variant="spinner" size="lg" message="Loading..." />}>
      {children}
    </Suspense>
  );
}

export function DevRoutes() {
  return (
    <>
      {/* Development and testing routes */}
      <Route path="/forms-demo">
        <DevSuspense>
          <FormsDemo />
        </DevSuspense>
      </Route>

      <Route path="/business-debug">
        <DevSuspense>
          <BusinessDebug />
        </DevSuspense>
      </Route>

      {/* Catch-all for 404 */}
      <Route>
        <DevSuspense>
          <NotFound />
        </DevSuspense>
      </Route>
    </>
  );
}