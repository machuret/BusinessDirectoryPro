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
      <PublicRoutes />
      <AdminRoutes />
      <UserRoutes />
      <DevRoutes />
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