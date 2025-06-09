import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  ArrowLeft,
  Share2,
  Heart,
  User
} from "lucide-react";
import type { BusinessWithCategory, Review, User as UserType } from "@shared/schema";

export default function BusinessDetail() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");

  const { data: business, isLoading: businessLoading } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/slug/${slug}`],
    enabled: !!slug,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<(Review & { user: Pick<UserType, 'firstName' | 'lastName'> })[]>({
    queryKey: [`/api/businesses/${business?.id}/reviews`],
    enabled: !!business?.id,
  });

  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; title?: string; content?: string }) => {
      if (!business) throw new Error("Business not found");
      await apiRequest("POST", `/api/businesses/${business.id}/reviews`, reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
      setReviewRating(5);
      setReviewTitle("");
      setReviewContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${business?.id}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/slug/${slug}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You must be signed in to leave a review.",
        variant: "destructive",
      });
      return;
    }
    
    reviewMutation.mutate({
      rating: reviewRating,
      title: reviewTitle || undefined,
      content: reviewContent || undefined,
    });
  };

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
          <p className="text-gray-600 mb-8">The business you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = "/categories"}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const renderStars = (rating: number, size = "w-5 h-5") => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const formatHours = (hours: any) => {
    if (!hours || typeof hours !== 'object') return "Hours not available";
    
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayHours = hours[dayNames[today]];
    
    if (todayHours === 'closed') return "Closed today";
    if (todayHours) return `Open today: ${todayHours}`;
    return "Hours not available";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/categories/${business.category.slug}`}>
                  {business.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{business.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Business Header */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
                      {business.verified && (
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      )}
                      {business.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                      )}
                    </div>
                    <p className="text-lg text-gray-600 mb-4">{business.category.name}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {renderStars(Math.round(parseFloat(business.averageRating || "0")))}
                        <span className="text-lg font-semibold text-gray-900 ml-2">
                          {parseFloat(business.averageRating || "0").toFixed(1)}
                        </span>
                        <span className="text-gray-600">
                          ({business.totalReviews} {business.totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Business Images */}
                {business.imageUrls && business.imageUrls.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {business.imageUrls.slice(0, 6).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${business.name} - ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                <p className="text-gray-700 text-lg leading-relaxed">{business.description}</p>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Customer Reviews</span>
                  <span className="text-sm font-normal text-gray-600">
                    {business.totalReviews} {business.totalReviews === 1 ? 'review' : 'reviews'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Write Review Form */}
                {isAuthenticated && (
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <Label>Rating</Label>
                        <div className="flex items-center space-x-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewRating(i + 1)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  i < reviewRating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review-title">Title (optional)</Label>
                        <Input
                          id="review-title"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Great service!"
                        />
                      </div>
                      <div>
                        <Label htmlFor="review-content">Review (optional)</Label>
                        <Textarea
                          id="review-content"
                          value={reviewContent}
                          onChange={(e) => setReviewContent(e.target.value)}
                          placeholder="Tell others about your experience..."
                          rows={4}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={reviewMutation.isPending}
                        className="w-full"
                      >
                        {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2 w-1/4" />
                        <div className="h-3 bg-gray-200 rounded mb-3 w-full" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.user.firstName} {review.user.lastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating, "w-4 h-4")}
                          </div>
                        </div>
                        {review.title && (
                          <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                        )}
                        {review.content && (
                          <p className="text-gray-700">{review.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No reviews yet. Be the first to review this business!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{business.address}</p>
                    <p className="text-gray-600">{business.city}, {business.state} {business.zipCode}</p>
                  </div>
                </div>

                {business.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a 
                      href={`tel:${business.phone}`}
                      className="text-primary hover:underline"
                    >
                      {business.phone}
                    </a>
                  </div>
                )}

                {business.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a 
                      href={`mailto:${business.email}`}
                      className="text-primary hover:underline"
                    >
                      {business.email}
                    </a>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a 
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{formatHours(business.hours)}</p>
                    <p className="text-sm text-gray-600">Click for full hours</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full" size="lg">
                    Contact Business
                  </Button>
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
