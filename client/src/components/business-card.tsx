import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Phone, Crown, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessCardProps {
  business: BusinessWithCategory;
}

/**
 * BusinessCard - Displays a business listing in a card format with image, details, and rating
 * 
 * Renders a comprehensive business card showing business image, name, category, location,
 * rating, and key details in an attractive card layout. Supports hover effects and click
 * navigation to business detail pages. Handles image loading with fallback support and
 * displays featured status badges. Optimized for grid layouts and responsive design.
 * 
 * @param business - Business object with category information including images, rating, and location
 * 
 * @returns JSX.Element - A clickable card component with business information and navigation
 * 
 * @example
 * // Basic usage in business grid
 * <BusinessCard business={businessData} />
 * 
 * @example
 * // Usage in featured carousel
 * {featuredBusinesses.map(business => (
 *   <BusinessCard key={business.placeid} business={business} />
 * ))}
 */
export function BusinessCard({ business }: BusinessCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "fill-amber-400 text-amber-400"
            : "text-muted-foreground"
        }`}
        aria-hidden="true"
      />
    ));
  };



  // Use business images in priority order: imageurl, first image from images array
  const getBusinessImage = () => {
    if (business.imageurl) return business.imageurl;
    
    if (business.images && Array.isArray(business.images) && business.images.length > 0) {
      return business.images[0];
    }
    
    if (business.imageurls && Array.isArray(business.imageurls) && business.imageurls.length > 0) {
      return business.imageurls[0];
    }
    
    // All businesses now have authentic images, so this should not be reached
    return business.imageurl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format';
  };

  const displayImage = getBusinessImage();

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
      <div className="relative">
        <img 
          src={displayImage}
          alt={business.title || 'Business'}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&auto=format`;
          }}
        />
        {business.featured && (
          <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-amber-600">
            <Crown className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}

      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground mb-1 line-clamp-1">
              {business.title}
            </h3>
            <Link href={`/categories/${business.category?.slug || business.categoryname?.toLowerCase().replace(/\s+/g, '-')}`}>
              <p className="text-primary hover:text-primary/80 text-sm cursor-pointer hover:underline transition-colors">
                {business.category?.name || business.categoryname}
              </p>
            </Link>
          </div>
          <div className="flex items-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full ml-3">
            <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-1" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {parseFloat(business.totalscore || "0").toFixed(1)}
            </span>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {business.description}
        </p>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate">{business.city}, {business.state}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1" role="img" aria-label={`Rating: ${Math.round(parseFloat(business.totalscore || "0"))} out of 5 stars`}>
            {renderStars(Math.round(parseFloat(business.totalscore || "0")))}
            <span className="ml-1 sr-only">Rating:</span>
            <span className="ml-1">
              ({business.reviewscount || 0} {(business.reviewscount || 0) === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link href={`/businesses/${business.slug || business.placeid}`} className="flex-1">
            <Button className="w-full bg-primary text-white hover:bg-blue-700">
              View Details
            </Button>
          </Link>
          {business.phone && (
            <Button 
              variant="outline"
              size="icon"
              onClick={() => window.open(`tel:${business.phone}`, '_self')}
            >
              <Phone className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Default export for compatibility
export default BusinessCard;
