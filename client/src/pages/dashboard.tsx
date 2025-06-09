import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Building,
  BarChart3
} from "lucide-react";
import type { BusinessWithCategory, Category } from "@shared/schema";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithCategory | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
  });

  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: [`/api/businesses/owner/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (businessData: any) => {
      await apiRequest("POST", "/api/businesses", businessData);
    },
    onSuccess: () => {
      toast({
        title: "Business created",
        description: "Your business has been successfully listed!",
      });
      setIsCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/owner/${user?.id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/businesses/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Business updated",
        description: "Your business has been successfully updated!",
      });
      setEditingBusiness(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/owner/${user?.id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/businesses/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Business deleted",
        description: "Your business has been removed from the directory.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/owner/${user?.id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      website: "",
    });
  };

  const openEditModal = (business: BusinessWithCategory) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      categoryId: business.categoryId.toString(),
      description: business.description,
      address: business.address,
      city: business.city,
      state: business.state,
      zipCode: business.zipCode,
      phone: business.phone || "",
      email: business.email || "",
      website: business.website || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const businessData = {
      ...formData,
      categoryId: parseInt(formData.categoryId),
    };

    if (editingBusiness) {
      updateMutation.mutate({ id: editingBusiness.id, data: businessData });
    } else {
      createMutation.mutate(businessData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-8">You need to be signed in to access the dashboard.</p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Sign In
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName}! Manage your business listings and track performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-primary mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {businesses?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {businesses?.length 
                      ? (businesses.reduce((sum, b) => sum + parseFloat(b.averageRating || "0"), 0) / businesses.length).toFixed(1)
                      : "0.0"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {businesses?.reduce((sum, b) => sum + (b.totalReviews || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Businesses List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Businesses</CardTitle>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Business</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Business Name</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={formData.categoryId} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          required
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          required
                          value={formData.zipCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsCreateModalOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Creating..." : "Create Business"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {businessesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/3" />
                    <div className="h-3 bg-gray-200 rounded mb-3 w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : businesses && businesses.length > 0 ? (
              <div className="space-y-4">
                {businesses.map((business) => (
                  <div key={business.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{business.name}</h3>
                          <Badge variant="outline">{business.category.name}</Badge>
                          {business.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                          )}
                          {business.verified && (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{business.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{business.city}, {business.state}</span>
                          </div>
                          {business.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{business.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4" />
                            <span>{parseFloat(business.averageRating || "0").toFixed(1)} ({business.totalReviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/business/${business.slug}`}
                        >
                          View
                        </Button>
                        <Dialog 
                          open={editingBusiness?.id === business.id} 
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingBusiness(null);
                              resetForm();
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(business)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Business</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit-name">Business Name</Label>
                                  <Input
                                    id="edit-name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-category">Category</Label>
                                  <Select 
                                    value={formData.categoryId} 
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                                    required
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories?.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                  id="edit-description"
                                  required
                                  value={formData.description}
                                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                  rows={3}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-address">Address</Label>
                                <Input
                                  id="edit-address"
                                  required
                                  value={formData.address}
                                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="edit-city">City</Label>
                                  <Input
                                    id="edit-city"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-state">State</Label>
                                  <Input
                                    id="edit-state"
                                    required
                                    value={formData.state}
                                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-zipCode">ZIP Code</Label>
                                  <Input
                                    id="edit-zipCode"
                                    required
                                    value={formData.zipCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="edit-phone">Phone</Label>
                                  <Input
                                    id="edit-phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-email">Email</Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-website">Website</Label>
                                  <Input
                                    id="edit-website"
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => {
                                    setEditingBusiness(null);
                                    resetForm();
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                  {updateMutation.isPending ? "Updating..." : "Update Business"}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this business?")) {
                              deleteMutation.mutate(business.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No businesses yet</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first business listing.</p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Business
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
