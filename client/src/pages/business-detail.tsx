import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PhotoGallery from "@/components/photo-gallery";
import BusinessCarousel from "@/components/BusinessCarousel";
import SEOHead from "@/components/SEOHead";
import BusinessHeader from "@/components/business/BusinessHeader";
import BusinessContactInfo from "@/components/business/BusinessContactInfo";
import BusinessContactForm from "@/components/business-contact-form";
import BusinessDescription from "@/components/business/BusinessDescription";
import BusinessReviews from "@/components/business/BusinessReviews";
import BusinessFAQ from "@/components/business/BusinessFAQ";
import { getAllBusinessPhotos } from "@/components/business/BusinessPhotoUtils";
import type { BusinessWithCategory, Review, User as UserType } from "@shared/schema";

interface BusinessDetailProps {
  preloadedBusiness?: BusinessWithCategory;
}

export default function BusinessDetail(props: BusinessDetailProps = {}) {
  const { preloadedBusiness } = props;
  const { slug } = useParams();
  
  // Use preloaded business if available, otherwise fetch from API
  const { data: fetchedBusiness, isLoading: businessLoading } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/slug/${slug}`],
    enabled: !!slug && !preloadedBusiness,
  });
  
  const business = preloadedBusiness || fetchedBusiness;
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('BusinessDetail Debug:', {
      slug,
      hasPreloaded: !!preloadedBusiness,
      hasFetched: !!fetchedBusiness,
      hasBusiness: !!business,
      businessTitle: business?.title
    });
  }

  const { data: reviews = [], isLoading: reviewsLoading, refetch: refetchReviews } = useQuery<(Review & { user: Pick<UserType, 'firstName' | 'lastName'> })[]>({
    queryKey: [`/api/businesses/${business?.placeid}/reviews`],
    enabled: !!business?.placeid,
  });

  const { data: siteSettings } = useQuery<Record<string, any>>({
    queryKey: ["/api/site-settings"],
  });

  const handlePrint = () => {
    window.print();
  };

  const handleReviewSubmit = () => {
    refetchReviews();
  };

  const handleClaimBusiness = () => {
    // Open claim business modal/flow
    console.log('Claim business clicked');
  };

  const handleShare = () => {
    if (navigator.share && business) {
      navigator.share({
        title: business.title || 'Business',
        text: business.description || 'Check out this business',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleGetDirections = () => {
    if (business?.address && business?.city) {
      const address = encodeURIComponent(`${business.address}, ${business.city}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    }
  };

  if (businessLoading) {
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

  if (!business) {
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

  const allBusinessPhotos = getAllBusinessPhotos(business);

  return (
    <div className="min-h-screen bg-background">
      {business && siteSettings && (
        <SEOHead 
          business={business} 
          siteSettings={siteSettings}
          pageType="business"
        />
      )}
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BusinessHeader 
            business={business} 
            onClaimBusiness={handleClaimBusiness}
            onShare={handleShare}
            onGetDirections={handleGetDirections}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              {allBusinessPhotos.length > 0 && (
                <PhotoGallery 
                  photos={allBusinessPhotos} 
                  businessName={business.title || 'Business'} 
                />
              )}
              
              <BusinessDescription business={business} />
              
              <BusinessReviews 
                business={business}
                reviews={reviews}
                reviewsLoading={reviewsLoading}
                onReviewSubmit={handleReviewSubmit}
              />
              
              <BusinessFAQ business={business} />
            </div>
            
            <div className="space-y-6">
              <BusinessContactInfo business={business} />
              
              <BusinessContactForm 
                businessId={business.placeid}
                businessName={business.title || 'Business'}
              />
            </div>
          </div>
          
          <div className="mt-12">
            <BusinessCarousel 
              currentBusinessId={business.placeid}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}