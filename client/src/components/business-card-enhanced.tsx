import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Phone, Crown, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessCardProps {
  business: BusinessWithCategory;
  variant?: "default" | "search" | "featured";
}

export default function BusinessCardEnhanced({ business, variant = "default" }: BusinessCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const isFeatured = business.featured;
  
  // SEO link attributes based on featured status
  const linkAttributes = isFeatured 
    ? { rel: "dofollow" } 
    : { rel: "nofollow" };

  return (
    <Card className={`h-full hover:shadow-lg transition-all duration-300 ${
      isFeatured 
        ? "ring-2 ring-yellow-400 shadow-yellow-100 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white" 
        : "hover:shadow-md"
    } ${variant === "search" && isFeatured ? "order-first" : ""}`}>
      
      {/* Featured Banner */}
      {isFeatured && (
        <div className="bg-gradient-to-r from-yellow-400 to-amber-400 px-4 py-2 flex items-center justify-center">
          <Crown className="w-4 h-4 text-yellow-900 mr-2" />
          <span className="text-yellow-900 font-semibold text-sm">FEATURED BUSINESS</span>
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          {/* Business Image */}
          <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100 h-48">
            {business.imageurl ? (
              <img
                src={business.imageurl}
                alt={business.title}
                className="w-full h-full object-cover"
              />
            ) : null}
            <div className="placeholder flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-2xl mb-2">🏢</div>
                <div className="text-sm">No image available</div>
              </div>
            </div>
            
            {/* Featured overlay badge */}
            {isFeatured && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-yellow-400 text-yellow-900 font-bold shadow-lg">
                  <Crown className="w-3 h-3 mr-1" />
                  FEATURED
                </Badge>
              </div>
            )}
          </div>

          {/* Business Info */}
          <div className="flex-1 space-y-3">
            <div>
              <Link 
                to={`/businesses/${business.slug || business.placeid}`}
                className={`block hover:underline ${
                  isFeatured ? "text-yellow-900 font-bold" : "text-gray-900"
                }`}
                {...linkAttributes}
              >
                <h3 className="text-lg font-semibold line-clamp-2">
                  {business.title}
                </h3>
              </Link>
              
              {business.category && (
                <Badge variant="secondary" className="mt-1">
                  {business.category.name}
                </Badge>
              )}
            </div>

            {/* Rating */}
            {business.averagerating && (
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {renderStars(Math.round(business.averagerating))}
                </div>
                <span className="text-sm text-gray-600">
                  {business.averagerating.toFixed(1)} ({business.totalreviews || 0} reviews)
                </span>
              </div>
            )}

            {/* Location */}
            {business.city && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{business.city}</span>
              </div>
            )}

            {/* Description */}
            {business.description && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {business.description}
              </p>
            )}

            {/* Contact Info */}
            <div className="space-y-2">
              {business.phonenumber && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <a 
                    href={`tel:${business.phonenumber}`}
                    className="hover:underline"
                  >
                    {business.phonenumber}
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


          </div>

          {/* Action Button */}
          <div className="mt-4 pt-4 border-t">
            <Link to={`/${business.slug || business.placeid}`}>
              <Button 
                className={`w-full ${
                  isFeatured 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold" 
                    : ""
                }`}
                variant={isFeatured ? "default" : "outline"}
              >
                View Details
                {isFeatured && <Crown className="w-4 h-4 ml-2" />}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}