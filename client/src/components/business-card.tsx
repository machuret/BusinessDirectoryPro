import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Phone } from "lucide-react";
import { Link } from "wouter";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessCardProps {
  business: BusinessWithCategory;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const formatHours = (hours: any) => {
    if (!hours || typeof hours !== 'object') return "Hours not available";
    
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayHours = hours[dayNames[today]];
    
    if (todayHours === 'closed') return "Closed today";
    if (todayHours) return `Open until ${todayHours.split('-')[1] || todayHours}`;
    return "Hours not available";
  };

  const displayImage = business.imageurl || `https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&auto=format`;

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
          <Badge className="absolute top-3 left-3 bg-yellow-500 text-white">
            Featured
          </Badge>
        )}
        {business.verified && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white">
            Verified
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">
              {business.title}
            </h3>
            <p className="text-gray-600 text-sm">{business.category?.name || business.categoryname}</p>
          </div>
          <div className="flex items-center bg-green-100 px-2 py-1 rounded-full ml-3">
            <Star className="w-4 h-4 text-success mr-1" />
            <span className="text-sm font-medium text-success">
              {parseFloat(business.totalscore || "0").toFixed(1)}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {business.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate">{business.city}, {business.state}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span className="truncate">{formatHours(business.openinghours)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            {renderStars(Math.round(parseFloat(business.totalscore || "0")))}
            <span className="ml-1">
              ({business.reviewscount || 0} {(business.reviewscount || 0) === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link href={`/business/${business.placeid}`} className="flex-1">
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
