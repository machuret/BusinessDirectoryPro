import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, MapPin, ArrowLeft, Share2, Printer } from "lucide-react";
import { Link } from "wouter";
import ClaimBusinessForm from "@/components/ClaimBusinessForm";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessHeaderProps {
  business: BusinessWithCategory;
  onPrint: () => void;
}

export default function BusinessHeader({ business, onPrint }: BusinessHeaderProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.title || 'Business',
          text: business.description || 'Check out this business',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('URL copied to clipboard!');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          {business.category && (
            <>
              <Link href={`/category/${business.category.slug}`} className="hover:text-primary">
                {business.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{business.title}</span>
        </nav>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-1">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">{business.title}</h1>
            </div>
            
            {business.category && (
              <Badge variant="secondary" className="mb-3">
                {business.category.name}
              </Badge>
            )}
            
            <div className="flex items-center space-x-4 text-muted-foreground mb-3">
              {business.city && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{business.city}</span>
                </div>
              )}
              
              {business.averagerating && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(business.averagerating)}
                  </div>
                  <span className="font-medium">{business.averagerating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {business.subtitle && (
              <p className="text-muted-foreground mb-3">{business.subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-4 lg:mt-0">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  Claim Business
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Claim Your Business</DialogTitle>
                </DialogHeader>
                <ClaimBusinessForm 
                businessId={business.placeid} 
                businessName={business.title || 'Business'} 
              />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
}