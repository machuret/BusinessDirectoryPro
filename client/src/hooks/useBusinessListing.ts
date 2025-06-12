import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BusinessWithCategory, Review, InsertReview } from "@shared/schema";

export function useBusinessListing(identifier: string | undefined) {
  const { toast } = useToast();
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Fetch business data
  const { data: business, isLoading } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/${identifier}`],
    enabled: !!identifier,
  });

  // Fetch reviews
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/businesses/${identifier}/reviews`],
    enabled: !!identifier,
  });

  // Fetch similar businesses
  const { data: similarBusinesses = [] } = useQuery<BusinessWithCategory[]>({
    queryKey: [`/api/businesses/${identifier}/similar`],
    enabled: !!identifier,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: Omit<InsertReview, "id" | "createdAt" | "status">) => {
      const res = await apiRequest("POST", `/api/businesses/${identifier}/reviews`, reviewData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${identifier}/reviews`] });
      toast({
        title: "Review submitted successfully",
        description: "Your review will be published after moderation.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit ownership claim mutation
  const submitClaimMutation = useMutation({
    mutationFn: async (claimData: { message: string }) => {
      const res = await apiRequest("POST", `/api/businesses/${identifier}/claim`, claimData);
      return res.json();
    },
    onSuccess: () => {
      setShowClaimModal(false);
      toast({
        title: "Ownership claim submitted",
        description: "Your claim will be reviewed by our team.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit claim",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Business actions
  const handleShare = () => {
    if (navigator.share && business) {
      navigator.share({
        title: business.name || "Business",
        text: business.description || "Check out this business",
        url: window.location.href,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied to clipboard" });
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const handleGetDirections = () => {
    if (business?.address) {
      const query = encodeURIComponent(`${business.address}, ${business.city || ""}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    }
  };

  const handleClaimBusiness = () => {
    setShowClaimModal(true);
  };

  return {
    // Data
    business,
    reviews,
    similarBusinesses,
    isLoading,
    
    // UI State
    showClaimModal,
    setShowClaimModal,
    
    // Actions
    handleShare,
    handleGetDirections,
    handleClaimBusiness,
    
    // Mutations
    submitReview: submitReviewMutation.mutate,
    submitClaim: submitClaimMutation.mutate,
    isSubmittingReview: submitReviewMutation.isPending,
    isSubmittingClaim: submitClaimMutation.isPending,
  };
}