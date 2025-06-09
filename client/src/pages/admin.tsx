import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Plus,
  Star,
  Users,
  Building,
  Settings,
  BarChart3,
  Palette
} from "lucide-react";
import type { BusinessWithCategory, CategoryWithCount } from "@shared/schema";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "fas fa-building",
    color: "#1565C0",
  });

  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      await apiRequest("POST", "/api/categories", categoryData);
    },
    onSuccess: () => {
      toast({
        title: "Category created",
        description: "New category has been successfully created!",
      });
      setIsCreateCategoryModalOpen(false);
      setCategoryForm({
        name: "",
        slug: "",
        description: "",
        icon: "fas fa-building",
        color: "#1565C0",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
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

  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      await apiRequest("PATCH", `/api/admin/businesses/${id}/feature`, { featured });
    },
    onSuccess: () => {
      toast({
        title: "Business updated",
        description: "Business feature status has been updated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
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

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate slug from name if not provided
    const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    createCategoryMutation.mutate({
      ...categoryForm,
      slug,
    });
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

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You need admin privileges to access this page.</p>
          <Button onClick={() => window.location.href = "/"}>
            Back to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = {
    totalBusinesses: businesses?.length || 0,
    featuredBusinesses: businesses?.filter(b => b.featured).length || 0,
    totalCategories: categories?.length || 0,
    averageRating: businesses?.length 
      ? (businesses.reduce((sum, b) => sum + parseFloat(b.averageRating || "0"), 0) / businesses.length).toFixed(1)
      : "0.0",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage the business directory, categories, and featured listings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-primary mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBusinesses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.featuredBusinesses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Categories Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Categories</CardTitle>
                <Dialog open={isCreateCategoryModalOpen} onOpenChange={setIsCreateCategoryModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <div>
                        <Label htmlFor="category-name">Name</Label>
                        <Input
                          id="category-name"
                          required
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-slug">Slug (optional)</Label>
                        <Input
                          id="category-slug"
                          value={categoryForm.slug}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="Will be generated from name if empty"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-description">Description</Label>
                        <Input
                          id="category-description"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-icon">Icon Class</Label>
                        <Input
                          id="category-icon"
                          value={categoryForm.icon}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                          placeholder="e.g., fas fa-utensils"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-color">Color</Label>
                        <Input
                          id="category-color"
                          type="color"
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateCategoryModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createCategoryMutation.isPending}>
                          {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded flex items-center justify-center"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          <i className={`${category.icon} text-sm`} style={{ color: category.color }}></i>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-600">{category.businessCount} businesses</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Palette className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">No categories yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Management */}
          <Card>
            <CardHeader>
              <CardTitle>Business Management</CardTitle>
            </CardHeader>
            <CardContent>
              {businessesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/3" />
                      <div className="h-3 bg-gray-200 rounded mb-3 w-full" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : businesses && businesses.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {businesses.slice(0, 10).map((business) => (
                    <div key={business.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{business.name}</h4>
                            <Badge variant="outline" className="text-xs">{business.category.name}</Badge>
                            {business.verified && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{business.city}, {business.state}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>{parseFloat(business.averageRating || "0").toFixed(1)}</span>
                            </span>
                            <span>{business.totalReviews} reviews</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`featured-${business.id}`} className="text-xs">Featured</Label>
                            <Switch
                              id={`featured-${business.id}`}
                              checked={business.featured}
                              onCheckedChange={(featured) => 
                                toggleFeatureMutation.mutate({ id: business.id, featured })
                              }
                              disabled={toggleFeatureMutation.isPending}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {businesses.length > 10 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-600">Showing first 10 businesses...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">No businesses yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
