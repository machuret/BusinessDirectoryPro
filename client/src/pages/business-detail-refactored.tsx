import { useParams } from "wouter";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApiQuery } from "@/hooks/useApiQuery";
import { SectionErrorBoundary } from "@/components/error/SectionErrorBoundary";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BusinessCard from "@/components/business-card";
import { BusinessHero } from "@/components/business-detail/BusinessHero";
import { BusinessGallery } from "@/components/business-detail/BusinessGallery";
import { BusinessActions } from "@/components/business-detail/BusinessActions";
import { BusinessDescription } from "@/components/business-detail/BusinessDescription";
import { BusinessReviews } from "@/components/business-detail/BusinessReviews";
import { BusinessFAQ } from "@/components/business-detail/BusinessFAQ";
import { BusinessHours } from "@/components/business-detail/BusinessHours";
import BusinessContactInfo from "@/components/business/BusinessContactInfo";
import type { BusinessWithCategory, Review } from "@shared/schema";

export default function BusinessDetailRefactored() {
  const { slug } = useParams<{ slug: string }>();

  const { 
    data: business, 
    isLoading, 
    isError, 
    isNotFound, 
    error, 
    refetch: refetchBusiness 
  } = useApiQuery<BusinessWithCategory>({
    queryKey: ["/api/businesses/slug", slug],
    enabled: !!slug,
  });

  const { 
    data: reviews = [], 
    isError: reviewsError,
    refetch: refetchReviews 
  } = useApiQuery<Review[]>({
    queryKey: [`/api/businesses/${business?.placeid}/reviews`],
    enabled: !!business?.placeid,
  });

  const { 
    data: similarBusinesses = [], 
    isError: similarError,
    refetch: refetchSimilar 
  } = useApiQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses/random", { limit: 6 }],
    enabled: !!business?.placeid,
  });

  const handleRetry = () => {
    refetchBusiness();
    refetchReviews();
    refetchSimilar();
  };

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

  if (isNotFound) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The business you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Unable to Load Business</h1>
            <p className="text-muted-foreground mb-6">
              {error?.message || "There was a problem loading this business. Please try again."}
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={handleRetry} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => window.history.back()} variant="outline">
                Go Back
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Available</h1>
            <p className="text-muted-foreground mb-6">
              This business is currently not available for viewing.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getBusinessImages = () => {
    const images = [];
    if (business.imageurl) images.push(business.imageurl);
    if (business.images && Array.isArray(business.images)) {
      images.push(...business.images);
    }
    if (business.imageurls && Array.isArray(business.imageurls)) {
      images.push(...business.imageurls);
    }
    return images.filter((img, index, arr) => arr.indexOf(img) === index); // Remove duplicates
  };

  const getHeroImage = () => {
    const images = getBusinessImages();
    return images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format';
  };

  const getGalleryImages = () => {
    const images = getBusinessImages();
    return images.slice(1, 4); // Get images 2, 3, 4 (skip the first one used in hero)
  };

  // Parse reviews from business data
  const parseBusinessReviews = () => {
    const allReviews = [...reviews];
    
    // Add reviews from business.reviews field if it exists
    if (business.reviews) {
      try {
        let businessReviews = [];
        if (typeof business.reviews === 'string') {
          businessReviews = JSON.parse(business.reviews);
        } else if (Array.isArray(business.reviews)) {
          businessReviews = business.reviews;
        }
        
        if (Array.isArray(businessReviews)) {
          allReviews.push(...businessReviews);
        }
      } catch (e) {
        console.error('Error parsing business reviews:', e);
      }
    }
    
    return allReviews;
  };

  const allReviews = parseBusinessReviews();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Error alerts for secondary features */}
      {reviewsError && (
        <Alert className="mx-4 mt-4" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load reviews. Some content may be missing.
          </AlertDescription>
        </Alert>
      )}
      
      {similarError && (
        <Alert className="mx-4 mt-4" variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load similar businesses.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Hero Section */}
      <SectionErrorBoundary fallbackTitle="Unable to load business header">
        <BusinessHero business={business} heroImage={getHeroImage()} />
      </SectionErrorBoundary>
      
      {/* Photo Gallery */}
      <SectionErrorBoundary fallbackTitle="Unable to load photo gallery">
        <BusinessGallery images={getGalleryImages()} businessTitle={business.title || "Business"} />
      </SectionErrorBoundary>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Buttons */}
            <SectionErrorBoundary fallbackTitle="Unable to load business actions">
              <BusinessActions business={business} />
            </SectionErrorBoundary>
            
            {/* Description */}
            <SectionErrorBoundary fallbackTitle="Unable to load business description">
              <BusinessDescription business={business} />
            </SectionErrorBoundary>
            
            {/* Reviews */}
            <SectionErrorBoundary fallbackTitle="Unable to load reviews section">
              <BusinessReviews business={business} allReviews={allReviews} />
            </SectionErrorBoundary>
            
            {/* FAQ */}
            <SectionErrorBoundary fallbackTitle="Unable to load FAQ section">
              <BusinessFAQ business={business} />
            </SectionErrorBoundary>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <SectionErrorBoundary fallbackTitle="Unable to load contact information">
              <BusinessContactInfo business={business} />
            </SectionErrorBoundary>
            
            {/* Business Hours */}
            <BusinessHours business={business} />
          </div>
        </div>
      </div>
      
      {/* Similar Businesses */}
      {similarBusinesses.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-black mb-8 text-center">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarBusinesses.slice(0, 6).map((similarBusiness) => (
                <BusinessCard 
                  key={similarBusiness.placeid} 
                  business={similarBusiness} 
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}