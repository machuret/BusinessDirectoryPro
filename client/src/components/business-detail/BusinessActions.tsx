import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { BusinessWithCategory } from "@shared/schema";
import ClaimBusinessModal from "@/components/ClaimBusinessModal";

interface BusinessActionsProps {
  business: BusinessWithCategory;
}

export function BusinessActions({ business }: BusinessActionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showClaimModal, setShowClaimModal] = useState(false);

  const handleClaimBusiness = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to claim this business.",
        variant: "destructive",
      });
      return;
    }
    setShowClaimModal(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.title || "Business",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Business link has been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {business.website && (
        <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800">
          <a href={business.website} target="_blank" rel="noopener noreferrer">
            <Globe className="w-4 h-4 mr-2" />
            Visit Website
          </a>
        </Button>
      )}
      <Button 
        variant="outline" 
        size="lg"
        onClick={handleClaimBusiness}
        className="border-black text-black hover:bg-gray-100"
      >
        <Heart className="w-4 h-4 mr-2" />
        Claim Business
      </Button>
      <Button 
        variant="outline" 
        size="lg" 
        onClick={handleShare}
        className="border-black text-black hover:bg-gray-100"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      
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