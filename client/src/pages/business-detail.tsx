import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PhotoGallery from "@/components/photo-gallery";
import BusinessCarousel from "@/components/BusinessCarousel";
import SEOHead from "@/components/SEOHead";
import BusinessHeader from "@/components/business/BusinessHeader";
import BusinessContactInfo from "@/components/business/BusinessContactInfo";
import BusinessDescription from "@/components/business/BusinessDescription";
import BusinessReviews from "@/components/business/BusinessReviews";
import { getAllBusinessPhotos } from "@/components/business/BusinessPhotoUtils";
import type { BusinessWithCategory, Review, User as UserType } from "@shared/schema";

export default function BusinessDetail() {
  const { slug } = useParams();
  
  const { data: business, isLoading: businessLoading } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/slug/${slug}`],
    enabled: !!slug,
  });

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
      <SEOHead 
        business={business} 
        siteSettings={siteSettings} 
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BusinessHeader business={business} onPrint={handlePrint} />
          
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
            </div>
            
            <div className="space-y-6">
              <BusinessContactInfo business={business} />
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