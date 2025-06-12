import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BusinessWithCategory } from "@shared/schema";

interface ClaimBusinessModalProps {
  business: BusinessWithCategory;
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClaimBusinessModal({ business, user, isOpen, onClose }: ClaimBusinessModalProps) {
  const [claimMessage, setClaimMessage] = useState("");
  const { toast } = useToast();

  const claimOwnershipMutation = useMutation({
    mutationFn: async (claimData: any) => {
      const res = await apiRequest("POST", "/api/ownership-claims", claimData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Ownership claim submitted",
        description: "Your claim has been submitted for review. We'll contact you within 2-3 business days.",
      });
      setClaimMessage("");
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit ownership claim",
        variant: "destructive",
      });
    },
  });

  const handleClaimSubmit = () => {
    if (!claimMessage.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for your ownership claim",
        variant: "destructive",
      });
      return;
    }

    claimOwnershipMutation.mutate({
      businessId: business.placeid,
      message: claimMessage,
      userEmail: user?.email,
    });
  };

  const handleClose = () => {
    setClaimMessage("");
    onClose();
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Claim Business Ownership</DialogTitle>
          <DialogDescription>
            Request ownership of "{business?.title}" to manage your business listing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="claim-message">Why should you be granted ownership?</Label>
            <Textarea
              id="claim-message"
              placeholder="Please explain your relationship to this business..."
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleClaimSubmit}
              disabled={claimOwnershipMutation.isPending}
              className="flex-1"
            >
              {claimOwnershipMutation.isPending ? "Submitting..." : "Submit Claim"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}