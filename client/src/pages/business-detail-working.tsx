import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BusinessCard from "@/components/business-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Star, MapPin, Share2, Heart, Phone, Globe, Clock, Mail, User, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import type { BusinessWithCategory, Review } from "@shared/schema";

export default function BusinessDetailWorking() {
  const { slug } = useParams<{ slug: string }>();
  const [showClaimModal, setShowClaimModal] = useState(false);

  const { data: business, isLoading, error } = useQuery<BusinessWithCategory>({
    queryKey: ["/api/businesses/slug", slug],
    queryFn: async () => {
      const response = await fetch(`/api/businesses/slug/${slug}`);
      if (!response.ok) {
        throw new Error("Business not found");
      }
      return response.json();
    },
    enabled: !!slug,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/businesses/${business?.placeid}/reviews`],
    enabled: !!business?.placeid,
  });

  const { data: similarBusinesses = [] } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses/random", { limit: 6 }],
    enabled: !!business?.placeid,
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (isLoading) {
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

  if (error || !business) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The business you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getBusinessImage = () => {
    if (business.imageurl) return business.imageurl;
    if (business.images && Array.isArray(business.images) && business.images.length > 0) {
      return business.images[0];
    }
    if (business.imageurls && Array.isArray(business.imageurls) && business.imageurls.length > 0) {
      return business.imageurls[0];
    }
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format';
  };

  const getBusinessImages = () => {
    const images = [];
    if (business.imageurl) images.push(business.imageurl);
    if (business.images && Array.isArray(business.images)) {
      images.push(...business.images);
    }
    if (business.imageurls && Array.isArray(business.imageurls)) {
      images.push(...business.imageurls);
    }
    return images.filter((img, index, arr) => arr.indexOf(img) === index); // Remove duplicates
  };

  const getHeroImage = () => {
    const images = getBusinessImages();
    return images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format';
  };

  const getGalleryImages = () => {
    const images = getBusinessImages();
    return images.slice(1, 4); // Get images 2, 3, 4 (skip the first one used in hero)
  };

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

  const parseHours = () => {
    // Check multiple possible field names for hours
    const hoursData = business.openinghours || (business as any).hours || (business as any).operatingHours;
    if (!hoursData) return [];
    
    try {
      if (typeof hoursData === 'string') {
        return JSON.parse(hoursData);
      }
      if (Array.isArray(hoursData)) {
        return hoursData;
      }
      return [];
    } catch {
      return [];
    }
  };

  const parseFAQ = () => {
    // Check multiple possible field names for FAQ
    const faqData = business.faq || (business as any).faqs || (business as any).frequently_asked_questions;
    if (!faqData) return [];
    
    try {
      if (typeof faqData === 'string') {
        return JSON.parse(faqData);
      }
      if (Array.isArray(faqData)) {
        return faqData;
      }
      return [];
    } catch {
      return [];
    }
  };

  const parseReviews = () => {
    // Check multiple possible field names for reviews
    const reviewsData = (business as any).reviews || (business as any).review || (business as any).businessReviews;
    if (!reviewsData) return [];
    
    try {
      if (typeof reviewsData === 'string') {
        return JSON.parse(reviewsData);
      }
      if (Array.isArray(reviewsData)) {
        return reviewsData;
      }
      return [];
    } catch {
      return [];
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Contact form submission logic would go here
    console.log('Contact form submitted:', contactForm);
  };

  const businessImages = getBusinessImages();
  const hours = parseHours();
  const faqItems = parseFAQ();
  const businessReviews = parseReviews();
  
  // Combine API reviews with business JSON reviews
  const allReviews = [...reviews, ...businessReviews];

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      
      {/* Hero Section with Image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={getHeroImage()}
          alt={business.title || "Business"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white">{business.title}</h1>
            {business.subtitle && (
              <p className="text-lg md:text-xl text-gray-200">{business.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {business.categoryname && (
                <Badge variant="secondary">{business.categoryname}</Badge>
              )}
              {business.city && (
                <div className="flex items-center gap-1 text-gray-200">
                  <MapPin className="w-4 h-4" />
                  {business.city}
                </div>
              )}
              {business.totalscore && typeof business.totalscore === 'number' && business.totalscore > 0 && (
                <div className="flex items-center gap-1">
                  {renderStars(business.totalscore)}
                  <span className="ml-1 text-gray-200">
                    {Number(business.totalscore).toFixed(1)}
                    {business.reviewscount && ` (${business.reviewscount} reviews)`}
                  </span>
                </div>
              )}
              {business.featured && (
                <Badge variant="default">Featured</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photos Section - Under Hero (images 2, 3, 4) */}
      {getGalleryImages().length > 0 && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-4">
            {getGalleryImages().map((image: string, index: number) => (
              <img
                key={index}
                src={image}
                alt={`${business.title} - Photo ${index + 2}`}
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
              {business.phone && (
                <Button size="lg" asChild className="bg-black text-white hover:bg-gray-800">
                  <a href={`tel:${business.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </a>
                </Button>
              )}
              {business.website && (
                <Button variant="outline" size="lg" asChild className="border-black text-black hover:bg-gray-100">
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel={business.featured ? "noopener noreferrer" : "nofollow noopener noreferrer"}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setShowClaimModal(true)}
                className="border-black text-black hover:bg-gray-100"
              >
                <Heart className="w-4 h-4 mr-2" />
                Claim Business
              </Button>
              <Button variant="outline" size="lg" className="border-black text-black hover:bg-gray-100">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Description */}
            {business.description && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-black">About {business.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black leading-relaxed">
                    {business.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-black">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Customer Reviews ({allReviews.length})
                  </CardTitle>
                  <Button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    variant="outline"
                    size="sm"
                    className="border-black text-black hover:bg-gray-100"
                  >
                    Write Review
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showReviewForm && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold mb-4 text-black">Write a Review</h3>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="rating" className="text-black">Rating</Label>
                        <div className="flex items-center space-x-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review" className="text-black">Your Review</Label>
                        <Textarea
                          id="review"
                          placeholder="Share your experience..."
                          className="mt-1 text-black"
                        />
                      </div>
                      <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                        Submit Review
                      </Button>
                    </form>
                  </div>
                )}

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
                                {review.author_name || review.reviewerName || review.author || "Anonymous"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {review.time ? new Date(review.time * 1000).toLocaleDateString() : 
                                 review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 
                                 "Unknown date"}
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
            </Card>

            {/* FAQ Section */}
            {faqItems.length > 0 && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-black">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqItems.map((item: any, index: number) => (
                      <Collapsible 
                        key={index} 
                        open={expandedFaq === index}
                        onOpenChange={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-gray-50 transition-colors">
                          <span className="font-medium text-black">{item.question}</span>
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform text-black ${
                              expandedFaq === index ? 'transform rotate-180' : ''
                            }`} 
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4">
                          <div className="text-black leading-relaxed">
                            {item.answer}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-black">
                  <Phone className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.categoryname && (
                  <div className="flex items-start space-x-3">
                    <Badge variant="secondary" className="mt-0.5">
                      {business.categoryname}
                    </Badge>
                  </div>
                )}

                {business.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-black">Phone</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-black">{business.phone}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          className="h-7 px-2 text-xs border-black text-black hover:bg-gray-100"
                        >
                          <a href={`tel:${business.phone}`}>Call</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-black">Website</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        className="h-7 px-2 text-xs border-black text-black hover:bg-gray-100"
                      >
                        <a 
                          href={business.website}
                          target="_blank"
                          rel={business.featured ? "noopener noreferrer" : "nofollow noopener noreferrer"}
                        >
                          Visit Website
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {business.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-black">Address</p>
                      <p className="text-sm text-black">{business.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hours */}
            {hours.length > 0 && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Clock className="w-5 h-5" />
                    Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {hours.map((dayHours: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium text-black">{dayHours.day}</span>
                        <span className="text-black">{dayHours.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Form */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Contact {business.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-black">Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 text-black"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-black">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 text-black"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-black">Phone</Label>
                    <Input
                      id="phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 text-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-black">Message</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="mt-1 text-black"
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Business Carousel at the End */}
        {similarBusinesses.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-black">More Businesses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarBusinesses.slice(0, 6).map((bus: any) => (
                <BusinessCard 
                  key={bus.placeid || bus.id}
                  business={bus}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}