import { useRoute } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useBusinessListing } from "@/hooks/useBusinessListing";
import { BusinessHeader } from "@/components/business/BusinessHeader";
import { BusinessContent } from "@/components/business/BusinessContent";
import { BusinessInteractions } from "@/components/business/BusinessInteractions";
import SimilarBusinessesCarousel from "@/components/similar-businesses-carousel";
import BusinessMap from "@/components/business-map";
import MoreBusinessesCarousel from "@/components/more-businesses-carousel";
import BusinessContactForm from "@/components/business-contact-form";
import { LoadingState } from "@/components/loading/LoadingState";
import { ErrorState } from "@/components/error/ErrorState";

export default function BusinessListing() {
  const [, params] = useRoute("/:identifier");
  const identifier = params?.identifier;
  
  const {
    business,
    reviews,
    similarBusinesses,
    isLoading,
    showClaimModal,
    setShowClaimModal,
    handleShare,
    handleGetDirections,
    handleClaimBusiness,
  } = useBusinessListing(identifier);

  if (isLoading) {
    return <LoadingState message="Loading business details..." />;
  }

  if (!business) {
    return <ErrorState message="Business not found" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <BusinessHeader
          business={business}
          onClaimBusiness={handleClaimBusiness}
          onShare={handleShare}
          onGetDirections={handleGetDirections}
        />
        
        <BusinessContent business={business} />
        
        <div className="mt-8">
          <BusinessMap business={business} />
        </div>
        
        <div className="mt-8">
          <BusinessContactForm businessId={business.placeid || business.id || ""} />
        </div>
        
        <div className="mt-8">
          <BusinessInteractions
            business={business}
            reviews={reviews}
            showClaimModal={showClaimModal}
            setShowClaimModal={setShowClaimModal}
          />
        </div>
        
        {similarBusinesses.length > 0 && (
          <div className="mt-8">
            <SimilarBusinessesCarousel 
              businessId={business.placeid || business.id || ""}
            />
          </div>
        )}
        
        <div className="mt-8">
          <MoreBusinessesCarousel 
            currentBusinessId={business.placeid || business.id || ""}
            categoryId={business.category?.id}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}