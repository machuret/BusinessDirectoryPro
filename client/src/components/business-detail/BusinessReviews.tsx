import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, User } from "lucide-react";
// ReviewForm component will be implemented separately
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessReviewsProps {
  business: BusinessWithCategory;
  allReviews: any[];
}

export function BusinessReviews({ business, allReviews }: BusinessReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Debug: log the actual review data structure
  console.log('Business reviews data:', business.reviews);
  console.log('All reviews prop:', allReviews);

  const renderStars = (rating: any) => {
    const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    console.log('Rendering stars for rating:', numericRating, 'from raw:', rating);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(numericRating) 
            ? "fill-yellow-500 text-yellow-500 !text-yellow-500 !fill-yellow-500" 
            : "text-gray-300 fill-gray-300"
        }`}
        style={i < Math.floor(numericRating) ? { color: '#eab308', fill: '#eab308' } : {}}
      />
    ));
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-black">
            <MessageSquare className="w-5 h-5 mr-2" />
            Customer Reviews ({allReviews.length})
          </CardTitle>
          <Button
            onClick={() => setShowReviewForm(true)}
            className="bg-black text-white hover:bg-gray-800"
          >
            Write Review
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {allReviews.length > 0 ? (
          <div className="space-y-4">
            {allReviews.map((review: any, index: number) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-black">
                        {review.author_name || review.reviewerName || review.author || review.user?.name || review.name || 
                         (review.author_name === null || review.author_name === undefined ? "Customer" : "Anonymous")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(() => {
                          if (review.time) {
                            return new Date(review.time * 1000).toLocaleDateString();
                          }
                          if (review.createdAt) {
                            return new Date(review.createdAt).toLocaleDateString();
                          }
                          if (review.date) {
                            return new Date(review.date).toLocaleDateString();
                          }
                          if (review.timestamp) {
                            return new Date(review.timestamp).toLocaleDateString();
                          }
                          return new Date().toLocaleDateString();
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(review.stars || review.rating || review.score || 5)}
                    <span className="text-sm text-gray-600 ml-1">
                      {review.stars || review.rating || review.score || 5}/5
                    </span>
                  </div>
                </div>
                <p className="text-black leading-relaxed">
                  {review.text || review.comment || review.reviewText || review.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-black">No reviews yet</h3>
            <p className="text-gray-600">Be the first to review this business!</p>
            <Button 
              onClick={() => setShowReviewForm(true)}
              className="mt-4 bg-black text-white hover:bg-gray-800"
            >
              Write First Review
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Review form would be implemented here */}
    </Card>
  );
}