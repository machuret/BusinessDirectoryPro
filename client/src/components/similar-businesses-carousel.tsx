import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BusinessCard from "@/components/business-card";
import { BusinessCardSkeleton } from "@/components/business-card-skeleton";
import { useApiQuery } from "@/hooks/useApiQuery";
import type { BusinessWithCategory } from "@shared/schema";

interface SimilarBusinessesCarouselProps {
  currentBusinessId: string;
  categoryId?: number;
  city?: string;
  className?: string;
}

export default function SimilarBusinessesCarousel({ 
  currentBusinessId, 
  categoryId, 
  city, 
  className = "" 
}: SimilarBusinessesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch similar businesses based on category and city
  const { 
    data: similarBusinesses, 
    isLoading, 
    isError, 
    isNotFound, 
    refetch 
  } = useApiQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses", { categoryId, city, exclude: currentBusinessId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId.toString());
      if (city) params.append('city', city);
      params.append('limit', '12'); // Get more businesses for carousel
      
      const response = await fetch(`/api/businesses?${params}`);
      if (!response.ok) throw new Error('Failed to fetch similar businesses');
      const businesses = await response.json();
      
      // Filter out the current business
      return businesses.filter((business: BusinessWithCategory) => 
        business.placeid !== currentBusinessId
      );
    },
    customErrorMessage: "Unable to load similar businesses at the moment.",
    showErrorToast: false, // We'll handle error display inline
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Similar Businesses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <BusinessCardSkeleton count={3} variant="compact" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error states with fallback UI
  if (isError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Similar Businesses</h3>
            <p className="text-gray-600 mb-4">
              We're having trouble loading similar businesses at the moment.
            </p>
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              className="gap-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!similarBusinesses || similarBusinesses.length === 0) {
    return null; // Don't show the carousel if no similar businesses
  }

  const itemsPerPage = 3;
  const totalPages = Math.ceil(similarBusinesses.length / itemsPerPage);
  const startIndex = currentIndex * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBusinesses = similarBusinesses.slice(startIndex, endIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Similar Businesses</h3>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                disabled={totalPages <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={totalPages <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <BusinessCardSkeleton 
              count={3} 
              variant="carousel"
              className="transition-all duration-300"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentBusinesses.map((business) => (
              <div key={business.placeid} className="h-full">
                <BusinessCard business={business} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}