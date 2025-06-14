import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessDescriptionProps {
  business: BusinessWithCategory;
  images?: string[];
}

export function BusinessDescription({ business, images = [] }: BusinessDescriptionProps) {
  if (!business.description) return null;

  const getBusinessImages = () => {
    const allImages = [];
    if (business.imageurl) allImages.push(business.imageurl);
    if (business.images && Array.isArray(business.images)) {
      allImages.push(...business.images);
    }
    if (business.imageurls && Array.isArray(business.imageurls)) {
      allImages.push(...business.imageurls);
    }
    // Use provided images as fallback
    if (images.length > 0) {
      allImages.push(...images);
    }
    return allImages.filter((img, index, arr) => arr.indexOf(img) === index); // Remove duplicates
  };

  // Get all images and skip the first one (used as hero), then limit to 4
  const allImages = getBusinessImages();
  const displayImages = allImages.slice(1, 5); // Skip first image, show next 4

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-black">About {business.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-black leading-relaxed">
          {business.description}
        </p>
        
        {/* Photo Gallery */}
        {displayImages.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3 text-black">Photo Gallery</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayImages.map((image, index) => (
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
  );
}