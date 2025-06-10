import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Building2, FileText, Clock, CheckCircle, XCircle, Edit, Star, MapPin, Phone } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("businesses");
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithCategory | null>(null);

  // Data queries
  const { data: ownedBusinesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/user/businesses"],
    enabled: !!user,
  });

  const { data: ownershipClaims, isLoading: claimsLoading } = useQuery<any[]>({
    queryKey: [`/api/ownership-claims/user/${user?.id}`],
    enabled: !!user,
  });

  // Business update mutation
  const updateBusinessMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/businesses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/businesses"] });
      setEditingBusiness(null);
      toast({ title: "Business updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditBusiness = (business: BusinessWithCategory) => {
    setEditingBusiness(business);
  };

  const handleUpdateBusiness = (formData: FormData) => {
    if (!editingBusiness) return;

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      phone: formData.get("phone"),
      website: formData.get("website"),
      address: formData.get("address"),
    };

    updateBusinessMutation.mutate({
      id: editingBusiness.placeid,
      data,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-6 w-6" />
                <span>Access Denied</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please log in to access your dashboard.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your businesses and ownership claims</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="businesses" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>My Businesses</span>
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Ownership Claims</span>
            </TabsTrigger>
          </TabsList>

          {/* My Businesses Tab */}
          <TabsContent value="businesses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Businesses</CardTitle>
                <CardDescription>Businesses you own and can manage</CardDescription>
              </CardHeader>
              <CardContent>
                {businessesLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : !ownedBusinesses || ownedBusinesses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    You don't own any businesses yet. Submit ownership claims to manage businesses.
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {ownedBusinesses.map((business) => (
                      <Card key={business.placeid} className="border hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg">{business.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {business.description || "No description available"}
                              </p>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              {business.address && (
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  <span className="truncate">{business.address}</span>
                                </div>
                              )}
                              {business.phone && (
                                <div className="flex items-center text-gray-600">
                                  <Phone className="w-4 h-4 mr-2" />
                                  <span>{business.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center text-gray-600">
                                <Star className="w-4 h-4 mr-2" />
                                <span>{parseFloat(business.totalscore || "0").toFixed(1)} ({business.reviewscount || 0} reviews)</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditBusiness(business)}
                                className="flex-1"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/business/${business.placeid}`, '_blank')}
                                className="flex-1"
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ownership Claims Tab */}
          <TabsContent value="claims" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Ownership Claims</CardTitle>
                <CardDescription>Track the status of your business ownership requests</CardDescription>
              </CardHeader>
              <CardContent>
                {claimsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : !ownershipClaims || ownershipClaims.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No ownership claims found. Visit business pages to submit ownership claims.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ownershipClaims.map((claim: any) => (
                      <Card key={claim.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">Business ID: {claim.businessId}</h3>
                                <Badge variant={
                                  claim.status === 'pending' ? 'secondary' :
                                  claim.status === 'approved' ? 'default' :
                                  'destructive'
                                }>
                                  {claim.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                  {claim.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {claim.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                  {claim.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                <strong>Your message:</strong> {claim.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                              </p>
                              {claim.adminMessage && (
                                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                  <p className="text-sm text-gray-600">
                                    <strong>Admin response:</strong> {claim.adminMessage}
                                  </p>
                                  {claim.reviewedAt && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Reviewed: {new Date(claim.reviewedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Business Modal */}
        {editingBusiness && (
          <Dialog open={!!editingBusiness} onOpenChange={() => setEditingBusiness(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Business: {editingBusiness.title}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpdateBusiness(formData);
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title">Business Name</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingBusiness.title || ""}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingBusiness.description || ""}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={editingBusiness.phone || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      defaultValue={editingBusiness.website || ""}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editingBusiness.address || ""}
                  />
                </div>

                {/* SEO Section */}
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-semibold mb-3">SEO Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="seotitle">SEO Title</Label>
                      <Input
                        id="seotitle"
                        name="seotitle"
                        defaultValue={editingBusiness.seotitle || ""}
                        placeholder="Enter custom SEO title (auto-generated if empty)"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 50-60 characters. Leave empty for auto-generation.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="seodescription">SEO Description</Label>
                      <Textarea
                        id="seodescription"
                        name="seodescription"
                        defaultValue={editingBusiness.seodescription || ""}
                        placeholder="Enter custom SEO description (auto-generated if empty)"
                        rows={3}
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 150-160 characters. Leave empty for auto-generation.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="slug">SEO URL Slug</Label>
                      <Input
                        id="slug"
                        name="slug"
                        defaultValue={editingBusiness.slug || ""}
                        placeholder="custom-url-slug (auto-generated if empty)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL-friendly version: /business/{editingBusiness.slug || 'auto-generated-slug'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={updateBusinessMutation.isPending}
                    className="flex-1"
                  >
                    {updateBusinessMutation.isPending ? "Updating..." : "Update Business"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingBusiness(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Footer />
    </div>
  );
}