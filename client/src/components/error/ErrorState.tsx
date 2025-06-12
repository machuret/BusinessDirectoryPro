import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "wouter";

interface ErrorStateProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
  variant?: "card" | "inline" | "page";
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this content.",
  showRetry = true,
  showHome = false,
  onRetry,
  variant = "card"
}: ErrorStateProps) {
  const content = (
    <>
      <div className="flex flex-col items-center text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        <div className="flex space-x-2">
          {showRetry && onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="mr-1 h-4 w-4" />
              Try Again
            </Button>
          )}
          {showHome && (
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="mr-1 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );

  if (variant === "card") {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          {content}
        </CardContent>
      </Card>
    );
  }

  if (variant === "page") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="max-w-md w-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {content}
    </div>
  );
}

// Network-specific error component
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      showHome={true}
    />
  );
}

// Not found error component
export function NotFoundError({ resource = "page" }: { resource?: string }) {
  return (
    <ErrorState
      title="Not Found"
      message={`The ${resource} you're looking for doesn't exist or has been moved.`}
      showRetry={false}
      showHome={true}
      variant="page"
    />
  );
}

// Permission error component
export function PermissionError() {
  return (
    <ErrorState
      title="Access Denied"
      message="You don't have permission to access this resource."
      showRetry={false}
      showHome={true}
    />
  );
}