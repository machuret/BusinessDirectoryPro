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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const { data: business, isLoading } = useQuery<BusinessWithCategory>({
    queryKey: ["/api/businesses", placeid],
    enabled: !!placeid,
  });

  // Debug logging
  console.log('Business data:', business);
  console.log('Description:', business?.description);
  console.log('Phone:', business?.phone);
  console.log('Address:', business?.address);
  console.log('Reviews:', business?.reviews);

  // Parse reviews from business JSON data
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
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
          <p className="text-gray-600">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
        onClick={() => interactive && onRate && onRate(i + 1)}
      />
    ));
  };

  const formatHours = (hours: any) => {
    if (!hours || typeof hours !== 'object') return null;
    
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return dayNames.map(day => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      hours: hours[day] || 'Closed'
    }));
  };

  const parseFaq = (faqText: string | null) => {
    if (!faqText) return [];
    try {
      return typeof faqText === 'string' ? JSON.parse(faqText) : faqText;
    } catch {
      return [];
    }
  };

  const displayImages = business.images ? (typeof business.images === 'string' ? JSON.parse(business.images) : business.images) : [];
  const heroImage = Array.isArray(displayImages) && displayImages.length > 0 
    ? displayImages[0] 
    : `https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop&auto=format`;

  const faqItems = parseFaq(business.faq as string);
  const hoursData = formatHours(business.openinghours as string);

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

    reviewMutation.mutate({
      businessId: business.placeid,
      userId: user.id as string,
      rating,
      comment: reviewText,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={heroImage}
          alt={business.title || 'Business'}
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

            {/* Photo Gallery */}
            {displayImages.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {displayImages.slice(1, 7).map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${business.title} - Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQ Section */}
            {faqItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqItems.map((faq: any, index: number) => (
                    <div key={`faq-${index}-${faq.question?.substring(0, 20)}`} className="border rounded-lg">
                      <button
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      >
                        <span className="font-medium">{faq.question}</span>
                        {expandedFaq === index ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-3 text-gray-600">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({importedReviews?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Submit Review Form */}
                {user && (
                  <form onSubmit={handleSubmitReview} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Write a Review</h3>
                    <div className="flex items-center mb-3">
                      <span className="mr-2">Rating:</span>
                      <div className="flex items-center">
                        {renderStars(rating, true, setRating)}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Share your experience..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="mb-3"
                      rows={4}
                    />
                    <Button 
                      type="submit" 
                      disabled={reviewMutation.isPending || !reviewText.trim()}
                    >
                      {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {importedReviews?.map((review: any, index: number) => (
                    <div key={review.reviewId || index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{review.name || 'Anonymous'}</p>
                            <div className="flex items-center">
                              {renderStars(review.stars || review.rating || 5)}
                            </div>
                          </div>
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
                        className="font-medium text-primary hover:underline"
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
                        className="font-medium text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hours */}
            {hoursData && (
              <Card>
                <CardHeader>
                  <CardTitle>Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {hoursData.map(({ day, hours }) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="font-medium">{day}</span>
                        <span>{hours}</span>
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