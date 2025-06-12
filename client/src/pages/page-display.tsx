import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEOHead from "@/components/SEOHead";
import type { Page } from "@shared/schema";

export default function PageDisplay() {
  const [match, params] = useRoute("/pages/:slug");
  const slug = params?.slug;

  const { data: page, isLoading, error } = useQuery<Page>({
    queryKey: [`/api/pages/${slug}`],
    enabled: !!slug,
    queryFn: async () => {
      const response = await fetch(`/api/pages/${slug}`);
      if (!response.ok) {
        throw new Error('Page not found');
      }
      return response.json();
    }
  });

  // Fetch site settings for SEO
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle>Page Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The page you're looking for doesn't exist or has been removed.
                </p>
                <Link to="/">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={page.title}
        description={page.seoDescription || undefined}
        siteSettings={siteSettings as any}
        pageType="about"
      />
      <Header />
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Page Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">{page.title}</CardTitle>
              {page.seoDescription && (
                <p className="text-lg text-muted-foreground">{page.seoDescription}</p>
              )}
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content || '' }}
              />
            </CardContent>
          </Card>

          {/* Page Meta Info */}
          <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
            <p>Published: {new Date(page.createdAt).toLocaleDateString()}</p>
            {page.updatedAt && page.updatedAt !== page.createdAt && (
              <p>Last updated: {new Date(page.updatedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}