import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart, Share2, Navigation } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";
import { useContent } from "@/contexts/ContentContext";

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
  const { t } = useContent();
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
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
                {t('business.header.featured')}
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
                ({business.totalscore ? parseFloat(business.totalscore).toFixed(1) : t('business.header.noRating')})
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
            {t('business.header.directions')}
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="w-4 h-4 mr-2" />
            {t('business.header.share')}
          </Button>
          <Button variant="outline" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            {t('business.header.save')}
          </Button>
          <Button onClick={onClaimBusiness} className="bg-blue-600 hover:bg-blue-700">
            {t('business.header.claimBusiness')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BusinessHeader;