import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building2, Phone, Globe, MapPin, Clock, Star, Users, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { BusinessWithCategory, Review } from "@shared/schema";

export default function BusinessOwnerPortal() {
  const { businessId } = useParams();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  
  const { data: business, isLoading: businessLoading } = useQuery<BusinessWithCategory>({
    queryKey: ["/api/businesses", businessId],
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews", businessId],
  });

  const { data: claims } = useQuery({
    queryKey: ["/api/ownership-claims/business", businessId],
  });

  const [formData, setFormData] = useState({
    title: business?.title || "",
    description: business?.description || "",
    phone: business?.phone || "",
    website: business?.website || "",
    address: business?.address || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/businesses/${businessId}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Business Updated",
        description: "Your business information has been updated successfully.",
      });
      setEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Business Not Found</h2>
              <p className="text-muted-foreground">The business you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const approvedClaims = claims?.filter((claim: any) => claim.status === 'approved') || [];
  const pendingClaims = claims?.filter((claim: any) => claim.status === 'pending') || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Business Owner Portal</h1>
          <p className="text-muted-foreground">Manage your business listing and track performance</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {business.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">
                    {business.totalscore ? `${Number(business.totalscore).toFixed(1)} rating` : 'No ratings'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    {business.reviewscount || 0} reviews
                  </span>
                </div>

                {approvedClaims.length > 0 && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Verified Owner
                  </Badge>
                )}

                {pendingClaims.length > 0 && (
                  <Badge variant="outline" className="w-full justify-center">
                    Claim Pending
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="business-info" className="space-y-6">
              <TabsList>
                <TabsTrigger value="business-info">Business Info</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="claims">Ownership Claims</TabsTrigger>
              </TabsList>

              <TabsContent value="business-info">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Business Information</CardTitle>
                      <Button
                        variant={editMode ? "outline" : "default"}
                        onClick={() => setEditMode(!editMode)}
                      >
                        {editMode ? "Cancel" : "Edit"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Business Name</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            />
                          </div>

                          <div>
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              type="url"
                              value={formData.website}
                              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>

                        <Button type="submit" disabled={updateMutation.isPending}>
                          {updateMutation.isPending ? "Updating..." : "Update Business"}
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-1">Business Name</h3>
                          <p className="text-muted-foreground">{business.title || "Not provided"}</p>
                        </div>

                        <div>
                          <h3 className="font-medium mb-1">Description</h3>
                          <p className="text-muted-foreground">{business.description || "No description available"}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {business.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{business.phone}</span>
                            </div>
                          )}

                          {business.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                Visit Website
                              </a>
                            </div>
                          )}
                        </div>

                        {business.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">{business.address}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviews && reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review: any) => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {review.user?.firstName} {review.user?.lastName}
                              </span>
                            </div>
                            <p className="text-sm">{review.comment}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No reviews yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-2xl font-bold">
                            {business.totalscore ? Number(business.totalscore).toFixed(1) : '0.0'}
                          </p>
                          <p className="text-sm text-muted-foreground">Average Rating</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">{business.reviewscount || 0}</p>
                          <p className="text-sm text-muted-foreground">Total Reviews</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">
                            {business.imagescount || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Photos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="claims">
                <Card>
                  <CardHeader>
                    <CardTitle>Ownership Claims</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {claims && claims.length > 0 ? (
                      <div className="space-y-4">
                        {claims.map((claim: any) => (
                          <div key={claim.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{claim.ownerName}</span>
                              <Badge variant={
                                claim.status === 'approved' ? 'default' :
                                claim.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {claim.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{claim.ownerEmail}</p>
                            {claim.message && (
                              <p className="text-sm">{claim.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted: {new Date(claim.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No ownership claims</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}