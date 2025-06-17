import React from "react";
import { Route } from "wouter";
import { LoadingState } from "@/components/loading/LoadingState";
import { ContentTest } from "@/components/ContentTest";
import NotFound from "@/pages/not-found";

// Lazy-loaded development/testing components
const BusinessDebug = React.lazy(() => import("@/pages/business-debug"));
const FormsDemo = React.lazy(() => import("@/pages/forms-demo"));
const AccessibilityDemo = React.lazy(() => import("@/pages/accessibility-demo"));

// Development Suspense wrapper
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

export function DevRoutes() {
  return (
    <>
      <Route 
        path="/business-debug" 
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
      <Route path="/content-test" component={ContentTest} />
      <Route component={NotFound} />
    </>
  );
}