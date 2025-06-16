import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/loading/LoadingState";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, requireAuth, navigate]);

  if (isLoading) {
    return <LoadingState variant="spinner" size="lg" message="Checking authentication..." />;
  }

  if (requireAuth && !isAuthenticated) {
    // Component will redirect via useEffect, show loading while redirecting
    return <LoadingState variant="spinner" size="lg" message="Redirecting to login..." />;
  }

  return <>{children}</>;
}