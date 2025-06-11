import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessMapProps {
  business: BusinessWithCategory;
  className?: string;
}

export default function BusinessMap({ business, className = "" }: BusinessMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const address = business.address || `${business.city}, Australia`;
  const lat = business.latitude ? parseFloat(business.latitude.toString()) : null;
  const lng = business.longitude ? parseFloat(business.longitude.toString()) : null;

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      if (!window.google) {
        // Load Google Maps script if not already loaded
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
        return;
      }

      let mapCenter: google.maps.LatLngLiteral;

      if (lat && lng) {
        mapCenter = { lat, lng };
      } else {
        // Default to Brisbane if no coordinates
        mapCenter = { lat: -27.4698, lng: 153.0251 };
      }

      const map = new google.maps.Map(mapRef.current!, {
        zoom: 15,
        center: mapCenter,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      mapInstanceRef.current = map;

      if (lat && lng) {
        // Use exact coordinates
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: business.title,
          animation: google.maps.Animation.DROP
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${business.title}</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
              ${business.phonenumber ? `<p style="margin: 4px 0 0 0; font-size: 12px;"><strong>Phone:</strong> ${business.phonenumber}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      } else {
        // Geocode the address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            map.setCenter(location);

            const marker = new google.maps.Marker({
              position: location,
              map: map,
              title: business.title,
              animation: google.maps.Animation.DROP
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${business.title}</h3>
                  <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
                  ${business.phonenumber ? `<p style="margin: 4px 0 0 0; font-size: 12px;"><strong>Phone:</strong> ${business.phonenumber}</p>` : ''}
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });
          }
        });
      }
    };

    initMap();
  }, [business, lat, lng, address]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Location</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>{address}</p>
            {business.phonenumber && (
              <p className="mt-1">
                <strong>Phone:</strong> {business.phonenumber}
              </p>
            )}
          </div>
          
          <div 
            ref={mapRef} 
            className="w-full h-64 rounded-lg border border-gray-200"
            style={{ minHeight: '250px' }}
          >
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
              <div className="text-center text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p>Loading map...</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Open in Google Maps
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-md text-sm hover:bg-green-700 transition-colors"
            >
              Get Directions
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}