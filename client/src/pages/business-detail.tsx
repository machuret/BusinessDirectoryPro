import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ReviewForm from "@/components/review-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  ArrowLeft,
  User
} from "lucide-react";
import type { BusinessWithCategory, Review, User as UserType } from "@shared/schema";

// Helper function to get business image
const getBusinessImage = (business: BusinessWithCategory) => {
  // Priority order: imageurl, extract from reviews, then fallback
  if (business.imageurl) return business.imageurl;
  
  // Extract from reviews if available
  if (business.reviews && Array.isArray(business.reviews)) {
    for (const review of business.reviews) {
      if (review.reviewImageUrls && Array.isArray(review.reviewImageUrls) && review.reviewImageUrls.length > 0) {
        return review.reviewImageUrls[0];
      }
    }
  }
  
  // Check imageurls array
  if (business.imageurls && Array.isArray(business.imageurls) && business.imageurls.length > 0) {
    return business.imageurls[0];
  }
  
  // Check images array
  if (business.images && Array.isArray(business.images) && business.images.length > 0) {
    return business.images[0];
  }
  
  return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&auto=format";
};

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

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading business details...</p>
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
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
            <p className="text-muted-foreground mb-4">The business you're looking for doesn't exist.</p>
            <Link href="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const businessImage = getBusinessImage(business);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            {business.category && (
              <>
                <Link href={`/categories/${business.category.slug}`} className="hover:text-primary">
                  {business.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground">{business.title}</span>
          </nav>
        </div>

        {/* Business Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="relative mb-6">
              <img
                src={businessImage}
                alt={business.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&auto=format";
                }}
              />
            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{business.title}</h1>
                {business.subtitle && (
                  <p className="text-lg text-muted-foreground">{business.subtitle}</p>
                )}
              </div>

              {business.category && (
                <Badge variant="secondary">{business.category.name}</Badge>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= (business.totalscore || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {business.totalscore || 0} ({business.reviewscount || 0} reviews)
                  </span>
                </div>
              </div>

              {business.description && (
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">{business.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{business.address}</p>
                      {business.city && business.state && (
                        <p className="text-sm text-muted-foreground">
                          {business.city}, {business.state} {business.postalcode}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {business.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${business.phone}`} className="text-sm text-primary hover:underline">
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}

                {business.openinghours && Array.isArray(business.openinghours) && business.openinghours.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {business.openinghours.map((hour: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>{hour.day}</span>
                            <span>{hour.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading reviews...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">
                              {review.authorName || `${review.user?.firstName || 'Anonymous'} ${review.user?.lastName || ''}`}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground">{review.comment}</p>
                        )}
                        {review.createdAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to write a review!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Form */}
          <div>
            <ReviewForm
              businessId={business.placeid}
              onSuccess={() => {
                refetchReviews();
              }}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
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
