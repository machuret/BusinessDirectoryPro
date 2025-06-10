import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  ChevronDown,
  ChevronUp,
  User
} from "lucide-react";
import { useState, useMemo } from "react";
import type { BusinessWithCategory, Review, InsertReview } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function BusinessListing() {
  const [, params] = useRoute("/business/:placeid");
  const placeid = params?.placeid;
  const { user } = useAuth();
  const { toast } = useToast();
  
  // All useState hooks at the top level
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");

  // All useQuery hooks
  const { data: business, isLoading } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/${placeid}`],
    enabled: !!placeid,
  });

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
      const res = await apiRequest("POST", `/api/businesses/${placeid}/reviews`, reviewData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses", placeid, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses", placeid] });
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
              <span>{business.category?.name || business.categoryname}</span>
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

            {/* FAQ Section */}
            {faqItems && faqItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqItems.map((faq: any, index: number) => (
                      <div key={index} className="border-b border-gray-200 pb-4">
                        <button
                          className="flex items-center justify-between w-full text-left font-medium"
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        >
                          <span>{faq.question}</span>
                          {expandedFaq === index ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        {expandedFaq === index && (
                          <p className="mt-2 text-gray-600">{faq.answer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                          {review.publishAt || review.publishedAtDate ? new Date(review.publishAt || review.publishedAtDate).toLocaleDateString() : 'Recent'}
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
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <div className="flex items-center space-x-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="review">Your Review</Label>
                      <Textarea
                        id="review"
                        placeholder="Share your experience..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" disabled={reviewMutation.isPending}>
                      {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
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
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}