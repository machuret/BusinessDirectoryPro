import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, ExternalLink, Crown, Clock } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

export default function BusinessDetailWorking() {
  const { slug } = useParams();

  // Use the same query pattern as featured page
  const { data: business, isLoading, error } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/slug/${slug}`],
  });

  useEffect(() => {
    if (business?.title) {
      document.title = `${business.title} | Business Directory`;
    }
  }, [business?.title]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  // Use same image logic as BusinessCard
  const getBusinessImage = () => {
    if (!business) return '';
    
    if (business.imageurl) return business.imageurl;
    
    if (business.images && Array.isArray(business.images) && business.images.length > 0) {
      return business.images[0];
    }
    
    if (business.imageurls && Array.isArray(business.imageurls) && business.imageurls.length > 0) {
      return business.imageurls[0];
    }
    
    return business.imageurl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <Card>
              <CardHeader>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-48 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-600 mb-4">Business Not Found</h2>
              <p className="text-gray-500">The business you're looking for doesn't exist or has been removed.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const isFeatured = business.featured;
  const displayImage = getBusinessImage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          {/* Hero Image */}
          {displayImage && (
            <div className="relative h-96">
              <img
                src={displayImage}
                alt={business.title || 'Business'}
                className="w-full h-full object-cover"
              />
              {isFeatured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500 text-yellow-900 font-bold">
                    <Crown className="w-4 h-4 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}
            </div>
          )}

          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl font-bold">{business.title}</CardTitle>
                {business.categoryname && (
                  <Badge variant="secondary" className="mt-2">
                    {business.categoryname}
                  </Badge>
                )}
              </div>
            </div>

            {/* Rating */}
            {business.totalscore && (
              <div className="flex items-center space-x-3">
                <div className="flex">
                  {renderStars(Math.round(Number(business.totalscore)))}
                </div>
                <span className="text-lg font-medium text-gray-700">
                  {Number(business.totalscore).toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({business.reviewscount || 0} reviews)
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Description */}
            {business.description && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{business.description}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Location */}
              {(business.address || business.city) && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h4 className="font-medium">Location</h4>
                    <p className="text-gray-600">
                      {business.address && <span>{business.address}<br /></span>}
                      {business.city && business.state && <span>{business.city}, {business.state}</span>}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {business.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-gray-600">{business.phone}</p>
                  </div>
                </div>
              )}
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
                  onClick={() => window.open(business.website!, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}