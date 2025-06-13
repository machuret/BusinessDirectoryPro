import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, ExternalLink, Crown } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";
import Header from "@/components/header";

interface BusinessDetailProps {
  preloadedBusiness?: BusinessWithCategory;
}

export default function BusinessDetailSimple({ preloadedBusiness }: BusinessDetailProps) {
  const business = preloadedBusiness;

  console.log('BusinessDetailSimple rendering with business:', business);

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Business not found</h1>
            <p className="text-gray-600 mt-4">The business you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getBusinessImage = () => {
    if (business.imageurl) return business.imageurl;
    if (business.images && Array.isArray(business.images) && business.images.length > 0) {
      return business.images[0];
    }
    if (business.imageurls && Array.isArray(business.imageurls) && business.imageurls.length > 0) {
      return business.imageurls[0];
    }
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format';
  };

  const displayImage = getBusinessImage();
  const isFeatured = business.featured;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className={`overflow-hidden ${
            isFeatured 
              ? "ring-2 ring-yellow-400 shadow-yellow-100 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white" 
              : ""
          }`}>
            
            {/* Featured Banner */}
            {isFeatured && (
              <div className="bg-gradient-to-r from-yellow-400 to-amber-400 px-4 py-3 flex items-center justify-center">
                <Crown className="w-5 h-5 text-yellow-900 mr-2" />
                <span className="text-yellow-900 font-bold text-lg">FEATURED BUSINESS</span>
              </div>
            )}

            {/* Business Image */}
            <div className="relative h-64 md:h-80">
              <img
                src={displayImage}
                alt={business.title || 'Business'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&auto=format';
                }}
              />
              {isFeatured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-400 text-yellow-900 font-bold shadow-lg">
                    <Crown className="w-4 h-4 mr-1" />
                    FEATURED
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-6 md:p-8">
              {/* Business Title and Category */}
              <div className="mb-6">
                <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
                  isFeatured ? "text-yellow-900" : "text-gray-900"
                }`}>
                  {business.title || 'Business Name'}
                </h1>
                
                {business.subtitle && (
                  <p className="text-xl text-gray-600 mb-4">{business.subtitle}</p>
                )}
                
                {business.categoryname && (
                  <Badge variant="secondary" className="text-sm">
                    {business.categoryname}
                  </Badge>
                )}
              </div>

              {/* Rating */}
              {business.totalscore && (
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex">
                    {renderStars(Math.round(business.totalscore))}
                  </div>
                  <span className="text-lg font-medium text-gray-700">
                    {business.totalscore.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({business.totalreviews || 0} reviews)
                  </span>
                </div>
              )}

              {/* Description */}
              {business.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3 text-gray-900">About</h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {business.description}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h3>
                  <div className="space-y-3">
                    {business.phone && (
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 mr-3 text-gray-500" />
                        <a 
                          href={`tel:${business.phone}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {business.phone}
                        </a>
                      </div>
                    )}
                    
                    {business.website && (
                      <div className="flex items-center">
                        <ExternalLink className="w-5 h-5 mr-3 text-gray-500" />
                        <a 
                          href={business.website}
                          target="_blank"
                          rel={isFeatured ? "dofollow" : "nofollow"}
                          className={`hover:underline font-medium ${
                            isFeatured ? "text-yellow-700" : "text-blue-600"
                          }`}
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Location</h3>
                  <div className="space-y-3">
                    {(business.address || business.city || business.state) && (
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 mr-3 text-gray-500 mt-0.5" />
                        <div className="text-gray-700">
                          {business.address && <div>{business.address}</div>}
                          {(business.city || business.state) && (
                            <div>
                              {business.city}{business.city && business.state && ', '}{business.state}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {business.phone && (
                  <Button 
                    size="lg"
                    className={isFeatured ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold" : ""}
                    onClick={() => window.location.href = `tel:${business.phone}`}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                )}
                
                {business.website && (
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => window.open(business.website, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </div>

              {/* Debug Information */}
              <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
                <h4 className="font-semibold mb-2">Debug Info:</h4>
                <p>Place ID: {business.placeid}</p>
                <p>Slug: {business.slug}</p>
                <p>Featured: {business.featured ? 'Yes' : 'No'}</p>
                <p>Has Image: {business.imageurl ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}