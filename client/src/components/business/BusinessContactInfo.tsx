import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Globe, MapPin, Building2, Tag } from "lucide-react";
import { Link } from "wouter";
import { useContent } from "@/contexts/ContentContext";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessContactInfoProps {
  business: BusinessWithCategory;
}

export default function BusinessContactInfo({ business }: BusinessContactInfoProps) {
  const { t } = useContent();

  const handleCallClick = () => {
    if (business.phone) {
      window.open(`tel:${business.phone}`);
    }
  };

  const getWebsiteLinkProps = () => {
    if (!business.website) return {};
    
    // Featured businesses get dofollow links, non-featured get nofollow
    const rel = business.featured ? "noopener noreferrer" : "nofollow noopener noreferrer";
    
    return {
      href: business.website,
      target: "_blank",
      rel: rel
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>{t('business.contact.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {business.categoryname && (
          <div className="flex items-start space-x-3">
            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{t('business.contact.category')}</p>
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
              <p className="font-medium">{t('business.contact.phone')}</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{business.phone}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCallClick}
                  className="h-7 px-2 text-xs"
                >
                  {t('business.contact.call')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {business.website && (
          <div className="flex items-start space-x-3">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{t('business.contact.website')}</p>
              <a 
                {...getWebsiteLinkProps()}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 px-2 text-xs"
              >
                Visit Website
              </a>
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
      </CardContent>
    </Card>
  );
}