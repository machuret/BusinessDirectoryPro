import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Check } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessDescriptionProps {
  business: BusinessWithCategory;
}

export default function BusinessDescription({ business }: BusinessDescriptionProps) {
  const parseArrayField = (field: any): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const amenities = parseArrayField(business.amenities);
  const accessibility = parseArrayField(business.accessibility);

  return (
    <div className="space-y-6">
      {/* Description */}
      {business.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>About</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {business.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessibility */}
      {accessibility.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {accessibility.map((feature, index) => (
                <Badge key={index} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}