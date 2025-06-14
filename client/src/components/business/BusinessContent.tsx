import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Phone, Globe, Mail } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessContentProps {
  business: BusinessWithCategory;
}

export function BusinessContent({ business }: BusinessContentProps) {
  const formatOpeningHours = (hours: unknown) => {
    if (!hours || typeof hours !== 'object') return null;
    
    const hoursObj = hours as Record<string, string>;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map(day => {
      const dayHours = hoursObj[day.toLowerCase()] || hoursObj[day];
      return dayHours ? `${day}: ${dayHours}` : `${day}: Closed`;
    });
  };

  const getImageUrls = (imageurls: unknown): string[] => {
    if (!imageurls) return [];
    
    try {
      if (typeof imageurls === 'string') {
        const parsed = JSON.parse(imageurls);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      }
      if (Array.isArray(imageurls)) {
        return imageurls.filter(Boolean);
      }
    } catch (error) {
      console.warn('Failed to parse image URLs:', error);
    }
    
    return [];
  };

  const images = getImageUrls(business.imageurls);
  const formattedHours = formatOpeningHours(business.openinghours);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description with Photo Gallery */}
        {business.description && (
          <Card>
            <CardHeader>
              <CardTitle>About This Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                {business.description}
              </p>
              
              {/* Photo Gallery at end of About Us */}
              {images.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Photo Gallery</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {images.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image}
                          alt={`${business.title} - Photo ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Amenities */}
        {business.amenities && (
          <Card>
            <CardHeader>
              <CardTitle>Amenities & Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(business.amenities) 
                  ? business.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                      </Badge>
                    ))
                  : typeof business.amenities === 'string' 
                    ? business.amenities.split(',').map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity.trim()}
                        </Badge>
                      ))
                    : null
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {business.phone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-gray-500" />
                <a 
                  href={`tel:${business.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {business.phone}
                </a>
              </div>
            )}
            
            {business.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-gray-500" />
                <a 
                  href={`mailto:${business.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {business.email}
                </a>
              </div>
            )}
            
            {business.website && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-3 text-gray-500" />
                <a 
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opening Hours */}
        {formattedHours && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formattedHours.map((dayHours, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="font-medium">
                      {dayHours.split(':')[0]}
                    </span>
                    <span className="text-gray-600">
                      {dayHours.split(':').slice(1).join(':').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accessibility */}
        {business.accessibility && (
          <Card>
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(business.accessibility)
                  ? business.accessibility.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))
                  : typeof business.accessibility === 'string'
                    ? business.accessibility.split(',').map((feature, index) => (
                        <Badge key={index} variant="outline">
                          {feature.trim()}
                        </Badge>
                      ))
                    : null
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default BusinessContent;