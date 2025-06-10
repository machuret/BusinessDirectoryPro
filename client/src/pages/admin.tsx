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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Palette,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Eye,
  Search
} from "lucide-react";
import type { BusinessWithCategory, CategoryWithCount, User, SiteSetting } from "@shared/schema";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isCreateBusinessModalOpen, setIsCreateBusinessModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [businessSearchTerm, setBusinessSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "fas fa-building",
    color: "#1565C0",
  });

  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
  });

  const [businessForm, setBusinessForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
  });

  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/admin/businesses"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: siteSettings, isLoading: settingsLoading } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/site-settings"],
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

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User has been successfully updated!",
      });
      setIsEditUserModalOpen(false);
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User has been successfully deleted!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (businessData: any) => {
      await apiRequest("POST", "/api/businesses", businessData);
    },
    onSuccess: () => {
      toast({
        title: "Business created",
        description: "New business has been successfully created!",
      });
      setIsCreateBusinessModalOpen(false);
      setBusinessForm({
        name: "",
        description: "",
        categoryId: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        email: "",
        website: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
    },
    onError: (error) => {
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleVerifyMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: number; verified: boolean }) => {
      await apiRequest("PATCH", `/api/admin/businesses/${id}/verify`, { verified });
    },
    onSuccess: () => {
      toast({
        title: "Business updated",
        description: "Business verification status has been updated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      await apiRequest("PATCH", `/api/admin/businesses/${id}/status`, { active });
    },
    onSuccess: () => {
      toast({
        title: "Business updated",
        description: "Business status has been updated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBusinessMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/businesses/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Business deleted",
        description: "Business has been successfully deleted!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSiteSettingMutation = useMutation({
    mutationFn: async ({ key, value, description, category }: { key: string; value: any; description?: string; category?: string }) => {
      await apiRequest("PATCH", `/api/admin/site-settings/${key}`, { value, description, category });
    },
    onSuccess: () => {
      toast({
        title: "Setting updated",
        description: "Site setting has been successfully updated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
    },
    onError: (error) => {
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

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    createBusinessMutation.mutate({
      ...businessForm,
      categoryId: parseInt(businessForm.categoryId),
    });
  };

  const openEditUserModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setUserForm({
      firstName: userToEdit.firstName || "",
      lastName: userToEdit.lastName || "",
      email: userToEdit.email || "",
      role: userToEdit.role,
    });
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        data: userForm,
      });
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

  const filteredBusinesses = businesses?.filter(business =>
    business.name.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
    business.city.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
    business.category.name.toLowerCase().includes(businessSearchTerm.toLowerCase())
  );

  const filteredUsers = users?.filter(user =>
    user.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const stats = {
    totalBusinesses: businesses?.length || 0,
    featuredBusinesses: businesses?.filter(b => b.featured).length || 0,
    totalCategories: categories?.length || 0,
    totalUsers: users?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage users, businesses, categories, and system settings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="businesses">Business Management</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="templates">Template Manager</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    User Management
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.createdAt!).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditUserModal(user)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {user.id !== user?.id && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="destructive">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this user? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteUserMutation.mutate(user.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Management Tab */}
          <TabsContent value="businesses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Business Management
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search businesses..."
                        value={businessSearchTerm}
                        onChange={(e) => setBusinessSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Dialog open={isCreateBusinessModalOpen} onOpenChange={setIsCreateBusinessModalOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Business
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New Business</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateBusiness} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="business-name">Business Name</Label>
                              <Input
                                id="business-name"
                                required
                                value={businessForm.name}
                                onChange={(e) => setBusinessForm(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="business-category">Category</Label>
                              <Select
                                value={businessForm.categoryId}
                                onValueChange={(value) => setBusinessForm(prev => ({ ...prev, categoryId: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
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
                            <Label htmlFor="business-description">Description</Label>
                            <Input
                              id="business-description"
                              required
                              value={businessForm.description}
                              onChange={(e) => setBusinessForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="business-address">Address</Label>
                            <Input
                              id="business-address"
                              required
                              value={businessForm.address}
                              onChange={(e) => setBusinessForm(prev => ({ ...prev, address: e.target.value }))}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="business-city">City</Label>
                              <Input
                                id="business-city"
                                required
                                value={businessForm.city}
                                onChange={(e) => setBusinessForm(prev => ({ ...prev, city: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="business-state">State</Label>
                              <Input
                                id="business-state"
                                required
                                value={businessForm.state}
                                onChange={(e) => setBusinessForm(prev => ({ ...prev, state: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="business-zipcode">ZIP Code</Label>
                              <Input
                                id="business-zipcode"
                                required
                                value={businessForm.zipCode}
                                onChange={(e) => setBusinessForm(prev => ({ ...prev, zipCode: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="business-phone">Phone</Label>
                              <Input
                                id="business-phone"
                                value={businessForm.phone}
                                onChange={(e) => setBusinessForm(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="business-email">Email</Label>
                              <Input
                                id="business-email"
                                type="email"
                                value={businessForm.email}
                                onChange={(e) => setBusinessForm(prev => ({ ...prev, email: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="business-website">Website</Label>
                            <Input
                              id="business-website"
                              value={businessForm.website}
                              onChange={(e) => setBusinessForm(prev => ({ ...prev, website: e.target.value }))}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsCreateBusinessModalOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createBusinessMutation.isPending}>
                              {createBusinessMutation.isPending ? "Creating..." : "Create Business"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {businessesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBusinesses?.map((business) => (
                          <TableRow key={business.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{business.name}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  {business.featured && (
                                    <Badge variant="default" className="text-xs">Featured</Badge>
                                  )}
                                  {business.verified && (
                                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                                  )}
                                  {!business.active && (
                                    <Badge variant="destructive" className="text-xs">Inactive</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{business.category.name}</Badge>
                            </TableCell>
                            <TableCell>{business.city}, {business.state}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Label htmlFor={`featured-${business.id}`} className="text-xs">Featured</Label>
                                  <Switch
                                    id={`featured-${business.id}`}
                                    checked={business.featured}
                                    onCheckedChange={(featured) => 
                                      toggleFeatureMutation.mutate({ id: business.id, featured })
                                    }
                                  />
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Label htmlFor={`verified-${business.id}`} className="text-xs">Verified</Label>
                                  <Switch
                                    id={`verified-${business.id}`}
                                    checked={business.verified}
                                    onCheckedChange={(verified) => 
                                      toggleVerifyMutation.mutate({ id: business.id, verified })
                                    }
                                  />
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Label htmlFor={`active-${business.id}`} className="text-xs">Active</Label>
                                  <Switch
                                    id={`active-${business.id}`}
                                    checked={business.active}
                                    onCheckedChange={(active) => 
                                      toggleActiveMutation.mutate({ id: business.id, active })
                                    }
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`/business/${business.slug}`, '_blank')}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Business</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{business.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteBusinessMutation.mutate(business.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
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
          </TabsContent>

          {/* Template Management Tab */}
          <TabsContent value="templates">
            <div className="space-y-6">
              {/* Theme Colors Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Theme Colors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {settingsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {siteSettings?.filter(setting => setting.category === 'theme').map((setting) => (
                        <div key={setting.key} className="space-y-2">
                          <Label htmlFor={setting.key}>
                            {setting.description || setting.key.replace('theme_', '').replace('_', ' ')}
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id={setting.key}
                              type="color"
                              value={JSON.parse(setting.value as string)}
                              onChange={(e) => {
                                updateSiteSettingMutation.mutate({
                                  key: setting.key,
                                  value: e.target.value,
                                  description: setting.description,
                                  category: setting.category,
                                });
                              }}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={JSON.parse(setting.value as string)}
                              onChange={(e) => {
                                updateSiteSettingMutation.mutate({
                                  key: setting.key,
                                  value: e.target.value,
                                  description: setting.description,
                                  category: setting.category,
                                });
                              }}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Homepage Content Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit className="w-5 h-5 mr-2" />
                    Homepage Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {settingsLoading ? (
                    <div className="space-y-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4" />
                          <div className="h-10 bg-gray-200 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Hero Section */}
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Hero Section</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label htmlFor="hero_title">Main Title</Label>
                            <Input
                              id="hero_title"
                              value={JSON.parse(siteSettings?.find(s => s.key === 'homepage_hero_title')?.value as string || '""')}
                              onChange={(e) => {
                                updateSiteSettingMutation.mutate({
                                  key: 'homepage_hero_title',
                                  value: e.target.value,
                                  description: 'Main hero section title',
                                  category: 'homepage',
                                });
                              }}
                              placeholder="Find Local Businesses"
                            />
                          </div>
                          <div>
                            <Label htmlFor="hero_subtitle">Subtitle</Label>
                            <Input
                              id="hero_subtitle"
                              value={JSON.parse(siteSettings?.find(s => s.key === 'homepage_hero_subtitle')?.value as string || '""')}
                              onChange={(e) => {
                                updateSiteSettingMutation.mutate({
                                  key: 'homepage_hero_subtitle',
                                  value: e.target.value,
                                  description: 'Hero section subtitle',
                                  category: 'homepage',
                                });
                              }}
                              placeholder="Discover and connect with trusted local businesses..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Features Section */}
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Features Section</h3>
                        <div>
                          <Label htmlFor="features_title">Features Section Title</Label>
                          <Input
                            id="features_title"
                            value={JSON.parse(siteSettings?.find(s => s.key === 'homepage_features_title')?.value as string || '""')}
                            onChange={(e) => {
                              updateSiteSettingMutation.mutate({
                                key: 'homepage_features_title',
                                value: e.target.value,
                                description: 'Features section title',
                                category: 'homepage',
                              });
                            }}
                            placeholder="Why Choose BusinessHub?"
                          />
                        </div>
                        
                        {/* Feature Blocks */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[1, 2, 3].map((num) => (
                            <div key={num} className="space-y-2 p-3 border rounded">
                              <Label htmlFor={`feature_${num}_title`}>Feature {num} Title</Label>
                              <Input
                                id={`feature_${num}_title`}
                                value={JSON.parse(siteSettings?.find(s => s.key === `homepage_feature_${num}_title`)?.value as string || '""')}
                                onChange={(e) => {
                                  updateSiteSettingMutation.mutate({
                                    key: `homepage_feature_${num}_title`,
                                    value: e.target.value,
                                    description: `Feature ${num} block title`,
                                    category: 'homepage',
                                  });
                                }}
                                placeholder={`Feature ${num} Title`}
                              />
                              <Label htmlFor={`feature_${num}_description`}>Feature {num} Description</Label>
                              <Input
                                id={`feature_${num}_description`}
                                value={JSON.parse(siteSettings?.find(s => s.key === `homepage_feature_${num}_description`)?.value as string || '""')}
                                onChange={(e) => {
                                  updateSiteSettingMutation.mutate({
                                    key: `homepage_feature_${num}_description`,
                                    value: e.target.value,
                                    description: `Feature ${num} block description`,
                                    category: 'homepage',
                                  });
                                }}
                                placeholder={`Feature ${num} description...`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preview Section */}
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h3 className="font-semibold text-lg">Live Preview</h3>
                        <div className="p-6 bg-white rounded-lg border shadow-sm">
                          <div className="text-center space-y-4">
                            <h1 className="text-4xl font-bold text-gray-900">
                              {JSON.parse(siteSettings?.find(s => s.key === 'homepage_hero_title')?.value as string || '"Find Local Businesses"')}
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                              {JSON.parse(siteSettings?.find(s => s.key === 'homepage_hero_subtitle')?.value as string || '"Discover and connect with trusted local businesses in your area."')}
                            </p>
                          </div>
                          
                          <div className="mt-12">
                            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                              {JSON.parse(siteSettings?.find(s => s.key === 'homepage_features_title')?.value as string || '"Why Choose BusinessHub?"')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              {[1, 2, 3].map((num) => (
                                <div key={num} className="text-center">
                                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {JSON.parse(siteSettings?.find(s => s.key === `homepage_feature_${num}_title`)?.value as string || `"Feature ${num}"`)}
                                  </h3>
                                  <p className="text-gray-600">
                                    {JSON.parse(siteSettings?.find(s => s.key === `homepage_feature_${num}_description`)?.value as string || `"Feature ${num} description"`)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit User Modal */}
        <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-firstName">First Name</Label>
                  <Input
                    id="user-firstName"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="user-lastName">Last Name</Label>
                  <Input
                    id="user-lastName"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="user-role">Role</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="business_owner">Business Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditUserModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Footer />
    </div>
  );
}