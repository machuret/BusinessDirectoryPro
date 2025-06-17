import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star } from "lucide-react";
import type { Review } from "@/hooks/useBusinessReviews";

interface BusinessReviewsTabProps {
  reviews: Review[];
  reviewsLoading: boolean;
}

export function BusinessReviewsTab({ reviews, reviewsLoading }: BusinessReviewsTabProps) {
  if (reviewsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2 animate-pulse" />
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h4 className="text-lg font-medium mb-2">No Reviews Yet</h4>
        <p className="text-muted-foreground mb-4">
          This business hasn't received any customer reviews yet. Reviews will appear here once customers start leaving feedback.
        </p>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Encourage customers to leave reviews after their visit</p>
          <p>• Respond to reviews to build customer relationships</p>
          <p>• Use feedback to improve your business services</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Reviews ({reviews.length})
          </h3>
          <p className="text-sm text-muted-foreground">Manage customer reviews and ratings</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <Card key={review.id || index} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (review.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {review.user?.firstName || review.customerName || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
              <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                {review.status || 'pending'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}