import { useParams } from "wouter";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
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
import { BusinessContactForm } from "@/components/business-detail/BusinessContactForm";
import BusinessContactInfo from "@/components/business/BusinessContactInfo";
import type { BusinessWithCategory, Review } from "@shared/schema";

export default function BusinessDetailRefactored() {
  const { businessSlug } = useParams<{ businessSlug: string }>();

  const { 
    data: business, 
    isLoading, 
    error, 
    refetch: refetchBusiness 
  } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/slug/${businessSlug}`],
    enabled: !!businessSlug,
  });

  const { 
    data: reviews = [], 
    error: reviewsError,
    refetch: refetchReviews 
  } = useQuery<Review[]>({
    queryKey: business?.placeid ? [`/api/businesses/${business.placeid}/reviews`] : ['disabled'],
    enabled: !!business?.placeid && !isLoading,
  });

  const { 
    data: similarBusinesses = [], 
    error: similarError,
    refetch: refetchSimilar 
  } = useQuery<BusinessWithCategory[]>({
    queryKey: [`/api/businesses/random?limit=6`],
    enabled: !!business?.placeid && !isLoading,
  });

  const isError = !!error;
  const isNotFound = error?.message?.includes('404') || error?.message?.includes('not found');

  const handleRetry = () => {
    refetchBusiness();
    refetchReviews();
    refetchSimilar();
  };

  // Update page metadata when business data loads
  useEffect(() => {
    if (business) {
      const title = business.seotitle || `${business.title} - Business Directory`;
      const description = business.seodescription || business.description || `Find information about ${business.title} including contact details, reviews, and more.`;
      
      // Update page title
      document.title = title;
      
      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        metaDescription.setAttribute('content', description);
        document.head.appendChild(metaDescription);
      }

      // Update or create Open Graph tags
      const updateMetaTag = (property: string, content: string) => {
        let metaTag = document.querySelector(`meta[property="${property}"]`);
        if (metaTag) {
          metaTag.setAttribute('content', content);
        } else {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('property', property);
          metaTag.setAttribute('content', content);
          document.head.appendChild(metaTag);
        }
      };

      updateMetaTag('og:title', title);
      updateMetaTag('og:description', description);
      updateMetaTag('og:type', 'business.business');
      if (business.imageurl) {
        updateMetaTag('og:image', business.imageurl);
      }
    }
  }, [business]);

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
  
  // Only show review error if there are truly no reviews available from any source
  const hasReviewsFromAnySource = allReviews.length > 0 || (business.reviews && (
    Array.isArray(business.reviews) ? business.reviews.length > 0 : 
    typeof business.reviews === 'object' ? Object.keys(business.reviews as Record<string, any>).length > 0 : false
  ));
  const shouldShowReviewsError = reviewsError && !hasReviewsFromAnySource;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Error alerts for secondary features */}
      {shouldShowReviewsError && (
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
              <BusinessDescription business={business} images={getBusinessImages()} />
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
            
            {/* Contact Form */}
            <SectionErrorBoundary fallbackTitle="Unable to load contact form">
              <BusinessContactForm business={business} />
            </SectionErrorBoundary>
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