import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Mail,
  Navigation,
  Heart,
  Share2,
  User
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import type { BusinessWithCategory, Review, InsertReview } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SimilarBusinessesCarousel from "@/components/similar-businesses-carousel";
import BusinessMap from "@/components/business-map";
import MoreBusinessesCarousel from "@/components/more-businesses-carousel";
import BusinessContactForm from "@/components/business-contact-form";
import BusinessReviewForm from "@/components/BusinessReviewForm";
import ClaimBusinessModal from "@/components/ClaimBusinessModal";
import BusinessFAQ from "@/components/BusinessFAQ";

export default function BusinessListing() {
  const [, params] = useRoute("/business/:identifier");
  const identifier = params?.identifier;
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for modal visibility
  const [showClaimModal, setShowClaimModal] = useState(false);

  // All useQuery hooks
  const { data: business, isLoading } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/${identifier}`],
    enabled: !!identifier,
  });

  // Update document title and meta tags for SEO
  useEffect(() => {
    if (business) {
      const title = business.seotitle || `${business.title} - ${business.city} | Business Directory`;
      const description = business.seodescription || `Visit ${business.title} in ${business.city}. Get directions, hours, and reviews.`;
      
      document.title = title;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
      
      // Update Open Graph tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', title);
      
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', description);
      
      // Update canonical URL
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `${window.location.origin}/business/${business.slug || business.placeid}`);
    }
  }, [business]);

  // All useMemo hooks
  const importedReviews = useMemo(() => {
    if (!business?.reviews) return [];
    try {
      const parsedReviews = typeof business.reviews === 'string' 
        ? JSON.parse(business.reviews) 
        : business.reviews;
      return Array.isArray(parsedReviews) ? parsedReviews : [];
    } catch (error) {
      console.error('Error parsing reviews:', error);
      return [];
    }
  }, [business?.reviews]);

  const displayImages = useMemo(() => {
    if (!business) return [];
    
    // Try images field first (JSON array)
    if (business.images) {
      try {
        const images = typeof business.images === 'string' ? JSON.parse(business.images) : business.images;
        if (Array.isArray(images) && images.length > 0) return images;
      } catch (e) {}
    }
    
    // Try imageurls field
    if (business.imageurls) {
      try {
        const imageUrls = typeof business.imageurls === 'string' ? JSON.parse(business.imageurls) : business.imageurls;
        if (Array.isArray(imageUrls) && imageUrls.length > 0) return imageUrls;
      } catch (e) {}
    }
    
    // Fallback to single imageurl
    if (business.imageurl) {
      return [business.imageurl];
    }
    
    return [];
  }, [business?.images, business?.imageurls, business?.imageurl]);

  const heroImage = useMemo(() => {
    return displayImages.length > 0 
      ? displayImages[0] 
      : `https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop&auto=format`;
  }, [displayImages]);

  const faqItems = useMemo(() => {
    if (!business?.faq) return [];
    try {
      return typeof business.faq === 'string' ? JSON.parse(business.faq) : business.faq;
    } catch {
      return [];
    }
  }, [business?.faq]);

  const hoursData = useMemo(() => {
    if (!business?.openinghours || typeof business.openinghours !== 'object') return null;
    
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return dayNames.map(day => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      hours: business.openinghours[day] || 'Closed'
    }));
  }, [business?.openinghours]);

  // All useMutation hooks
  const reviewMutation = useMutation({
    mutationFn: async (reviewData: InsertReview) => {
      const res = await apiRequest("POST", `/api/businesses/${business?.placeid}/reviews`, reviewData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses", business?.placeid, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses", business?.placeid] });
      setReviewText("");
      setRating(5);
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const claimOwnershipMutation = useMutation({
    mutationFn: async (claimData: { businessId: string; message: string }) => {
      const res = await apiRequest("POST", "/api/ownership-claims", claimData);
      return await res.json();
    },
    onSuccess: () => {
      setShowClaimModal(false);
      setClaimMessage("");
      toast({
        title: "Claim submitted",
        description: "Your ownership claim has been submitted for admin review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: "Review required",
        description: "Please write a review",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({
      businessId: business?.placeid || "",
      userId: user.id,
      rating,
      comment: reviewText,
    });
  };

  const handleClaimSubmit = () => {
    if (!claimMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please provide a message explaining your claim.",
        variant: "destructive",
      });
      return;
    }
    claimOwnershipMutation.mutate({
      businessId: business?.placeid || "",
      message: claimMessage,
    });
  };

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200" />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
            <p className="text-gray-600 mb-8">The business you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={heroImage}
          alt={business.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop&auto=format`;
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">{business.title}</h1>
            <div className="flex items-center space-x-4 text-lg">
              <div className="flex items-center">
                {renderStars(Math.round(parseFloat(business.totalscore || "0")))}
                <span className="ml-2">{parseFloat(business.totalscore || "0").toFixed(1)}</span>
                <span className="ml-1">({business.reviewscount || 0} reviews)</span>
              </div>
              <span>•</span>
              <Link href={`/categories/${business.category?.slug || business.categoryname?.toLowerCase().replace(/\s+/g, '-')}`}>
                <span className="text-blue-300 hover:text-blue-100 cursor-pointer hover:underline transition-colors">
                  {business.category?.name || business.categoryname}
                </span>
              </Link>
              {business.city && (
                <>
                  <span>•</span>
                  <Link href={`/cities/${encodeURIComponent(business.city)}`}>
                    <span className="text-blue-300 hover:text-blue-100 cursor-pointer hover:underline transition-colors flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {business.city}
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Business</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {business.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            {/* Additional Images Section */}
            {business.images && Array.isArray(business.images) && business.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {business.images.slice(0, 6).map((image: string, index: number) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={image}
                          alt={`${business.title} - Photo ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {business.images.length > 6 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      +{business.images.length - 6} more photos
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* FAQ Section */}
            <BusinessFAQ faqItems={faqItems} />

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {importedReviews.slice(0, 5).map((review: any, index: number) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center mb-1">
                            {renderStars(review.rating || 5)}
                          </div>
                          <p className="font-medium">{review.name || review.reviewerName || 'Anonymous'}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {(() => {
                            const dateValue = review.publishAt || review.publishedAtDate || review.createdAt;
                            if (dateValue) {
                              try {
                                const date = new Date(dateValue);
                                return isNaN(date.getTime()) ? 'Recent' : date.toLocaleDateString();
                              } catch {
                                return 'Recent';
                              }
                            }
                            return 'Recent';
                          })()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.text || review.comment}</p>
                    </div>
                  ))}
                  
                  {(!importedReviews || importedReviews.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Write Review Section */}
            <BusinessReviewForm business={business} user={user} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.address && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{business.address}</p>
                      {business.city && (
                        <div className="mt-1">
                          <Link href={`/cities/${encodeURIComponent(business.city)}`}>
                            <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-sm font-medium">
                              View all businesses in {business.city}
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {business.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a 
                        href={`tel:${business.phone}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {business.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a 
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hours of Operation */}
            {hoursData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Hours of Operation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {hoursData.map((day, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{day.day}</span>
                        <span className="text-gray-600">{day.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Embedded Map */}
            <BusinessMap business={business} />

            {/* Action Buttons */}
            <div className="space-y-3">
              {business.address && (
                <Button 
                  className="w-full" 
                  onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(business.address || '')}`, '_blank')}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              )}
              
              <Button variant="outline" className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                Save Business
              </Button>
              
              <Button variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              {user && (
                <Dialog open={showClaimModal} onOpenChange={setShowClaimModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <User className="w-4 h-4 mr-2" />
                      Claim Business
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Claim Business Ownership</DialogTitle>
                      <DialogDescription>
                        Submit a request to claim ownership of this business listing.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Request ownership of "{business?.title}" to manage your business listing.
                      </p>
                      <div>
                        <Label htmlFor="claim-message">Why should you be granted ownership?</Label>
                        <Textarea
                          id="claim-message"
                          placeholder="Please explain your relationship to this business..."
                          value={claimMessage}
                          onChange={(e) => setClaimMessage(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleClaimSubmit}
                          disabled={claimOwnershipMutation.isPending}
                          className="flex-1"
                        >
                          {claimOwnershipMutation.isPending ? "Submitting..." : "Submit Claim"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowClaimModal(false);
                            setClaimMessage("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {/* Business Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{business.reviewscount || 0}</p>
                    <p className="text-sm text-gray-600">Reviews</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{parseFloat(business.totalscore || "0").toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <BusinessContactForm 
              businessId={business.placeid}
              businessName={business.title || 'Business'}
            />
          </div>
        </div>
        
        {/* More Businesses Carousel */}
        {business && (
          <MoreBusinessesCarousel
            currentBusinessId={business.placeid}
            categoryId={business.category?.id}
            city={business.city}
          />
        )}
      </div>
      
      <Footer />
    </div>
  );
}