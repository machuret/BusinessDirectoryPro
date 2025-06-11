import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertTriangle, Upload, Users, Building2, Settings, FileText, Star, Menu, Key, Zap, MapPin, Globe, UserX, UserCheck, Trash2, Edit, CheckCircle, XCircle, HelpCircle, Mail, Phone, MessageSquare, Clock, Eye, Shield } from "lucide-react";
import type { BusinessWithCategory, User, Category, SiteSetting, MenuItem, Page, LeadWithBusiness } from "@shared/schema";

export default function AdminEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("businesses");
  const [businessSearchTerm, setBusinessSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [showMassCategoryDialog, setShowMassCategoryDialog] = useState(false);
  const [newCategoryForMass, setNewCategoryForMass] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showBusinessAssignDialog, setShowBusinessAssignDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [showCityForm, setShowCityForm] = useState(false);
  const [reviewSearchTerm, setReviewSearchTerm] = useState("");

  // Data queries
  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/admin/businesses"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });

  const { data: allReviews } = useQuery<any[]>({
    queryKey: ["/api/admin/reviews"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: cities } = useQuery<any[]>({
    queryKey: ["/api/cities"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: leads } = useQuery<LeadWithBusiness[]>({
    queryKey: ["/api/admin/leads"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: websiteFaqs } = useQuery<any[]>({
    queryKey: ["/api/admin/website-faqs"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: siteSettings } = useQuery<SiteSetting[]>({
    queryKey: ["/api/site-settings"],
    enabled: !!user && (user as any).role === 'admin'
  });

  // Mass operations mutations
  const massCategoryChangeMutation = useMutation({
    mutationFn: async ({ businessIds, categoryId }: { businessIds: string[]; categoryId: number }) => {
      await apiRequest("PATCH", "/api/admin/businesses/mass-category", { businessIds, categoryId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      setSelectedBusinesses([]);
      setShowMassCategoryDialog(false);
      toast({ title: "Business categories updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Mass category update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const massReviewApprovalMutation = useMutation({
    mutationFn: async ({ reviewIds, action }: { reviewIds: number[]; action: 'approve' | 'reject' | 'delete' }) => {
      await apiRequest("PATCH", "/api/admin/reviews/mass-action", { reviewIds, action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      setSelectedReviews([]);
      toast({ title: "Reviews updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Mass review action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const massUserOperationMutation = useMutation({
    mutationFn: async ({ userIds, action, data }: { userIds: string[]; action: 'suspend' | 'activate' | 'delete'; data?: any }) => {
      await apiRequest("PATCH", "/api/admin/users/mass-action", { userIds, action, data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUsers([]);
      toast({ title: "Users updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Mass user operation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}/password`, { password });
    },
    onSuccess: () => {
      setShowPasswordDialog(false);
      setNewPassword("");
      setEditingUser(null);
      toast({ title: "Password updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignBusinessMutation = useMutation({
    mutationFn: async ({ userId, businessIds }: { userId: string; businessIds: string[] }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}/assign-businesses`, { businessIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      setShowBusinessAssignDialog(false);
      setSelectedBusinesses([]);
      toast({ title: "Businesses assigned successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Business assignment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCityMutation = useMutation({
    mutationFn: async ({ oldName, newName, description }: { oldName: string; newName: string; description?: string }) => {
      await apiRequest("PATCH", "/api/admin/cities/update", { oldName, newName, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      setShowCityForm(false);
      setEditingCity(null);
      toast({ title: "City updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "City update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler functions for mass operations
  const toggleBusinessSelection = (businessId: string) => {
    setSelectedBusinesses(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  const selectAllBusinesses = () => {
    setSelectedBusinesses(filteredBusinesses?.map(b => b.placeid) || []);
  };

  const clearBusinessSelection = () => {
    setSelectedBusinesses([]);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers?.map(u => u.id) || []);
  };

  const clearUserSelection = () => {
    setSelectedUsers([]);
  };

  const toggleReviewSelection = (reviewId: number) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const selectAllReviews = () => {
    setSelectedReviews(filteredReviews?.map(r => r.id) || []);
  };

  const clearReviewSelection = () => {
    setSelectedReviews([]);
  };

  const handleMassCategoryChange = () => {
    if (!newCategoryForMass || selectedBusinesses.length === 0) return;
    
    massCategoryChangeMutation.mutate({
      businessIds: selectedBusinesses,
      categoryId: parseInt(newCategoryForMass)
    });
  };

  const handleMassReviewAction = (action: 'approve' | 'reject' | 'delete') => {
    if (selectedReviews.length === 0) return;
    
    massReviewApprovalMutation.mutate({
      reviewIds: selectedReviews,
      action
    });
  };

  const handleMassUserAction = (action: 'suspend' | 'activate' | 'delete') => {
    if (selectedUsers.length === 0) return;
    
    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      return;
    }
    
    massUserOperationMutation.mutate({
      userIds: selectedUsers,
      action
    });
  };

  const handleUpdatePassword = () => {
    if (!editingUser || !newPassword.trim()) return;
    
    updateUserPasswordMutation.mutate({
      userId: editingUser.id,
      password: newPassword
    });
  };

  const handleAssignBusinesses = () => {
    if (!editingUser || selectedBusinesses.length === 0) return;
    
    assignBusinessMutation.mutate({
      userId: editingUser.id,
      businessIds: selectedBusinesses
    });
  };

  const editCity = (city: any) => {
    setEditingCity(city);
    setShowCityForm(true);
  };

  const handleUpdateCity = (formData: FormData) => {
    const newName = formData.get('name') as string;
    const description = formData.get('description') as string;
    
    if (!editingCity || !newName.trim()) return;
    
    updateCityMutation.mutate({
      oldName: editingCity.city,
      newName: newName.trim(),
      description: description.trim()
    });
  };

  // Auth check
  if (!user || (user as any).role !== 'admin') {
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

  const filteredReviews = allReviews?.filter(review =>
    (review.authorName || '').toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
    (review.comment || '').toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
    (review.businessId || '').toLowerCase().includes(reviewSearchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Enhanced Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Advanced business directory management with mass operations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 gap-1">
          <TabsTrigger value="businesses" className="flex items-center space-x-1 text-xs">
            <Building2 className="h-3 w-3" />
            <span>Businesses</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-1 text-xs">
            <Users className="h-3 w-3" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center space-x-1 text-xs">
            <FileText className="h-3 w-3" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="cities" className="flex items-center space-x-1 text-xs">
            <MapPin className="h-3 w-3" />
            <span>Cities</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center space-x-1 text-xs">
            <Star className="h-3 w-3" />
            <span>Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="ownership" className="flex items-center space-x-1 text-xs">
            <UserCheck className="h-3 w-3" />
            <span>Claims</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center space-x-1 text-xs">
            <Key className="h-3 w-3" />
            <span>API</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-1 text-xs">
            <Zap className="h-3 w-3" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="cms" className="flex items-center space-x-1 text-xs">
            <Globe className="h-3 w-3" />
            <span>CMS</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center space-x-1 text-xs">
            <Upload className="h-3 w-3" />
            <span>Export</span>
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center space-x-1 text-xs">
            <Mail className="h-3 w-3" />
            <span>Leads</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-1 text-xs">
            <Settings className="h-3 w-3" />
            <span>Settings</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>SEO</span>
          </TabsTrigger>
          <TabsTrigger value="homepage" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Homepage</span>
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>AI Optimize</span>
          </TabsTrigger>
        </TabsList>

        {/* Businesses Tab */}
        <TabsContent value="businesses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Management</CardTitle>
              <CardDescription>Manage business listings with mass operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Search businesses..."
                  value={businessSearchTerm}
                  onChange={(e) => setBusinessSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex space-x-2">
                  {selectedBusinesses.length > 0 && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => setShowMassCategoryDialog(true)}
                        disabled={massCategoryChangeMutation.isPending}
                      >
                        Change Category ({selectedBusinesses.length})
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearBusinessSelection}
                      >
                        Clear Selection
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {businessesLoading ? (
                <p>Loading businesses...</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={(filteredBusinesses?.length || 0) > 0 && selectedBusinesses.length === (filteredBusinesses?.length || 0)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                selectAllBusinesses();
                              } else {
                                clearBusinessSelection();
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBusinesses?.map((business) => (
                        <TableRow key={business.placeid}>
                          <TableCell>
                            <Checkbox
                              checked={selectedBusinesses.includes(business.placeid)}
                              onCheckedChange={() => toggleBusinessSelection(business.placeid)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{business.title}</div>
                              <div className="text-sm text-muted-foreground">{business.placeid}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {business.categoryname || 'Uncategorized'}
                            </Badge>
                          </TableCell>
                          <TableCell>{business.city || 'N/A'}</TableCell>
                          <TableCell>
                            {business.owner ? (
                              <div className="text-sm">
                                {business.owner.firstName} {business.owner.lastName}
                                <div className="text-muted-foreground">{business.owner.email}</div>
                              </div>
                            ) : (
                              <Badge variant="outline">Admin (Default)</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
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
              <CardDescription>Enhanced user management with mass operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex space-x-2">
                  {selectedUsers.length > 0 && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => handleMassUserAction('suspend')}
                        disabled={massUserOperationMutation.isPending}
                      >
                        Suspend ({selectedUsers.length})
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleMassUserAction('activate')}
                        disabled={massUserOperationMutation.isPending}
                      >
                        Activate ({selectedUsers.length})
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleMassUserAction('delete')}
                        disabled={massUserOperationMutation.isPending}
                      >
                        Delete ({selectedUsers.length})
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearUserSelection}
                      >
                        Clear Selection
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {usersLoading ? (
                <p>Loading users...</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={(filteredUsers?.length || 0) > 0 && selectedUsers.length === (filteredUsers?.length || 0)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                selectAllUsers();
                              } else {
                                clearUserSelection();
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => toggleUserSelection(user.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-muted-foreground">{user.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={(user as any).role === 'admin' ? 'default' : 'secondary'}>
                              {(user as any).role || 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={(user as any).status === 'suspended' ? 'destructive' : 'default'}>
                              {(user as any).status || 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingUser(user);
                                  setShowPasswordDialog(true);
                                }}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingUser(user);
                                  setShowBusinessAssignDialog(true);
                                }}
                              >
                                <Building2 className="h-4 w-4" />
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

        {/* Cities Tab */}
        <TabsContent value="cities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cities Management</CardTitle>
              <CardDescription>Manage city names and descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City Name</TableHead>
                      <TableHead>Business Count</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cities?.map((city) => (
                      <TableRow key={city.city}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{city.city}</div>
                            {city.description && (
                              <div className="text-sm text-muted-foreground">{city.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{city.count} businesses</Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => editCity(city)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Management</CardTitle>
              <CardDescription>Mass approve, reject, or delete reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Search reviews..."
                  value={reviewSearchTerm}
                  onChange={(e) => setReviewSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex space-x-2">
                  {selectedReviews.length > 0 && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => handleMassReviewAction('approve')}
                        disabled={massReviewApprovalMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve ({selectedReviews.length})
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleMassReviewAction('reject')}
                        disabled={massReviewApprovalMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject ({selectedReviews.length})
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleMassReviewAction('delete')}
                        disabled={massReviewApprovalMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete ({selectedReviews.length})
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearReviewSelection}
                      >
                        Clear Selection
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={(filteredReviews?.length || 0) > 0 && selectedReviews.length === (filteredReviews?.length || 0)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectAllReviews();
                            } else {
                              clearReviewSelection();
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReviews?.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedReviews.includes(review.id)}
                            onCheckedChange={() => toggleReviewSelection(review.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{review.authorName}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {review.comment}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{review.businessId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            {review.rating}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              review.status === 'approved' ? 'default' :
                              review.status === 'rejected' ? 'destructive' : 'secondary'
                            }
                          >
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ownership Tab */}
        <TabsContent value="ownership" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ownership Tracking</CardTitle>
              <CardDescription>View business ownership status and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Claimed Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businesses?.map((business) => (
                      <TableRow key={business.placeid}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{business.title}</div>
                            <div className="text-sm text-muted-foreground">{business.city}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {business.owner ? (
                            <div>
                              <div className="font-medium">
                                {business.owner.firstName} {business.owner.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {business.owner.email}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center text-muted-foreground">
                              <Shield className="h-4 w-4 mr-1" />
                              Admin (Default)
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={business.owner ? 'default' : 'secondary'}>
                            {business.owner ? 'Claimed' : 'Unclaimed'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {business.owner ? (
                            new Date((business as any).claimedAt || (business as any).createdat).toLocaleDateString()
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSV Import Tab */}
        <TabsContent value="importer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV Business Import</CardTitle>
              <CardDescription>Upload and import business data from CSV files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Click to upload CSV file or drag and drop
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        CSV files up to 10MB
                      </span>
                    </label>
                    <input
                      id="csv-upload"
                      name="csv-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button variant="outline">Download Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Inbox Tab */}
        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leads Inbox</CardTitle>
              <CardDescription>Manage incoming customer inquiries and leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads && leads.length > 0 ? (
                      leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{(lead as any).name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{(lead as any).email || ''}</div>
                              {(lead as any).phone && (
                                <div className="text-sm text-muted-foreground">{(lead as any).phone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{lead.business?.title || 'Unknown Business'}</div>
                              <div className="text-sm text-muted-foreground">{(lead.business as any)?.city || ''}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">{(lead as any).message || ''}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={lead.status === 'new' ? 'default' : lead.status === 'contacted' ? 'secondary' : 'outline'}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No leads found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Management Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website FAQ Management</CardTitle>
              <CardDescription>Manage frequently asked questions for the website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Button>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {websiteFaqs && websiteFaqs.length > 0 ? (
                      websiteFaqs.map((faq) => (
                        <TableRow key={faq.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium">{faq.question}</div>
                              <div className="text-sm text-muted-foreground truncate">{faq.answer}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{faq.category || 'General'}</Badge>
                          </TableCell>
                          <TableCell>{faq.sortOrder || 0}</TableCell>
                          <TableCell>
                            <Badge variant={faq.isActive ? 'default' : 'secondary'}>
                              {faq.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No FAQs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Configure search engine optimization settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="site-title">Site Title</Label>
                    <Input id="site-title" placeholder="Your Business Directory" />
                  </div>
                  <div>
                    <Label htmlFor="meta-description">Meta Description</Label>
                    <Textarea id="meta-description" placeholder="Discover local businesses..." />
                  </div>
                  <div>
                    <Label htmlFor="meta-keywords">Meta Keywords</Label>
                    <Input id="meta-keywords" placeholder="business, directory, local" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="og-title">Open Graph Title</Label>
                    <Input id="og-title" placeholder="Business Directory" />
                  </div>
                  <div>
                    <Label htmlFor="og-description">Open Graph Description</Label>
                    <Textarea id="og-description" placeholder="Find local businesses..." />
                  </div>
                  <div>
                    <Label htmlFor="google-analytics">Google Analytics ID</Label>
                    <Input id="google-analytics" placeholder="GA-XXXXXXXXX-X" />
                  </div>
                </div>
              </div>
              <Button>
                <Globe className="h-4 w-4 mr-2" />
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Homepage Customization Tab */}
        <TabsContent value="homepage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Customization</CardTitle>
              <CardDescription>Customize the homepage layout and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hero-title">Hero Section Title</Label>
                    <Input id="hero-title" placeholder="Find Local Businesses" />
                  </div>
                  <div>
                    <Label htmlFor="hero-subtitle">Hero Section Subtitle</Label>
                    <Textarea id="hero-subtitle" placeholder="Discover amazing local businesses..." />
                  </div>
                  <div>
                    <Label htmlFor="featured-section-title">Featured Section Title</Label>
                    <Input id="featured-section-title" placeholder="Featured Businesses" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categories-section-title">Categories Section Title</Label>
                    <Input id="categories-section-title" placeholder="Browse Categories" />
                  </div>
                  <div>
                    <Label htmlFor="footer-text">Footer Text</Label>
                    <Textarea id="footer-text" placeholder="© 2024 Business Directory" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-search" />
                    <Label htmlFor="show-search">Show search on homepage</Label>
                  </div>
                </div>
              </div>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Save Homepage Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Content Optimization</CardTitle>
              <CardDescription>Use AI to optimize business descriptions and generate content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Optimize Descriptions</CardTitle>
                    <CardDescription>Improve business descriptions using AI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select businesses to optimize" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Businesses</SelectItem>
                          <SelectItem value="missing">Businesses with missing descriptions</SelectItem>
                          <SelectItem value="short">Businesses with short descriptions</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full">
                        <Zap className="h-4 w-4 mr-2" />
                        Optimize Descriptions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generate FAQs</CardTitle>
                    <CardDescription>Auto-generate FAQs for businesses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select businesses for FAQ generation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Businesses</SelectItem>
                          <SelectItem value="no-faq">Businesses without FAQs</SelectItem>
                          <SelectItem value="category">By Category</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Generate FAQs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bulk Operations</CardTitle>
                  <CardDescription>Perform AI-powered bulk operations on your directory</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Meta Descriptions
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Generate SEO Keywords
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Star className="h-4 w-4 mr-2" />
                      Optimize for Featured Listings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mass Category Change Dialog */}
      <Dialog open={showMassCategoryDialog} onOpenChange={setShowMassCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Category for Selected Businesses</DialogTitle>
            <DialogDescription>
              Select a new category for {selectedBusinesses.length} selected businesses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">New Category</Label>
              <Select value={newCategoryForMass} onValueChange={setNewCategoryForMass}>
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
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMassCategoryDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMassCategoryChange}
                disabled={!newCategoryForMass || massCategoryChangeMutation.isPending}
              >
                Update Categories
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Update Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Password</DialogTitle>
            <DialogDescription>
              Change password for {editingUser?.firstName} {editingUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowPasswordDialog(false);
                setNewPassword("");
                setEditingUser(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdatePassword}
                disabled={!newPassword.trim() || updateUserPasswordMutation.isPending}
              >
                Update Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Business Assignment Dialog */}
      <Dialog open={showBusinessAssignDialog} onOpenChange={setShowBusinessAssignDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign Businesses to User</DialogTitle>
            <DialogDescription>
              Select businesses to assign to {editingUser?.firstName} {editingUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={(businesses?.length || 0) > 0 && selectedBusinesses.length === (businesses?.length || 0)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBusinesses(businesses?.map(b => b.placeid) || []);
                          } else {
                            setSelectedBusinesses([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses?.map((business) => (
                    <TableRow key={business.placeid}>
                      <TableCell>
                        <Checkbox
                          checked={selectedBusinesses.includes(business.placeid)}
                          onCheckedChange={() => toggleBusinessSelection(business.placeid)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{business.title}</div>
                          <div className="text-sm text-muted-foreground">{business.placeid}</div>
                        </div>
                      </TableCell>
                      <TableCell>{business.city}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {business.categoryname || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowBusinessAssignDialog(false);
                setSelectedBusinesses([]);
                setEditingUser(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignBusinesses}
                disabled={selectedBusinesses.length === 0 || assignBusinessMutation.isPending}
              >
                Assign Businesses ({selectedBusinesses.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* City Edit Dialog */}
      <Dialog open={showCityForm} onOpenChange={setShowCityForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit City</DialogTitle>
            <DialogDescription>
              Update city name and description
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleUpdateCity(formData);
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">City Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingCity?.city}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingCity?.description}
                  placeholder="Enter city description..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowCityForm(false);
                  setEditingCity(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCityMutation.isPending}>
                  Update City
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </Tabs>
    </div>
  );
}