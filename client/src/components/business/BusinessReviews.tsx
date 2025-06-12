import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, User } from "lucide-react";
import { useMemo } from "react";
import ReviewForm from "@/components/review-form";
import type { BusinessWithCategory, Review, User as UserType } from "@shared/schema";

interface BusinessReviewsProps {
  business: BusinessWithCategory;
  reviews?: (Review & { user: Pick<UserType, 'firstName' | 'lastName'> })[];
  reviewsLoading?: boolean;
  onReviewSubmit?: () => void;
}

export default function BusinessReviews({ 
  business, 
  reviews, 
  reviewsLoading, 
  onReviewSubmit 
}: BusinessReviewsProps) {
  // Parse CSV review data from business.reviews JSON
  const csvReviews = useMemo(() => {
    if (!business.reviews) return [];
    try {
      const reviewsData = typeof business.reviews === 'string' 
        ? JSON.parse(business.reviews) 
        : business.reviews;
      return Array.isArray(reviewsData) ? reviewsData.slice(0, 10) : [];
    } catch (error) {
      console.error('Error parsing reviews data:', error);
      return [];
    }
  }, [business.reviews]);

  // Combine CSV reviews with database reviews
  const allReviews = useMemo(() => {
    const dbReviews = reviews || [];
    return [...dbReviews, ...csvReviews];
  }, [reviews, csvReviews]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reviews</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Write a Review</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Write a Review for {business.title}</DialogTitle>
              </DialogHeader>
              <ReviewForm 
                businessId={business.placeid}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {reviewsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : allReviews.length > 0 ? (
          <div className="space-y-6">
            {allReviews.map((review, index) => {
              // Handle both database reviews and CSV reviews
              const isDbReview = 'id' in review;
              const reviewerName = isDbReview 
                ? `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim() || review.authorName
                : review.name;
              const reviewText = isDbReview ? review.comment : review.text;
              const reviewRating = isDbReview ? review.rating : review.stars;
              const reviewDate = isDbReview 
                ? review.createdAt ? formatDate(String(review.createdAt)) : ''
                : review.publishAt;
              const reviewerPhoto = !isDbReview && review.reviewerPhotoUrl ? review.reviewerPhotoUrl : null;

              return (
                <div key={isDbReview ? review.id : `csv-${index}`} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                        {reviewerPhoto ? (
                          <img 
                            src={reviewerPhoto} 
                            alt={reviewerName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">
                          {reviewerName || 'Anonymous'}
                        </h4>
                        <div className="flex items-center">
                          {renderStars(reviewRating || 0)}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">
                        {reviewDate}
                      </p>
                      <p className="text-foreground leading-relaxed">
                        {reviewText}
                      </p>
                      {!isDbReview && review.reviewImageUrls && review.reviewImageUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {review.reviewImageUrls.slice(0, 3).map((imageUrl: string, imgIndex: number) => (
                            <img
                              key={imgIndex}
                              src={imageUrl}
                              alt="Review photo"
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No reviews yet</p>
            <p className="text-sm text-muted-foreground">Be the first to share your experience!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}