import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BusinessContactInfo from "@/components/business/BusinessContactInfo";
import BusinessInteractions from "@/components/business/BusinessInteractions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Share2, Heart, Phone, Globe, Clock, Mail } from "lucide-react";
import type { BusinessWithCategory, Review } from "@shared/schema";

export default function BusinessDetailWorking() {
  const { slug } = useParams<{ slug: string }>();
  const [showClaimModal, setShowClaimModal] = useState(false);

  const { data: business, isLoading, error } = useQuery<BusinessWithCategory>({
    queryKey: ["/api/businesses/slug", slug],
    queryFn: async () => {
      const response = await fetch(`/api/businesses/slug/${slug}`);
      if (!response.ok) {
        throw new Error("Business not found");
      }
      return response.json();
    },
    enabled: !!slug,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/businesses/${business?.placeid}/reviews`],
    enabled: !!business?.placeid,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The business you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={getBusinessImage()}
          alt={business.title || "Business"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{business.title}</h1>
            {business.subtitle && (
              <p className="text-lg md:text-xl text-gray-200">{business.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {business.categoryname && (
                <Badge variant="secondary">{business.categoryname}</Badge>
              )}
              {business.city && (
                <div className="flex items-center gap-1 text-gray-200">
                  <MapPin className="w-4 h-4" />
                  {business.city}
                </div>
              )}
              {business.totalscore && typeof business.totalscore === 'number' && (
                <div className="flex items-center gap-1">
                  {renderStars(business.totalscore)}
                  <span className="ml-1 text-gray-200">
                    {business.totalscore.toFixed(1)}
                    {business.reviewscount && ` (${business.reviewscount} reviews)`}
                  </span>
                </div>
              )}
              {business.featured && (
                <Badge variant="default">Featured</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
              {business.phone && (
                <Button size="lg" asChild>
                  <a href={`tel:${business.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </a>
                </Button>
              )}
              {business.website && (
                <Button variant="outline" size="lg" asChild>
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel={business.featured ? "noopener noreferrer" : "nofollow noopener noreferrer"}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setShowClaimModal(true)}
              >
                <Heart className="w-4 h-4 mr-2" />
                Claim Business
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Description */}
            {business.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About {business.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {business.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Business Interactions - Reviews, FAQ, etc. */}
            <BusinessInteractions
              business={business}
              reviews={reviews}
              showClaimModal={showClaimModal}
              setShowClaimModal={setShowClaimModal}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <BusinessContactInfo business={business} />

            {/* Photo Gallery */}
            {(business.images || business.imageurls) && (
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {(business.images || business.imageurls || []).slice(0, 4).map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${business.title} - Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}