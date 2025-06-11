import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Globe, Clock, MapPin, Building2 } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessContactInfoProps {
  business: BusinessWithCategory;
}

export default function BusinessContactInfo({ business }: BusinessContactInfoProps) {
  const handleCallClick = () => {
    if (business.phone) {
      window.open(`tel:${business.phone}`);
    }
  };

  const handleWebsiteClick = () => {
    if (business.website) {
      window.open(business.website, '_blank');
    }
  };

  const formatOpeningHours = (hours: any) => {
    if (!hours || !Array.isArray(hours)) return null;
    
    return hours.map((hour: any, index: number) => (
      <div key={index} className="flex justify-between">
        <span>{String(hour?.day || '')}</span>
        <span>{String(hour?.hours || '')}</span>
      </div>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Contact Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {business.phone && (
          <div className="flex items-start space-x-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Phone</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{business.phone}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCallClick}
                  className="h-7 px-2 text-xs"
                >
                  Call
                </Button>
              </div>
            </div>
          </div>
        )}

        {business.website && (
          <div className="flex items-start space-x-3">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Website</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-primary cursor-pointer hover:underline" onClick={handleWebsiteClick}>
                  {business.website}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleWebsiteClick}
                  className="h-7 px-2 text-xs"
                >
                  Visit
                </Button>
              </div>
            </div>
          </div>
        )}

        {business.address && (
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-sm text-muted-foreground">{business.address}</p>
            </div>
          </div>
        )}

        {business.openinghours && Array.isArray(business.openinghours) && business.openinghours.length > 0 && (
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Hours</p>
              <div className="text-sm text-muted-foreground space-y-1">
                {formatOpeningHours(business.openinghours)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}