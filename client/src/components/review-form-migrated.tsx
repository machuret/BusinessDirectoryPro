import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  StandardizedForm, 
  InputField, 
  TextareaField, 
  FormButton 
} from "@/components/forms";
import { businessSchemas, ReviewFormData } from "@/lib/validation-schemas";

interface ReviewFormProps {
  businessId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ businessId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(businessSchemas.review),
    defaultValues: {
      reviewerName: "",
      title: "",
      rating: 0,
      comment: ""
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: ReviewFormData) => {
      const response = await apiRequest('POST', `/api/businesses/${businessId}/reviews`, reviewData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted successfully!",
        description: "Thank you for your feedback. Your review helps others make informed decisions.",
      });
      form.reset();
      setRating(0);
      setHoverRating(0);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ReviewFormData) => {
    const reviewData = {
      ...data,
      rating: rating
    };
    submitReviewMutation.mutate(reviewData);
  };

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
    form.setValue("rating", starValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience to help others make informed decisions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StandardizedForm
          form={form}
          onSubmit={handleSubmit}
          loading={submitReviewMutation.isPending}
          error={submitReviewMutation.error?.message}
        >
          <InputField
            name="reviewerName"
            control={form.control}
            label="Your Name"
            placeholder="Enter your name"
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleStarClick(star)}
                >
                  <Star className="w-full h-full fill-current" />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating} out of 5 stars
                </span>
              )}
            </div>
            {form.formState.errors.rating && (
              <p className="text-sm text-red-600">
                {form.formState.errors.rating.message}
              </p>
            )}
          </div>

          <InputField
            name="title"
            control={form.control}
            label="Review Title"
            placeholder="Summarize your experience"
            required
            helperText="Give your review a helpful title"
          />

          <TextareaField
            name="comment"
            control={form.control}
            label="Your Review"
            placeholder="Tell others about your experience. What did you like? What could be improved?"
            required
            rows={5}
            maxLength={1000}
            showCharCount
            helperText="Be specific and helpful to other customers"
          />

          <FormButton
            type="submit"
            loading={submitReviewMutation.isPending}
            loadingText="Submitting review..."
            fullWidth
            size="lg"
          >
            Submit Review
          </FormButton>
        </StandardizedForm>
      </CardContent>
    </Card>
  );
}