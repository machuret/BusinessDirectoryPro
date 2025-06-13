import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import CMSPage from "@/pages/cms-page";
import BusinessDetailRefactored from "@/pages/business-detail-refactored";
import NotFound from "@/pages/not-found";
import type { Page } from "@shared/schema";
import type { BusinessWithCategory } from "@shared/schema";

// Helper function to determine error type
const getErrorType = (error: any): 'network' | 'not_found' | 'server' | 'unknown' => {
  if (!error) return 'unknown';
  
  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.response?.status;
  
  if (status === 404 || message.includes('not found')) return 'not_found';
  if (status >= 500 || message.includes('server error')) return 'server';
  if (message.includes('network') || message.includes('fetch')) return 'network';
  
  return 'unknown';
};

// Error display component
const ErrorDisplay = ({ 
  errorType, 
  onRetry, 
  slug 
}: { 
  errorType: 'network' | 'server' | 'unknown';
  onRetry: () => void;
  slug: string;
}) => {
  const getErrorContent = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: <WifiOff className="h-8 w-8 text-red-500" />,
          title: "Connection Issue",
          message: "Unable to connect to the server. Please check your internet connection.",
          showRetry: true
        };
      case 'server':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
          title: "Server Error",
          message: "The server is experiencing issues. Please try again in a moment.",
          showRetry: true
        };
      default:
        return {
          icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
          title: "Loading Error",
          message: `Unable to load content for "${slug}". Please try again.`,
          showRetry: true
        };
    }
  };

  const { icon, title, message, showRetry } = getErrorContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          {showRetry && (
            <div className="flex gap-2">
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="mr-1 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()} size="sm">
                Reload Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function SlugRouter() {
  const [match, params] = useRoute("/:slug");
  const slug = params?.slug;
  const [contentType, setContentType] = useState<'loading' | 'cms' | 'business' | 'notfound' | 'error'>('loading');
  const [errorType, setErrorType] = useState<'network' | 'server' | 'unknown'>('unknown');

  // Try to fetch CMS page first
  const { 
    data: page, 
    isLoading: pageLoading, 
    error: pageError,
    refetch: refetchPage
  } = useQuery<Page>({
    queryKey: ["/api/pages", slug],
    enabled: !!slug,
    retry: (failureCount, error: any) => {
      // Retry network errors up to 2 times, but not 404s
      const errorType = getErrorType(error);
      return errorType === 'network' && failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Try to fetch business by slug
  const { 
    data: business, 
    isLoading: businessLoading, 
    error: businessError,
    refetch: refetchBusiness
  } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/slug/${slug}`],
    enabled: !!slug,
    retry: (failureCount, error: any) => {
      // Retry network errors up to 2 times, but not 404s
      const errorType = getErrorType(error);
      return errorType === 'network' && failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleRetry = () => {
    refetchPage();
    refetchBusiness();
  };

  useEffect(() => {
    console.log('SlugRouter Debug:', {
      slug,
      pageLoading,
      businessLoading,
      hasPage: !!page,
      hasBusiness: !!business,
      pageError: pageError?.message,
      businessError: businessError?.message,
      businessTitle: business?.title,
      businessPlaceId: business?.placeid
    });

    // Only show loading if both are still loading initially
    if ((pageLoading || businessLoading) && !page && !business) {
      setContentType('loading');
      return;
    }

    // Check for critical errors that aren't 404s
    const pageErrorType = getErrorType(pageError);
    const businessErrorType = getErrorType(businessError);
    
    // If we have server/network errors for both, show error state
    if (pageError && businessError && 
        pageErrorType !== 'not_found' && businessErrorType !== 'not_found') {
      // Use the more severe error type
      const errorType = pageErrorType === 'server' || businessErrorType === 'server' 
        ? 'server' 
        : pageErrorType === 'network' || businessErrorType === 'network'
        ? 'network'
        : 'unknown';
      
      setErrorType(errorType);
      setContentType('error');
      return;
    }

    // Success cases - prioritize business over CMS
    if (business && !businessError) {
      setContentType('business');
    } else if (page && !pageError) {
      setContentType('cms');
    } else {
      // Both failed or returned 404 - show not found
      setContentType('notfound');
    }
  }, [page, business, pageLoading, businessLoading, pageError, businessError, slug]);

  if (contentType === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (contentType === 'error') {
    return (
      <ErrorDisplay 
        errorType={errorType} 
        onRetry={handleRetry} 
        slug={slug || 'unknown'} 
      />
    );
  }

  if (contentType === 'cms') {
    return <CMSPage />;
  }

  if (contentType === 'business') {
    return <BusinessDetailRefactored />;
  }

  return <NotFound />;
}