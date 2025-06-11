import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, User } from "lucide-react";
import ReviewForm from "@/components/review-form";
import type { BusinessWithCategory, Review, User as UserType } from "@shared/schema";

interface BusinessReviewsProps {
  business: BusinessWithCategory;
  reviews: (Review & { user: Pick<UserType, 'firstName' | 'lastName'> })[];
  reviewsLoading: boolean;
  onReviewSubmit: () => void;
}

export default function BusinessReviews({ 
  business, 
  reviews, 
  reviewsLoading, 
  onReviewSubmit 
}: BusinessReviewsProps) {
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
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">
                        {review.user.firstName || 'Anonymous'} {review.user.lastName || ''}
                      </h4>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      {review.createdAt ? formatDate(String(review.createdAt)) : ''}
                    </p>
                    <p className="text-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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