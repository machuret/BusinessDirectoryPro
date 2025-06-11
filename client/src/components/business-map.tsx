import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ExternalLink } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessMapProps {
  business: BusinessWithCategory;
  className?: string;
}

export default function BusinessMap({ business, className = "" }: BusinessMapProps) {
  const address = business.address || `${business.city}, Australia`;
  const lat = (business as any).latitude ? parseFloat((business as any).latitude.toString()) : null;
  const lng = (business as any).longitude ? parseFloat((business as any).longitude.toString()) : null;

  const handleOpenInMaps = () => {
    const query = encodeURIComponent(address);
    window.open(`https://maps.google.com/maps?q=${query}`, '_blank');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Address</p>
            <p className="font-medium">{address}</p>
            {lat && lng && (
              <p className="text-sm text-gray-500 mt-1">
                Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleOpenInMaps}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Maps
            </button>
          </div>
          
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-600">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Interactive map placeholder</p>
              <p className="text-xs text-gray-500">Click "Open in Maps" for directions</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}