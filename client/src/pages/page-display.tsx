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

  if (isLoading) {
    return (
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
    );
  }

  if (error || !page) {
    return (
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
    );
  }

  return (
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
        <article className="prose prose-lg max-w-none">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {page.title}
            </h1>
            {page.seoDescription && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {page.seoDescription}
              </p>
            )}
          </header>
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content || '' }}
          />
          
          {page.updatedAt && (
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: {new Date(page.updatedAt).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </footer>
          )}
        </article>
      </div>
    </div>
  );
}