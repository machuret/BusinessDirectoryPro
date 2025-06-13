import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useOptimisticReview } from '@/hooks/useOptimisticMutation';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { cn } from '@/lib/utils';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(500),
  businessId: z.string(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface OptimizedReviewFormProps {
  businessId: string;
  onSuccess?: () => void;
  className?: string;
}

export function OptimizedReviewForm({
  businessId,
  onSuccess,
  className
}: OptimizedReviewFormProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const { trackInteraction } = usePerformanceMonitoring();
  
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      businessId,
    },
  });

  const { mutateOptimistic, isPending, isOptimistic } = useOptimisticReview();

  const onSubmit = (data: ReviewFormData) => {
    const startTime = performance.now();
    
    mutateOptimistic({
      ...data,
      userName: 'Current User', // This would come from auth context
      createdAt: new Date().toISOString(),
    }, {
      onSuccess: () => {
        trackInteraction('review_submission', startTime);
        form.reset();
        onSuccess?.();
      },
    });
  };

  const handleRatingClick = (rating: number) => {
    form.setValue('rating', rating);
    const startTime = performance.now();
    trackInteraction('rating_selection', startTime);
  };

  const rating = form.watch('rating');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-4', className)}>
      {/* Rating Section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Your Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 hover:scale-110 transition-transform duration-150"
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-colors duration-150',
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
          </span>
        </div>
        {form.formState.errors.rating && (
          <p className="text-sm text-destructive">Please select a rating</p>
        )}
      </div>

      {/* Comment Section */}
      <div className="space-y-2">
        <Label htmlFor="comment" className="text-sm font-medium">
          Your Review
        </Label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this business..."
          className="min-h-[100px] resize-none"
          {...form.register('comment')}
        />
        {form.formState.errors.comment && (
          <p className="text-sm text-destructive">
            {form.formState.errors.comment.message}
          </p>
        )}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Minimum 10 characters</span>
          <span>{form.watch('comment')?.length || 0}/500</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={isPending || rating === 0}
          className={cn(
            'flex-1 transition-all duration-200',
            isOptimistic && 'bg-green-600 hover:bg-green-700'
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : isOptimistic ? (
            'Review Submitted!'
          ) : (
            'Submit Review'
          )}
        </Button>
        
        {form.formState.isDirty && (
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Optimistic feedback */}
      {isOptimistic && (
        <div className="text-sm text-green-600 font-medium animate-pulse">
          Your review is being processed...
        </div>
      )}
    </form>
  );
}