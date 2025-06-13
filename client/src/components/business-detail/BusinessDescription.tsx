import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessDescriptionProps {
  business: BusinessWithCategory;
}

export function BusinessDescription({ business }: BusinessDescriptionProps) {
  if (!business.description) return null;

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-black">About {business.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-black leading-relaxed">
          {business.description}
        </p>
      </CardContent>
    </Card>
  );
}