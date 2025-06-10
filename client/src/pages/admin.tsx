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
import { AlertTriangle, Upload, Users, Building2, Settings, FileText, Star, Menu } from "lucide-react";
import type { BusinessWithCategory, User, Category, SiteSetting, MenuItem } from "@shared/schema";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("businesses");
  const [businessSearchTerm, setBusinessSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deleteBusinessId, setDeleteBusinessId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithCategory | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [selectedMenuPosition, setSelectedMenuPosition] = useState<string>("header");

  // Data queries
  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/admin/businesses"],
    enabled: !!user?.role && user.role === 'admin'
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.role && user.role === 'admin'
  });

  const { data: ownershipClaims, isLoading: claimsLoading } = useQuery<any[]>({
    queryKey: ["/api/ownership-claims"],
    enabled: !!user?.role && user.role === 'admin'
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });

  // Category management mutations
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/admin/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: siteSettings } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/site-settings"],
    enabled: !!user?.role && user.role === 'admin'
  });

  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/admin/menus"],
    enabled: !!user?.role && user.role === 'admin'
  });

  // CSV Import mutation
  const csvImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/import/businesses', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({
        title: "Import Successful",
        description: `Imported ${data.success} businesses with ${data.errors?.length || 0} errors.`,
      });
      setUploadProgress(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(null);
    },
  });

  // Business mutations
  const deleteBusinessMutation = useMutation({
    mutationFn: async (placeid: string) => {
      await apiRequest("DELETE", `/api/admin/businesses/${placeid}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Business deleted successfully" });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ placeid, featured }: { placeid: string; featured: boolean }) => {
      await apiRequest("PATCH", `/api/admin/businesses/${placeid}`, { featured: !featured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
    },
  });

  // Ownership claim mutations
  const processClaimMutation = useMutation({
    mutationFn: async ({ id, status, adminMessage }: { id: number; status: string; adminMessage?: string }) => {
      await apiRequest("PATCH", `/api/ownership-claims/${id}`, { status, adminMessage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ownership-claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Ownership claim processed successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error processing claim",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Business update mutation
  const updateBusinessMutation = useMutation({
    mutationFn: async (params: { id: string; featured?: boolean; data?: any }) => {
      const updateData = params.featured !== undefined ? { featured: params.featured } : params.data;
      await apiRequest("PATCH", `/api/businesses/${params.id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses/featured"] });
      setEditingBusiness(null);
      setShowBusinessForm(false);
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

  // User mutations
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<User> }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
      setShowUserForm(false);
    },
  });

  // Site settings mutations
  const updateSiteSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await apiRequest("PATCH", `/api/admin/site-settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      toast({ title: "Setting updated successfully" });
    },
  });

  // Menu management mutations
  const createMenuItemMutation = useMutation({
    mutationFn: async (menuItemData: { name: string; url: string; position: string; order: number }) => {
      await apiRequest("POST", "/api/admin/menus", menuItemData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menus"] });
      toast({ title: "Menu item created successfully" });
      setShowMenuForm(false);
      setEditingMenuItem(null);
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MenuItem> }) => {
      await apiRequest("PATCH", `/api/admin/menus/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menus"] });
      toast({ title: "Menu item updated successfully" });
      setShowMenuForm(false);
      setEditingMenuItem(null);
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/menus/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menus"] });
      toast({ title: "Menu item deleted successfully" });
    },
  });

  // Handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setUploadProgress(0);
      csvImportMutation.mutate(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const editBusiness = (business: BusinessWithCategory) => {
    setEditingBusiness(business);
    setShowBusinessForm(true);
  };

  const handleUpdateBusiness = (formData: FormData) => {
    if (!editingBusiness) return;

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      phone: formData.get("phone"),
      website: formData.get("website"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      postalcode: formData.get("postalcode"),
      categoryname: formData.get("categoryname"),
      seotitle: formData.get("seotitle") || null,
      seodescription: formData.get("seodescription") || null,
    };

    updateBusinessMutation.mutate({
      id: editingBusiness.placeid,
      data
    });
  };

  const editUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  // Auth check
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Access Denied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need administrator privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredBusinesses = businesses?.filter(business =>
    (business.title || '').toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
    (business.city || '').toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
    (business.categoryname || '').toLowerCase().includes(businessSearchTerm.toLowerCase())
  );

  const filteredUsers = users?.filter(user =>
    user.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage businesses, users, and site settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="businesses" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Businesses</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Ownership Claims</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Featured</span>
          </TabsTrigger>
          <TabsTrigger value="menus" className="flex items-center space-x-2">
            <Menu className="h-4 w-4" />
            <span>Menus</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Businesses Tab */}
        <TabsContent value="businesses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Management</CardTitle>
              <CardDescription>Manage business listings and their details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Search businesses..."
                  value={businessSearchTerm}
                  onChange={(e) => setBusinessSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={() => setShowBusinessForm(true)}>Add Business</Button>
              </div>

              {businessesLoading ? (
                <p>Loading businesses...</p>
              ) : (
                <div className="rounded-md border">
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
                        <TableRow key={business.placeid}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{business.title}</p>
                              <p className="text-sm text-muted-foreground">{business.subtitle}</p>
                            </div>
                          </TableCell>
                          <TableCell>{business.categoryname || 'No Category'}</TableCell>
                          <TableCell>{business.city}, {business.state}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {business.featured && (
                                <Badge variant="default">Featured</Badge>
                              )}
                              {business.permanentlyclosed && (
                                <Badge variant="destructive">Closed</Badge>
                              )}
                              {business.temporarilyclosed && (
                                <Badge variant="secondary">Temp Closed</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleFeaturedMutation.mutate({ 
                                  placeid: business.placeid, 
                                  featured: business.featured || false 
                                })}
                              >
                                {business.featured ? 'Unfeature' : 'Feature'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editBusiness(business)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this business?')) {
                                    deleteBusinessMutation.mutate(business.placeid);
                                  }
                                }}
                              >
                                Delete
                              </Button>
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

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {usersLoading ? (
                <p>Loading users...</p>
              ) : (
                <div className="rounded-md border">
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
                          <TableCell>
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editUser(user)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this user?')) {
                                    deleteUserMutation.mutate(user.id);
                                  }
                                }}
                              >
                                Delete
                              </Button>
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
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>Edit category titles and descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {!categories ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No categories found.
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="border">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: category.color || '#6366f1' }}
                              />
                              <h3 className="font-semibold text-lg">{category.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                ID: {category.id}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Category Title</label>
                              <input
                                type="text"
                                defaultValue={category.name}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onBlur={(e) => {
                                  if (e.target.value !== category.name) {
                                    updateCategoryMutation.mutate({
                                      id: category.id,
                                      data: { name: e.target.value }
                                    });
                                  }
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Color</label>
                              <input
                                type="color"
                                defaultValue={category.color || '#6366f1'}
                                className="w-full h-10 border border-gray-300 rounded-md"
                                onChange={(e) => {
                                  updateCategoryMutation.mutate({
                                    id: category.id,
                                    data: { color: e.target.value }
                                  });
                                }}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                              defaultValue={category.description || ''}
                              placeholder="Enter category description..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                              onBlur={(e) => {
                                if (e.target.value !== (category.description || '')) {
                                  updateCategoryMutation.mutate({
                                    id: category.id,
                                    data: { description: e.target.value }
                                  });
                                }
                              }}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-sm text-gray-500">
                              Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updateCategoryMutation.isPending}
                              >
                                {updateCategoryMutation.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </div>
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
              <CardTitle>Business Ownership Claims</CardTitle>
              <CardDescription>Review and manage business ownership requests</CardDescription>
            </CardHeader>
            <CardContent>
              {claimsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !ownershipClaims || ownershipClaims.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No ownership claims found.
                </div>
              ) : (
                <div className="space-y-4">
                  {ownershipClaims.map((claim: any) => (
                    <Card key={claim.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">Business ID: {claim.businessId}</h3>
                              <Badge variant={
                                claim.status === 'pending' ? 'default' :
                                claim.status === 'approved' ? 'default' :
                                'destructive'
                              }>
                                {claim.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>Requester:</strong> {claim.userId}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Message:</strong> {claim.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                            </p>
                            {claim.adminMessage && (
                              <p className="text-sm text-gray-600">
                                <strong>Admin Response:</strong> {claim.adminMessage}
                              </p>
                            )}
                          </div>
                          {claim.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Review Ownership Claim</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <p><strong>Business ID:</strong> {claim.businessId}</p>
                                      <p><strong>Requester:</strong> {claim.userId}</p>
                                      <p><strong>Message:</strong> {claim.message}</p>
                                    </div>
                                    <div>
                                      <Label htmlFor="admin-response">Admin Response (Optional)</Label>
                                      <Textarea
                                        id="admin-response"
                                        placeholder="Add a message for the user..."
                                        onChange={(e) => {
                                          // Store response in state if needed
                                        }}
                                      />
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={() => {
                                          const textarea = document.getElementById('admin-response') as HTMLTextAreaElement;
                                          processClaimMutation.mutate({
                                            id: claim.id,
                                            status: 'approved',
                                            adminMessage: textarea?.value || undefined
                                          });
                                        }}
                                        className="flex-1"
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => {
                                          const textarea = document.getElementById('admin-response') as HTMLTextAreaElement;
                                          processClaimMutation.mutate({
                                            id: claim.id,
                                            status: 'rejected',
                                            adminMessage: textarea?.value || 'Claim rejected by admin.'
                                          });
                                        }}
                                        className="flex-1"
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV Import</CardTitle>
              <CardDescription>Import business data from CSV files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={csvImportMutation.isPending}
                  />
                </div>
                
                {csvImportMutation.isPending && (
                  <div className="space-y-2">
                    <p>Importing businesses...</p>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>CSV should include columns like: placeid, title, description, categoryname, city, state, etc.</p>
                  <p>Total businesses: {businesses?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>Configure site-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {siteSettings?.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <Label>{setting.key}</Label>
                    <div className="flex space-x-2">
                      <Input
                        defaultValue={setting.value || ''}
                        onBlur={(e) => {
                          if (e.target.value !== setting.value) {
                            updateSiteSettingMutation.mutate({
                              key: setting.key,
                              value: e.target.value
                            });
                          }
                        }}
                      />
                    </div>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Businesses Tab */}
        <TabsContent value="featured" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured Business Management</CardTitle>
              <CardDescription>Control which businesses are featured on the homepage and how many to display</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Featured Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxFeatured">Maximum Featured Businesses</Label>
                    <Input
                      id="maxFeatured"
                      type="number" 
                      min="1"
                      max="20"
                      defaultValue="6"
                      className="max-w-xs"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button>Update Settings</Button>
                  </div>
                </div>

                {/* Featured Business List */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Featured Businesses</h3>
                  {businessesLoading ? (
                    <p>Loading businesses...</p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Business</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {businesses?.filter(business => 
                            business.title?.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
                            business.categoryname?.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
                            business.city?.toLowerCase().includes(businessSearchTerm.toLowerCase())
                          ).map((business) => (
                            <TableRow key={business.placeid}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{business.title}</div>
                                  {business.phone && (
                                    <div className="text-sm text-muted-foreground">{business.phone}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{business.categoryname}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {business.city}, {business.state}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={business.featured ? "default" : "outline"}>
                                  {business.featured ? "Featured" : "Not Featured"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant={business.featured ? "outline" : "default"}
                                    onClick={() => {
                                      // Toggle featured status
                                      updateBusinessMutation.mutate({
                                        id: business.placeid,
                                        featured: !business.featured
                                      });
                                    }}
                                  >
                                    {business.featured ? "Remove Featured" : "Make Featured"}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu Management Tab */}
        <TabsContent value="menus" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header Menu */}
            <Card>
              <CardHeader>
                <CardTitle>Header Menu</CardTitle>
                <CardDescription>Manage navigation menu items in the header</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menuItemsLoading ? (
                    <p>Loading menu items...</p>
                  ) : (
                    <>
                      {menuItems?.filter(item => item.position === 'header').map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingMenuItem(item);
                                  setShowMenuForm(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteMenuItemMutation.mutate(item.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">Link: {item.url}</p>
                          <p className="text-xs text-gray-400">Order: {item.order}</p>
                        </div>
                      ))}
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedMenuPosition('header');
                          setEditingMenuItem(null);
                          setShowMenuForm(true);
                        }}
                      >
                        Add New Menu Item
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Footer Menu */}
            <Card>
              <CardHeader>
                <CardTitle>Footer Menu</CardTitle>
                <CardDescription>Manage footer links and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menuItemsLoading ? (
                    <p>Loading menu items...</p>
                  ) : (
                    <>
                      {menuItems?.filter(item => item.position === 'footer').map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingMenuItem(item);
                                  setShowMenuForm(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteMenuItemMutation.mutate(item.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">Link: {item.url}</p>
                          <p className="text-xs text-gray-400">Order: {item.order}</p>
                        </div>
                      ))}
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedMenuPosition('footer');
                          setEditingMenuItem(null);
                          setShowMenuForm(true);
                        }}
                      >
                        Add New Footer Link
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Business Edit Modal */}
      {editingBusiness && (
        <Dialog open={showBusinessForm} onOpenChange={(open) => {
          if (!open) {
            setShowBusinessForm(false);
            setEditingBusiness(null);
          }
        }}>
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={editingBusiness.city || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={editingBusiness.state || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="postalcode">Postal Code</Label>
                  <Input
                    id="postalcode"
                    name="postalcode"
                    defaultValue={editingBusiness.postalcode || ""}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="categoryname">Category</Label>
                <Select name="categoryname" defaultValue={editingBusiness.categoryname || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      maxLength={160}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 150-160 characters. Leave empty for auto-generation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBusinessForm(false);
                    setEditingBusiness(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateBusinessMutation.isPending}
                >
                  {updateBusinessMutation.isPending ? "Updating..." : "Update Business"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Menu Item Form Modal */}
      {showMenuForm && (
        <Dialog open={showMenuForm} onOpenChange={() => {
          setShowMenuForm(false);
          setEditingMenuItem(null);
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMenuItem ? "Edit Menu Item" : "Add New Menu Item"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const menuItemData = {
                  name: formData.get('name') as string,
                  url: formData.get('url') as string,
                  position: formData.get('position') as string,
                  order: parseInt(formData.get('order') as string) || 0,
                };

                if (editingMenuItem) {
                  updateMenuItemMutation.mutate({
                    id: editingMenuItem.id,
                    data: menuItemData
                  });
                } else {
                  createMenuItemMutation.mutate(menuItemData);
                }
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Menu Item Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingMenuItem?.name || ""}
                  placeholder="e.g., Home, About Us"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  name="url"
                  defaultValue={editingMenuItem?.url || ""}
                  placeholder="e.g., /, /about, /contact"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="position">Position</Label>
                <Select name="position" defaultValue={editingMenuItem?.position || selectedMenuPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  defaultValue={editingMenuItem?.order || 0}
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowMenuForm(false);
                    setEditingMenuItem(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
                >
                  {createMenuItemMutation.isPending || updateMenuItemMutation.isPending 
                    ? "Saving..." 
                    : editingMenuItem ? "Update" : "Create"
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}