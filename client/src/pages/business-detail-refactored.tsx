import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
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

  const { data: similarBusinesses = [] } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses/random", { limit: 6 }],
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
      
      {/* Hero Section */}
      <BusinessHero business={business} heroImage={getHeroImage()} />
      
      {/* Photo Gallery */}
      <BusinessGallery images={getGalleryImages()} businessTitle={business.title || "Business"} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Buttons */}
            <BusinessActions business={business} />
            
            {/* Description */}
            <BusinessDescription business={business} />
            
            {/* Reviews */}
            <BusinessReviews business={business} allReviews={allReviews} />
            
            {/* FAQ */}
            <BusinessFAQ business={business} />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <BusinessContactInfo business={business} />
            
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