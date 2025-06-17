import React from "react";
import { Route } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingState } from "@/components/loading/LoadingState";

// Lazy-loaded user dashboard components
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const BusinessOwnerPortal = React.lazy(() => import("@/pages/business-owner-portal"));
const GetFeaturedPage = React.lazy(() => import("@/pages/get-featured"));
const MenuEdit = React.lazy(() => import("@/pages/menu-edit"));

// User Suspense wrapper
function UserSuspense({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingState 
            variant="spinner" 
            size="md" 
            message="Loading dashboard..."
          />
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
}

export function UserRoutes() {
  return (
    <>
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
        path="/business-owner" 
        component={() => (
          <UserSuspense>
            <ProtectedRoute>
              <BusinessOwnerPortal />
            </ProtectedRoute>
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
      <Route 
        path="/menu-edit/:businessId" 
        component={() => (
          <UserSuspense>
            <ProtectedRoute>
              <MenuEdit />
            </ProtectedRoute>
          </UserSuspense>
        )} 
      />
    </>
  );
}