import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart, Share2, Navigation } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessHeaderProps {
  business: BusinessWithCategory;
  onClaimBusiness: () => void;
  onShare: () => void;
  onGetDirections: () => void;
}

export function BusinessHeader({ 
  business, 
  onClaimBusiness, 
  onShare, 
  onGetDirections 
}: BusinessHeaderProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{business.title}</h1>
            {business.featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Featured
              </Badge>
            )}
          </div>
          
          {business.category && (
            <Badge variant="outline" className="mb-3">
              {business.category.name}
            </Badge>
          )}
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {renderStars(parseFloat(business.totalscore || '0'))}
              <span className="text-sm text-gray-600 ml-1">
                ({business.totalscore ? parseFloat(business.totalscore).toFixed(1) : 'No rating'})
              </span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{business.address}, {business.city}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={onGetDirections}>
            <Navigation className="w-4 h-4 mr-2" />
            Directions
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={onClaimBusiness} className="bg-blue-600 hover:bg-blue-700">
            Claim Business
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BusinessHeader;