import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ReviewForm from "@/components/review-form";
import PhotoGallery from "@/components/photo-gallery";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  ArrowLeft,
  User
} from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background">
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
            {/* Photo Gallery */}
            <PhotoGallery 
              photos={getAllBusinessPhotos(business)}
              businessName={business.title || business.name || 'Business'}
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
                        star <= (business.totalscore || 0)
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

                {/* Social Media Links - Only show if URLs exist */}
                {(business.facebook || business.instagram || business.twitter || business.linkedin || business.youtube) && (
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 text-muted-foreground flex items-center justify-center">
                      <span className="text-sm font-medium">Social</span>
                    </div>
                    <div className="flex space-x-3">
                      {business.facebook && (
                        <a
                          href={business.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Facebook"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                      {business.instagram && (
                        <a
                          href={business.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-800 transition-colors"
                          title="Instagram"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.23 4.281h7.539c2.137 0 3.864 1.727 3.864 3.864v7.539c0 2.137-1.727 3.864-3.864 3.864H8.23c-2.137 0-3.864-1.727-3.864-3.864V8.145c0-2.137 1.727-3.864 3.864-3.864zm7.539 1.729H8.23c-1.177 0-2.135.958-2.135 2.135v7.539c0 1.177.958 2.135 2.135 2.135h7.539c1.177 0 2.135-.958 2.135-2.135V8.145c0-1.177-.958-2.135-2.135-2.135zm-3.752 2.014c1.897 0 3.434 1.537 3.434 3.434s-1.537 3.434-3.434 3.434-3.434-1.537-3.434-3.434 1.537-3.434 3.434-3.434zm0 1.729c-0.943 0-1.705.762-1.705 1.705s.762 1.705 1.705 1.705 1.705-.762 1.705-1.705-.762-1.705-1.705-1.705zm3.525-2.799c0.441 0 0.8.359 0.8 0.8s-.359 0.8-0.8 0.8-.8-.359-.8-0.8.359-0.8 0.8-0.8z"/>
                          </svg>
                        </a>
                      )}
                      {business.twitter && (
                        <a
                          href={business.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-600 transition-colors"
                          title="Twitter"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </a>
                      )}
                      {business.linkedin && (
                        <a
                          href={business.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 transition-colors"
                          title="LinkedIn"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {business.youtube && (
                        <a
                          href={business.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="YouTube"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {business.openinghours && Array.isArray(business.openinghours) && business.openinghours.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {business.openinghours.map((hour: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>{hour.day}</span>
                            <span>{hour.hours}</span>
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

      <Footer />
    </div>
  );
}