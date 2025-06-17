import { useApiQuery } from "@/hooks/useApiQuery";
import { useContent } from "@/contexts/ContentContext";
import { BusinessCard } from "@/components/business-card-consolidated";
import BusinessCardSkeleton from "@/components/business-card-skeleton";
import { SectionErrorBoundary } from "@/components/error/SectionErrorBoundary";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

export default function FeaturedBusinessesList() {
  const { t } = useContent();
  
  const { 
    data: featuredBusinesses, 
    isLoading: featuredLoading, 
    error: featuredError, 
    refetch: retryFeatured 
  } = useApiQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses/featured"],
  });

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("homepage.featured.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("homepage.featured.subtitle")}
          </p>
        </div>
        
        <SectionErrorBoundary 
          fallbackTitle={t("homepage.featured.error.title")}
          fallbackMessage={t("homepage.featured.error.message")}
        >
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <BusinessCardSkeleton 
                count={6} 
                variant="default"
                className="transition-all duration-300"
              />
            </div>
          ) : featuredError ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">{t("homepage.featured.error.unable")}</p>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("homepage.featured.error.retry")}
              </Button>
            </div>
          ) : featuredBusinesses && featuredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredBusinesses
                .filter((business, index, array) => 
                  array.findIndex(b => b.placeid === business.placeid) === index
                )
                .map((business, index) => (
                  <BusinessCard key={`featured-${business.placeid}-${index}`} business={business} />
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t("homepage.featured.empty")}</p>
            </div>
          )}
        </SectionErrorBoundary>
      </div>
    </section>
  );
}