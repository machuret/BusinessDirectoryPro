import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Star, MessageSquare, AlertTriangle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ReviewsManagerProps {
  businessId: string;
  business?: any;
}

export default function ReviewsManager({ businessId, business }: ReviewsManagerProps) {
  const { toast } = useToast();
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);

  // Extract reviews from business data
  const reviews = business?.reviews ? (Array.isArray(business.reviews) ? business.reviews : JSON.parse(business.reviews as string)) : [];
  const isLoading = false;

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/reviews/${reviewId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews', businessId] });
      toast({
        title: "Review deleted",
        description: "Review has been permanently removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (reviewIds: number[]) => {
      const response = await apiRequest('DELETE', `/api/admin/reviews/bulk`, {
        reviewIds
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews', businessId] });
      setSelectedReviews([]);
      toast({
        title: "Reviews deleted",
        description: `${selectedReviews.length} reviews have been removed`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting reviews",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This business has no reviews yet.
        </AlertDescription>
      </Alert>
    );
  }

  const handleReviewSelect = (reviewId: number) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedReviews.length > 0) {
      bulkDeleteMutation.mutate(selectedReviews);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reviews Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage customer reviews for this business
          </p>
        </div>
        {selectedReviews.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedReviews.length})
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {reviews.map((review: any) => (
          <Card 
            key={review.id} 
            className={`cursor-pointer transition-all ${
              selectedReviews.includes(review.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleReviewSelect(review.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{review.authorName || 'Anonymous'}</CardTitle>
                  <Badge className={getStatusColor(review.status)}>
                    {review.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteReviewMutation.mutate(review.id);
                    }}
                    disabled={deleteReviewMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {review.title && (
                <h4 className="font-medium mb-2">{review.title}</h4>
              )}
              <p className="text-sm text-muted-foreground mb-3">
                {review.comment || 'No comment provided'}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
                {review.authorEmail && (
                  <span>{review.authorEmail}</span>
                )}
              </div>
              {review.adminNotes && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  <strong>Admin Notes:</strong> {review.adminNotes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        Total reviews: {reviews.length}
      </div>
    </div>
  );
}