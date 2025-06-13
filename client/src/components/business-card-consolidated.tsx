import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Phone, Crown, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessCardProps {
  business: BusinessWithCategory;
  variant?: "default" | "enhanced" | "search" | "featured";
  showActions?: boolean;
  showFeaturedBadge?: boolean;
}

export function BusinessCard({ 
  business, 
  variant = "default", 
  showActions = true,
  showFeaturedBadge = true 
}: BusinessCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "fill-yellow-500 text-yellow-500"
            : "text-gray-300"
        }`}
      />
    ));
  };

  // Consolidated image logic
  const getBusinessImage = () => {
    if (business.imageurl) return business.imageurl;
    
    if (business.images && Array.isArray(business.images) && business.images.length > 0) {
      return business.images[0];
    }
    
    if (business.imageurls && Array.isArray(business.imageurls) && business.imageurls.length > 0) {
      return business.imageurls[0];
    }
    
    return business.imageurl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format';
  };

  const displayImage = getBusinessImage();
  const isFeatured = business.featured;
  const isEnhanced = variant === "enhanced" || variant === "featured";
  
  // SEO attributes for featured businesses
  const linkAttributes = isFeatured 
    ? { rel: "dofollow" } 
    : { rel: "nofollow" };

  // Enhanced variant styling
  const cardClasses = `
    overflow-hidden group transition-all duration-200
    ${isEnhanced ? "h-full" : ""}
    ${isFeatured && showFeaturedBadge 
      ? "ring-2 ring-yellow-400 shadow-yellow-100 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white" 
      : "hover:shadow-xl transform hover:-translate-y-1"
    }
    ${variant === "search" && isFeatured ? "order-first" : ""}
  `;

  return (
    <Card className={cardClasses}>
      {/* Featured Banner for Enhanced Variant */}
      {isEnhanced && isFeatured && showFeaturedBadge && (
        <div className="bg-gradient-to-r from-yellow-400 to-amber-400 px-4 py-2 flex items-center justify-center">
          <Crown className="w-4 h-4 text-yellow-900 mr-2" />
          <span className="text-yellow-900 font-semibold text-sm">FEATURED BUSINESS</span>
        </div>
      )}

      <div className="relative">
        <img 
          src={displayImage}
          alt={`${business.title} - ${business.category?.name || 'Business'} located in ${business.address || 'local area'}`}
          className={`w-full object-cover transition-transform duration-200 ${
            isEnhanced ? "h-48" : "h-48 group-hover:scale-105"
          }`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&auto=format`;
          }}
        />
        
        {/* Featured Badge for Default Variant */}
        {!isEnhanced && isFeatured && showFeaturedBadge && (
          <Badge className="absolute top-3 left-3 bg-yellow-500 text-white">
            Featured
          </Badge>
        )}

        {/* Featured Badge for Enhanced Variant */}
        {isEnhanced && isFeatured && showFeaturedBadge && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-yellow-400 text-yellow-900 font-bold shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              FEATURED
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className={isEnhanced ? "flex flex-col h-full" : ""}>
          {/* Business Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <Link href={`/${business.slug || business.placeid}`}>
                <h3 className={`text-xl font-semibold mb-1 line-clamp-1 hover:underline ${
                  isFeatured && isEnhanced ? "text-yellow-900 font-bold" : "text-gray-900"
                }`}>
                  {business.title}
                </h3>
              </Link>
              
              {business.category && (
                <Link href={`/categories/${business.category?.slug || business.categoryname?.toLowerCase().replace(/\s+/g, '-')}`}>
                  <p className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer hover:underline transition-colors">
                    {business.category?.name || business.categoryname}
                  </p>
                </Link>
              )}
            </div>
            
            <div className="flex items-center bg-green-100 px-2 py-1 rounded-full ml-3">
              <Star className="w-4 h-4 text-success mr-1" />
              <span className="text-sm font-medium text-success">
                {parseFloat(business.totalscore || "0").toFixed(1)}
              </span>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {business.description}
          </p>
          
          {/* Location */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="truncate">{business.city}, {business.state}</span>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              {renderStars(Math.round(parseFloat(business.totalscore || "0")))}
              <span className="ml-1">
                ({business.reviewscount || 0} {(business.reviewscount || 0) === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {/* Enhanced Variant Additional Info */}
          {isEnhanced && (
            <div className="space-y-2 mb-4">
              {business.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <a 
                    href={`tel:${business.phone}`}
                    className="hover:underline"
                  >
                    {business.phone}
                  </a>
                </div>
              )}

              {business.website && (
                <div className="flex items-center text-sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <a 
                    href={business.website}
                    target="_blank"
                    rel={isFeatured ? "dofollow" : "nofollow"}
                    className={`hover:underline ${
                      isFeatured ? "text-yellow-700 font-medium" : "text-blue-600"
                    }`}
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          {showActions && (
            <div className={`flex space-x-3 ${isEnhanced ? "mt-auto pt-4 border-t" : ""}`}>
              <Link href={`/${business.slug || business.placeid}`} className="flex-1">
                <Button 
                  className={`w-full ${
                    isFeatured && isEnhanced
                      ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold" 
                      : "bg-primary text-white hover:bg-blue-700"
                  }`}
                  variant={isFeatured && isEnhanced ? "default" : "default"}
                  aria-label={`View details for ${business.title}`}
                >
                  View Details
                  {isFeatured && isEnhanced && <Crown className="w-4 h-4 ml-2" aria-hidden="true" />}
                </Button>
              </Link>
              
              {!isEnhanced && business.phone && (
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`tel:${business.phone}`, '_self')}
                  aria-label={`Call ${business.title} at ${business.phone}`}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Call Business</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Default export for backward compatibility
export default BusinessCard;