import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";
import { Link } from "wouter";
import BusinessCardSkeleton from "@/components/business-card-skeleton";
import type { BusinessWithCategory } from "@shared/schema";

interface MoreBusinessesCarouselProps {
  currentBusinessId: string;
  categoryId?: number;
  city?: string;
}

export default function MoreBusinessesCarousel({ 
  currentBusinessId, 
  categoryId, 
  city 
}: MoreBusinessesCarouselProps) {
  const { data: businesses, isLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses", { categoryId, city, exclude: currentBusinessId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId.toString());
      if (city) params.append('city', city);
      params.append('limit', '8');
      
      const response = await fetch(`/api/businesses?${params}`);
      if (!response.ok) throw new Error('Failed to fetch businesses');
      const data = await response.json();
      
      // Exclude current business
      return data.filter((business: BusinessWithCategory) => business.placeid !== currentBusinessId);
    },
    enabled: !!currentBusinessId
  });

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          More {categoryId ? 'Similar' : ''} Businesses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <BusinessCardSkeleton 
            count={4} 
            variant="carousel"
            className="transition-all duration-300"
          />
        </div>
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return null;
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          More businesses in {categoryId ? 'this category' : city}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businesses.slice(0, 4).map((business) => (
            <Link key={business.placeid} href={`/businesses/${business.slug || business.placeid}`}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  {business.imageurl ? (
                    <img
                      src={business.imageurl}
                      alt={business.title || 'Business image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(business.title || 'Business')}&background=e5e7eb&color=6b7280&size=400`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {business.title}
                  </h3>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-2">
                      {renderStars(parseFloat(business.totalscore || "0"))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({business.reviewscount || 0})
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">{business.city}</span>
                  </div>
                  
                  {business.category && (
                    <div className="text-sm text-blue-600 font-medium">
                      {business.category.name}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}