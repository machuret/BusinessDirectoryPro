import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, XCircle, Search, Filter, Star, MapPin, Phone, Globe, ExternalLink, MessageSquare, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";

interface Business {
  placeid: string;
  title: string;
  categoryname: string;
  city: string;
  featured: boolean;
  createdat: string;
  description?: string;
}

interface FeaturedRequest {
  id: number;
  businessId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  adminMessage?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  businessTitle?: string;
  businessCity?: string;
  businessDescription?: string;
  businessRating?: number;
  businessCategoryName?: string;
  businessPhone?: string;
  businessWebsite?: string;
  businessAddress?: string;
  businessReviewCount?: number;
}

export function FeaturedManagement() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<FeaturedRequest | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: allBusinesses } = useQuery<Business[]>({
    queryKey: ["/api/admin/businesses"],
  });

  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch featured requests with comprehensive business details
  const { data: featuredRequests = [], isLoading: requestsLoading } = useQuery<FeaturedRequest[]>({
    queryKey: ["/api/featured-requests/admin"],
  });

  const featuredBusinesses = allBusinesses?.filter(business => business.featured) || [];

  const addFeaturedMutation = useMutation({
    mutationFn: async (businessId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/businesses/${businessId}`, { featured: true });
      if (!res.ok) {
        throw new Error(`Failed to add featured status: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: (data, businessId) => {
      // Invalidate and refetch both businesses and featured requests
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses/featured"] });
      
      // Force refetch to ensure UI updates immediately
      queryClient.refetchQueries({ queryKey: ["/api/admin/businesses"] });
      
      toast({ title: "Success", description: "Business added to featured listings" });
      setShowAddDialog(false);
      setSelectedBusiness("");
    },
    onError: (error: Error) => {
      console.error("Add featured mutation error:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add business to featured listings", 
        variant: "destructive" 
      });
    }
  });

  const removeFeaturedMutation = useMutation({
    mutationFn: async (businessId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/businesses/${businessId}`, { featured: false });
      if (!res.ok) {
        throw new Error(`Failed to remove featured status: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: (data, businessId) => {
      // Invalidate and refetch both businesses and featured requests
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses/featured"] });
      
      // Force refetch to ensure UI updates immediately
      queryClient.refetchQueries({ queryKey: ["/api/admin/businesses"] });
      
      toast({ title: "Success", description: "Business removed from featured listings" });
      setRemoveConfirmId(null);
    },
    onError: (error: Error) => {
      console.error("Remove featured mutation error:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to remove business from featured listings", 
        variant: "destructive" 
      });
      setRemoveConfirmId(null);
    }
  });

  // Review featured request mutation
  const reviewRequestMutation = useMutation({
    mutationFn: async ({ id, status, adminMessage }: { id: number; status: 'approved' | 'rejected'; adminMessage?: string }) => {
      const res = await apiRequest("PUT", `/api/featured-requests/${id}/review`, {
        status,
        adminMessage,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/featured-requests/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({
        title: "Success",
        description: "Featured request reviewed successfully",
      });
      setSelectedRequest(null);
      setAdminMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getAvailableBusinesses = () => {
    if (!allBusinesses) return [];
    
    return allBusinesses.filter(business => {
      const notFeatured = !business.featured;
      const matchesSearch = searchTerm === "" || 
        business.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || business.categoryname === selectedCategory;
      
      return notFeatured && matchesSearch && matchesCategory;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Featured Listings Management</CardTitle>
          <CardDescription>Manage which businesses appear as featured on the homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold" id="featured-businesses-title">
                Currently Featured ({featuredBusinesses.length})
              </h3>
              <Button 
                onClick={() => setShowAddDialog(true)}
                aria-label="Add new featured business"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Add Featured Business
              </Button>
            </div>
            
            {featuredBusinesses.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Featured Since</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featuredBusinesses.map((business) => (
                      <TableRow key={business.placeid}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{business.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {business.description ? business.description.substring(0, 50) + '...' : 'No description'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{business.categoryname}</Badge>
                        </TableCell>
                        <TableCell>{business.city}</TableCell>
                        <TableCell>{new Date(business.createdat).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              console.log('Remove button clicked for business:', business.placeid);
                              setRemoveConfirmId(business.placeid);
                            }}
                            disabled={removeFeaturedMutation.isPending}
                            aria-label={`Remove ${business.title} from featured listings`}
                          >
                            {removeFeaturedMutation.isPending && removeConfirmId === business.placeid ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No featured businesses yet. Add some to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Featured Business Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Featured Business</DialogTitle>
            <DialogDescription>
              Search and select a business to feature on the homepage
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search">Search Businesses</Label>
                <Input
                  id="search"
                  placeholder="Search by business name or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-48">
                <Label htmlFor="category">Filter by Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto border rounded">
              {getAvailableBusinesses().length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getAvailableBusinesses().map((business) => (
                      <TableRow key={business.placeid}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{business.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {business.description ? business.description.substring(0, 40) + '...' : 'No description'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{business.categoryname}</Badge>
                        </TableCell>
                        <TableCell>{business.city}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => addFeaturedMutation.mutate(business.placeid)}
                            disabled={addFeaturedMutation.isPending}
                          >
                            Add Featured
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || selectedCategory ? 'No businesses match your search criteria' : 'All businesses are already featured'}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Featured Requests Review Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Featured Requests Review
          </CardTitle>
          <CardDescription>
            Review and approve business featured requests with comprehensive business information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {requestsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="h-6 w-6 animate-spin mr-2" />
                Loading requests...
              </div>
            ) : featuredRequests.filter(req => statusFilter === 'all' || req.status === statusFilter).length > 0 ? (
              <div className="space-y-4">
                {featuredRequests.filter(req => statusFilter === 'all' || req.status === statusFilter).map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Request Information */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={
                                request.status === 'pending' ? 'default' :
                                request.status === 'approved' ? 'default' : 'destructive'
                              }
                              className={
                                request.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' : ''
                              }
                            >
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="font-medium">User Message:</div>
                            <div className="text-sm bg-muted p-3 rounded">
                              {request.message || 'No message provided'}
                            </div>
                          </div>

                          {request.adminMessage && (
                            <div className="space-y-2">
                              <div className="font-medium">Admin Response:</div>
                              <div className="text-sm bg-blue-50 p-3 rounded border-l-4 border-l-blue-500">
                                {request.adminMessage}
                              </div>
                            </div>
                          )}

                          {request.status === 'pending' && (
                            <div className="flex gap-2 pt-4">
                              <Button
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setAdminMessage("Request rejected");
                                }}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Business Information */}
                        <div className="border rounded-lg p-4 bg-muted/30">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{request.businessTitle}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  {request.businessCity}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <a 
                                  href={`/business/${request.businessId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  View Page
                                </a>
                              </Button>
                            </div>

                            {request.businessDescription && (
                              <div className="text-sm">
                                <div className="font-medium mb-1">Description:</div>
                                <p className="text-muted-foreground line-clamp-3">
                                  {request.businessDescription}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="font-medium">Category:</div>
                                <Badge variant="outline" className="mt-1">
                                  {request.businessCategoryName}
                                </Badge>
                              </div>
                              <div>
                                <div className="font-medium">Rating:</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">
                                    {request.businessRating ? request.businessRating.toFixed(1) : 'No rating'}
                                  </span>
                                  <span className="text-muted-foreground">
                                    ({request.businessReviewCount || 0} reviews)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {(request.businessPhone || request.businessWebsite) && (
                              <div className="space-y-2 pt-2 border-t">
                                {request.businessPhone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4" />
                                    <span>{request.businessPhone}</span>
                                  </div>
                                )}
                                {request.businessWebsite && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Globe className="h-4 w-4" />
                                    <a 
                                      href={request.businessWebsite}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {request.businessWebsite}
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {request.businessAddress && (
                              <div className="text-sm pt-2 border-t">
                                <div className="font-medium">Address:</div>
                                <div className="text-muted-foreground">{request.businessAddress}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {statusFilter === 'all' ? 'No featured requests found' : `No ${statusFilter} requests found`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Request Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Featured Request</DialogTitle>
            <DialogDescription>
              {selectedRequest && `Review request for ${selectedRequest.businessTitle}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-message">Admin Message (Optional)</Label>
              <Textarea
                id="admin-message"
                placeholder="Add a message for the business owner..."
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedRequest(null);
                setAdminMessage("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && reviewRequestMutation.mutate({
                id: selectedRequest.id,
                status: 'rejected',
                adminMessage: adminMessage || undefined
              })}
              disabled={reviewRequestMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => selectedRequest && reviewRequestMutation.mutate({
                id: selectedRequest.id,
                status: 'approved',
                adminMessage: adminMessage || undefined
              })}
              disabled={reviewRequestMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={!!removeConfirmId} onOpenChange={() => setRemoveConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Featured Business</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this business from featured listings?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveConfirmId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (removeConfirmId) {
                  console.log('Executing remove mutation for business:', removeConfirmId);
                  removeFeaturedMutation.mutate(removeConfirmId);
                }
              }}
              disabled={removeFeaturedMutation.isPending}
            >
              {removeFeaturedMutation.isPending ? 'Removing...' : 'Remove Featured'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default export compatibility layer
export default FeaturedManagement;