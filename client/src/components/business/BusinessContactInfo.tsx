import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Globe, Clock, MapPin, Building2, Tag } from "lucide-react";
import { Link } from "wouter";
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
    if (!hours) return null;
    
    try {
      let parsedHours;
      if (typeof hours === 'string') {
        // Try to parse JSON string first
        try {
          parsedHours = JSON.parse(hours);
        } catch {
          // If not JSON, treat as plain text
          return hours.split('\n').map((line: string, index: number) => (
            <div key={index}>{line.trim()}</div>
          ));
        }
      } else {
        parsedHours = hours;
      }
      
      if (Array.isArray(parsedHours)) {
        return parsedHours.map((hour: any, index: number) => {
          if (typeof hour === 'string') {
            return <div key={index}>{hour}</div>;
          } else if (hour && typeof hour === 'object') {
            const day = hour.day || hour.Day || '';
            const time = hour.hours || hour.Hours || hour.time || hour.Time || '';
            return (
              <div key={index} className="flex justify-between">
                <span>{String(day)}</span>
                <span>{String(time)}</span>
              </div>
            );
          }
          return <div key={index}>{String(hour)}</div>;
        });
      } else if (typeof parsedHours === 'object') {
        // Handle object format
        return Object.entries(parsedHours).map(([day, time], index) => (
          <div key={index} className="flex justify-between">
            <span>{day}</span>
            <span>{String(time)}</span>
          </div>
        ));
      }
      
      return <div>{String(parsedHours)}</div>;
    } catch (error) {
      return <div>{String(hours)}</div>;
    }
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
        {business.categoryname && (
          <div className="flex items-start space-x-3">
            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Category</p>
              <Link href={`/categories/${business.category?.slug || business.categoryname?.toLowerCase().replace(/\s+/g, '-')}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {business.categoryname}
                </Badge>
              </Link>
            </div>
          </div>
        )}

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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleWebsiteClick}
                className="h-7 px-2 text-xs"
              >
                Visit Website
              </Button>
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

        {business.openinghours && (
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