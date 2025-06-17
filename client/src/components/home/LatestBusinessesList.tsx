import { useApiQuery } from "@/hooks/useApiQuery";
import { useContent } from "@/contexts/ContentContext";
import { BusinessCard } from "@/components/business-card-consolidated";
import BusinessCardSkeleton from "@/components/business-card-skeleton";
import { Button } from "@/components/ui/button";
import type { BusinessWithCategory } from "@shared/schema";

interface LatestBusinessesListProps {
  siteSettings?: Record<string, any>;
}

export default function LatestBusinessesList({ siteSettings }: LatestBusinessesListProps) {
  const { t } = useContent();
  
  const { 
    data: randomBusinesses, 
    isLoading: randomLoading 
  } = useApiQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses/random", { limit: 9 }],
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("homepage.latest.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("homepage.latest.subtitle")}
          </p>
        </div>
        
        {randomLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <BusinessCardSkeleton 
              count={9} 
              variant="carousel"
              className="transition-all duration-300"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {randomBusinesses?.map((business) => (
              <BusinessCard key={business.placeid} business={business} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => window.location.href = siteSettings?.homepage_random_button_url || "/businesses"}
          >
            {t("homepage.latest.button")}
          </Button>
        </div>
      </div>
    </section>
  );
}