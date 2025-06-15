import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, User, MessageSquare } from "lucide-react";
import type { BusinessWithCategory, Review } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useContent } from "@/contexts/ContentContext";
import BusinessReviewForm from "@/components/BusinessReviewForm";
import ClaimBusinessModal from "@/components/ClaimBusinessModal";
import BusinessFAQ from "@/components/BusinessFAQ";

interface BusinessInteractionsProps {
  business: BusinessWithCategory;
  reviews: Review[];
  showClaimModal: boolean;
  setShowClaimModal: (show: boolean) => void;
}

export function BusinessInteractions({ 
  business, 
  reviews, 
  showClaimModal, 
  setShowClaimModal 
}: BusinessInteractionsProps) {
  const { user } = useAuth();
  const { t } = useContent();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return t('business.interactions.unknownDate');
    }
  };

  return (
    <div className="space-y-6">
      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              {t('business.interactions.customerReviews')} ({reviews.length})
            </CardTitle>
            {user && (
              <Button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                variant="outline"
                size="sm"
              >
                {t('business.interactions.writeReview')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showReviewForm && user && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <BusinessReviewForm 
                businessId={business.placeid || business.id || ""} 
                onSuccess={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.user?.firstName && review.user?.lastName
                            ? `${review.user.firstName} ${review.user.lastName}`
                            : review.reviewerName || t('business.interactions.anonymous')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(review.createdAt || "")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating || 0)}
                      <span className="text-sm text-gray-600 ml-1">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment || review.reviewText}
                  </p>
                  {review.status && review.status !== 'approved' && (
                    <Badge variant="secondary" className="mt-2">
                      {review.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">{t('business.interactions.noReviewsYet')}</h3>
              <p className="text-gray-600">{t('business.interactions.beFirstToReview')}</p>
              {user && (
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  className="mt-4"
                >
                  {t('business.interactions.writeFirstReview')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <BusinessFAQ business={business} />

      {/* Claim Business Modal */}
      <ClaimBusinessModal
        business={business}
        user={user}
        open={showClaimModal}
        onOpenChange={setShowClaimModal}
      />
    </div>
  );
}

export default BusinessInteractions;