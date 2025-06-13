import React, { Component, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  showReload?: boolean;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Section Error Boundary caught an error:", error, errorInfo);
    
    // Log error details for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    };
    
    console.error("Error details:", errorDetails);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const {
        fallbackTitle = "Section Error",
        fallbackMessage = "An error occurred in this section. Please try refreshing the page.",
        showReload = true,
        className = ""
      } = this.props;

      return (
        <div className={`py-8 px-4 ${className}`}>
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{fallbackTitle}</h3>
                <p className="text-sm">{fallbackMessage}</p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer">Error Details (Development)</summary>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry} 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  Try Again
                </Button>
                {showReload && (
                  <Button 
                    onClick={this.handleReload} 
                    variant="default" 
                    size="sm"
                  >
                    Reload Page
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}