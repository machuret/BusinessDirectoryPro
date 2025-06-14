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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ClaimBusinessModal({ business, user, open, onOpenChange }: ClaimBusinessModalProps) {
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
      onOpenChange(false);
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
        title: "Message Required",
        description: "Please explain your relationship to this business to support your claim",
        variant: "destructive",
      });
      return;
    }

    if (claimMessage.trim().length < 50) {
      toast({
        title: "Message Too Short",
        description: "Please provide more details (at least 50 characters) to support your ownership claim",
        variant: "destructive",
      });
      return;
    }

    claimOwnershipMutation.mutate({
      businessId: business.placeid,
      message: claimMessage.trim(),
      userId: user?.id,
    });
  };

  const handleClose = () => {
    setClaimMessage("");
    onOpenChange(false);
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Claim Business Ownership</DialogTitle>
          <DialogDescription>
            Request ownership of "{business?.title}" to manage your business listing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="claim-message">Why should you be granted ownership? *</Label>
            <Textarea
              id="claim-message"
              placeholder="Please explain your relationship to this business and provide details that support your ownership claim..."
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              className="mt-1 min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {claimMessage.length}/1000 characters
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              <p className="font-medium mb-1">Please include:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your role at the business (owner, manager, etc.)</li>
                <li>How long you've been associated with the business</li>
                <li>Any supporting details that verify your connection</li>
              </ul>
            </div>
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