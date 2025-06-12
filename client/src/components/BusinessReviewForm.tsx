import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessReviewFormProps {
  business: BusinessWithCategory;
  user: any;
}

export default function BusinessReviewForm({ business, user }: BusinessReviewFormProps) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const { toast } = useToast();

  const reviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const res = await apiRequest("POST", `/api/businesses/${business.placeid}/reviews`, reviewData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${business.placeid}/reviews`] });
      setReviewText("");
      setRating(5);
      toast({
        title: "Review submitted",
        description: "Thank you for your review! It will be published after moderation.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast({
        title: "Error",
        description: "Please write a review before submitting",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({
      rating,
      comment: reviewText,
      businessId: business.placeid,
    });
  };

  if (!user) {
    return null;
  }

  return (
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
  );
}