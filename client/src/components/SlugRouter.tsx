import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import CMSPage from "@/pages/cms-page";
import BusinessDetail from "@/pages/business-detail";
import NotFound from "@/pages/not-found";
import type { Page } from "@shared/schema";
import type { BusinessWithCategory } from "@shared/schema";

export default function SlugRouter() {
  const [match, params] = useRoute("/:slug");
  const slug = params?.slug;
  const [contentType, setContentType] = useState<'loading' | 'cms' | 'business' | 'notfound'>('loading');

  // Try to fetch CMS page first
  const { data: page, isLoading: pageLoading, error: pageError } = useQuery<Page>({
    queryKey: ["/api/pages", slug],
    enabled: !!slug,
    retry: false,
  });

  // Try to fetch business by slug
  const { data: business, isLoading: businessLoading, error: businessError } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/slug/${slug}`],
    enabled: !!slug,
    retry: false,
  });

  useEffect(() => {
    if (pageLoading || businessLoading) {
      setContentType('loading');
    } else if (page && !pageError) {
      setContentType('cms');
    } else if (business && !businessError) {
      setContentType('business');
    } else {
      setContentType('notfound');
    }
  }, [page, business, pageLoading, businessLoading, pageError, businessError]);

  if (contentType === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl mx-auto p-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (contentType === 'cms') {
    return <CMSPage />;
  }

  if (contentType === 'business') {
    return <BusinessDetail preloadedBusiness={business} />;
  }

  return <NotFound />;
}