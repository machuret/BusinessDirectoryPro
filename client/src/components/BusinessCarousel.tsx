import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, MapPin, Phone, Globe } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessCarouselProps {
  currentBusinessId: string;
  categoryId?: number;
  city?: string;
  title?: string;
}

export default function BusinessCarousel({ 
  currentBusinessId, 
  categoryId, 
  city, 
  title = "Related Businesses" 
}: BusinessCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: businesses = [], isLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses", { categoryId, city, limit: 12 }],
  });

  // Filter out current business and get related businesses
  const relatedBusinesses = businesses
    .filter(business => business.placeid !== currentBusinessId)
    .slice(0, 8);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (relatedBusinesses.length === 0) {
    return null;
  }

  const itemsPerPage = 4;
  const maxIndex = Math.max(0, Math.ceil(relatedBusinesses.length / itemsPerPage) - 1);
  
  const visibleBusinesses = relatedBusinesses.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const nextSlide = () => {
    setCurrentIndex(prev => prev < maxIndex ? prev + 1 : 0);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : maxIndex);
  };

  const getBusinessImages = (business: BusinessWithCategory) => {
    try {
      const imageurls = business.imageurls;
      if (typeof imageurls === 'string') {
        const parsed = JSON.parse(imageurls);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      }
      return Array.isArray(imageurls) ? imageurls.filter(Boolean) : [];
    } catch {
      return [];
    }
  };

  const formatRating = (business: BusinessWithCategory) => {
    // Check for rating in various possible fields
    const rating = (business as any).averagerating || (business as any).googlerating || (business as any).rating;
    if (!rating) return null;
    const num = typeof rating === 'string' ? parseFloat(rating) : rating;
    return isNaN(num) ? null : num.toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        {relatedBusinesses.length > itemsPerPage && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentIndex === maxIndex}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleBusinesses.map((business) => {
          const images = getBusinessImages(business);
          const rating = formatRating(business);
          
          return (
            <Link key={business.placeid} href={`/${business.slug}`}>
              <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105">
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  {images.length > 0 ? (
                    <img
                      src={images[0]}
                      alt={business.title || "Business"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-muted flex items-center justify-center">
                              <div class="text-center text-muted-foreground">
                                <Globe class="h-8 w-8 mx-auto mb-2" />
                                <p class="text-sm">No Image</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Globe className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">No Image</p>
                      </div>
                    </div>
                  )}
                  
                  {business.featured && (
                    <Badge className="absolute top-2 left-2 bg-primary">
                      Featured
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold line-clamp-1" title={business.title || ""}>
                      {business.title}
                    </h4>
                    
                    {business.category && (
                      <Badge variant="secondary" className="text-xs">
                        {business.category.name}
                      </Badge>
                    )}

                    {business.city && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{business.city}</span>
                      </div>
                    )}

                    {rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{rating}</span>
                        {(business as any).totalreviews && (
                          <span className="text-xs text-muted-foreground">
                            ({(business as any).totalreviews} reviews)
                          </span>
                        )}
                      </div>
                    )}

                    {business.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span className="line-clamp-1">{business.phone}</span>
                      </div>
                    )}

                    {business.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {business.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {relatedBusinesses.length > itemsPerPage && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}