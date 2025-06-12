import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessDescriptionProps {
  business: BusinessWithCategory;
}

export default function BusinessDescription({ business }: BusinessDescriptionProps) {
  if (!business.description) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>About {business.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {business.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}