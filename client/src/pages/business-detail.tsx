import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PhotoGallery from "@/components/photo-gallery";
import BusinessCarousel from "@/components/BusinessCarousel";
import SEOHead from "@/components/SEOHead";
import BusinessHeader from "@/components/business/BusinessHeader";
import BusinessContactInfo from "@/components/business/BusinessContactInfo";
import BusinessDescription from "@/components/business/BusinessDescription";
import BusinessReviews from "@/components/business/BusinessReviews";
import { getAllBusinessPhotos, getBusinessImage } from "@/components/business/BusinessPhotoUtils";
import type { BusinessWithCategory, Review, User as UserType } from "@shared/schema";

// Helper function to get all business photos
const getAllBusinessPhotos = (business: BusinessWithCategory): string[] => {
  const photos: string[] = [];
  
  // Add main business image
  if (business.imageurl) {
    photos.push(business.imageurl);
  }
  
  // Add images from imageurls array (handle both parsed arrays and JSON strings)
  if (business.imageurls) {
    let imageUrlsArray = business.imageurls;
    if (typeof business.imageurls === 'string') {
      try {
        imageUrlsArray = JSON.parse(business.imageurls);
      } catch (e) {
        console.warn('Failed to parse imageurls:', e);
        imageUrlsArray = [];
      }
    }
    if (Array.isArray(imageUrlsArray)) {
      photos.push(...imageUrlsArray.filter((url: any) => url && typeof url === 'string'));
    }
  }
  
  // Add images from images array (handle both parsed arrays and JSON strings)
  if (business.images) {
    let imagesArray = business.images;
    if (typeof business.images === 'string') {
      try {
        imagesArray = JSON.parse(business.images);
      } catch (e) {
        console.warn('Failed to parse images:', e);
        imagesArray = [];
      }
    }
    if (Array.isArray(imagesArray)) {
      photos.push(...imagesArray.filter((url: any) => url && typeof url === 'string'));
    }
  }
  
  // Extract from reviews if available
  if (business.reviews && Array.isArray(business.reviews)) {
    for (const review of business.reviews) {
      if (review.reviewImageUrls && Array.isArray(review.reviewImageUrls)) {
        photos.push(...review.reviewImageUrls.filter((url: any) => url && typeof url === 'string'));
      }
    }
  }
  
  // Remove duplicates and filter out invalid URLs
  const uniquePhotos = Array.from(new Set(photos));
  return uniquePhotos.filter(photo => 
    photo && 
    typeof photo === 'string' && 
    (photo.startsWith('http') || photo.startsWith('data:'))
  );
};

// Helper function to get the main business image
const getBusinessImage = (business: BusinessWithCategory) => {
  const allPhotos = getAllBusinessPhotos(business);
  return allPhotos.length > 0 ? allPhotos[0] : null;
};

export default function BusinessDetail() {
  const { slug } = useParams();
  
  const { data: business, isLoading: businessLoading, error: businessError } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/${slug}`],
  });

  const { data: reviews = [], isLoading: reviewsLoading, refetch: refetchReviews } = useQuery<(Review & { user: Pick<UserType, 'firstName' | 'lastName'> })[]>({
    queryKey: [`/api/businesses/${slug}/reviews`],
    enabled: !!business,
  });

  const { data: siteSettings } = useQuery<Record<string, any>>({
    queryKey: ["/api/site-settings"],
  });

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
            <p className="text-muted-foreground mb-4">The business you're looking for doesn't exist.</p>
            <Link href="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const businessImage = getBusinessImage(business);
  const allPhotos = getAllBusinessPhotos(business);

  const handleShare = async () => {
    const shareData = {
      title: business.title || 'Business',
      text: business.description || `Check out ${business.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        business={business}
        siteSettings={siteSettings}
        pageType="business"
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            {business.category && (
              <>
                <Link href={`/categories/${business.category.slug}`} className="hover:text-primary">
                  {business.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground">{business.title}</span>
          </nav>
        </div>

        {/* Business Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            {/* Business Actions */}
            <div className="flex items-center gap-2 mb-4 no-print">
              <Button onClick={handleShare} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Building2 className="h-4 w-4 mr-2" />
                    Claim Business
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Claim This Business</DialogTitle>
                  </DialogHeader>
                  <ClaimBusinessForm businessId={business.placeid} businessName={business.title || 'Business'} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Photo Gallery */}
            <PhotoGallery 
              photos={getAllBusinessPhotos(business)}
              businessName={business.title || 'Business'}
              className="mb-6"
            />

            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{business.title}</h1>
                {business.subtitle && (
                  <p className="text-lg text-muted-foreground">{business.subtitle}</p>
                )}
              </div>

              {business.category && (
                <Badge variant="secondary">{business.category.name}</Badge>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Number(business.totalscore || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {business.totalscore || 0} ({business.reviewscount || 0} reviews)
                  </span>
                </div>
              </div>

              {business.description && (
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">{business.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{business.address}</p>
                      {business.city && business.state && (
                        <p className="text-sm text-muted-foreground">
                          {business.city}, {business.state} {business.postalcode}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {business.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${business.phone}`} className="text-sm text-primary hover:underline">
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}



                {business.openinghours && Array.isArray(business.openinghours) && business.openinghours.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {(business.openinghours as any[]).map((hour: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>{String(hour?.day || '')}</span>
                            <span>{String(hour?.hours || '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Photo Gallery Section */}
        <div className="mb-8">
          <PhotoGallery 
            photos={allPhotos} 
            businessName={business.title || 'Business'} 
          />
        </div>

        {/* Reviews Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading reviews...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">
                              {review.authorName || `${review.user?.firstName || 'Anonymous'} ${review.user?.lastName || ''}`}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground">{review.comment}</p>
                        )}
                        {review.createdAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to write a review!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Form */}
          <div>
            <ReviewForm
              businessId={business.placeid}
              onSuccess={() => {
                refetchReviews();
              }}
            />
          </div>
        </div>
      </div>

      {/* Related Businesses Carousel */}
      <div className="container mx-auto px-4 py-8">
        <BusinessCarousel 
          currentBusinessId={business.placeid}
          categoryId={business.category?.id}
          city={business.city || undefined}
          title="Related Businesses"
        />
      </div>

      <Footer />
    </div>
  );
}