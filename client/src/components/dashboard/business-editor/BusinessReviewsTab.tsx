import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessReviewsTabProps {
  reviews: any[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * BusinessReviewsTab - Component for displaying business reviews and ratings
 * 
 * Shows a read-only display of customer reviews with ratings, comments, and author information.
 * Handles loading states and error conditions gracefully. Provides a clean interface
 * for business owners to view customer feedback without editing capabilities.
 * 
 * @param reviews - Array of review objects with rating, comment, and author data
 * @param isLoading - Loading state indicating whether reviews are being fetched
 * @param error - Error state if review fetching fails
 * 
 * @returns JSX.Element - Reviews display with loading states and error handling
 * 
 * @example
 * <BusinessReviewsTab 
 *   reviews={businessEditor.reviews}
 *   isLoading={businessEditor.reviewsLoading}
 *   error={businessEditor.reviewsError}
 * />
 */
export function BusinessReviewsTab({ reviews, isLoading, error }: BusinessReviewsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          Unable to load reviews at this time.
        </p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          No reviews available for this business yet.
        </p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <span className="font-medium">Customer Reviews</span>
        <Badge variant="secondary">{reviews.length}</Badge>
      </div>

      {reviews.map((review, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">
                    {review.author_name || "Anonymous"}
                  </span>
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating || 0)}
                  </div>
                  {review.time && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.time * 1000).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {review.text && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.text}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}