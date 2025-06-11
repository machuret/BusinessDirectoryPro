import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Building2, Users, MessageSquare, Star, Settings, 
  Search, Plus, Edit, Trash2, Eye, CheckCircle, 
  XCircle, Filter, Download, Upload, Key, UserCheck,
  Globe, FileText, HelpCircle, Mail, Target, MapPin,
  Brain, Home, Shield, Clock, Phone
} from "lucide-react";
import type { BusinessWithCategory, User, Category, SiteSetting, MenuItem, Page, LeadWithBusiness } from "@shared/schema";

export default function AdminSidebar() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State management
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
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithCategory | null>(null);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [showCityForm, setShowCityForm] = useState(false);
  const [showAssignOwnerDialog, setShowAssignOwnerDialog] = useState(false);
  const [showBusinessEditDialog, setShowBusinessEditDialog] = useState(false);
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
    queryKey: ["/api/categories"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: cities } = useQuery<{ city: string; count: number }[]>({
    queryKey: ["/api/cities"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: allReviews } = useQuery({
    queryKey: ["/api/admin/reviews"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: leads } = useQuery<LeadWithBusiness[]>({
    queryKey: ["/api/admin/leads"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: siteSettings } = useQuery<SiteSetting[]>({
    queryKey: ["/api/site-settings"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: websiteFaqs } = useQuery({
    queryKey: ["/api/admin/website-faqs"],
    enabled: !!user && (user as any).role === 'admin'
  });

  // Mutations
  const massCategoryChangeMutation = useMutation({
    mutationFn: async (data: { businessIds: string[]; categoryId: number }) => {
      const res = await apiRequest("POST", "/api/admin/mass-category-change", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Success", description: "Category updated for selected businesses" });
      setShowMassCategoryDialog(false);
      setSelectedBusinesses([]);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const massReviewApprovalMutation = useMutation({
    mutationFn: async (data: { reviewIds: number[]; action: string }) => {
      const res = await apiRequest("POST", "/api/admin/mass-review-action", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Success", description: "Review action completed" });
      setSelectedReviews([]);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const massUserOperationMutation = useMutation({
    mutationFn: async (data: { userIds: string[]; action: string }) => {
      const res = await apiRequest("POST", "/api/admin/mass-user-operation", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User operation completed" });
      setSelectedUsers([]);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { userId: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/admin/update-password", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Password updated successfully" });
      setShowPasswordDialog(false);
      setNewPassword("");
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateCityMutation = useMutation({
    mutationFn: async (data: { oldName: string; newName: string; description?: string }) => {
      const res = await apiRequest("POST", "/api/admin/update-city", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Success", description: "City updated successfully" });
      setShowCityForm(false);
      setEditingCity(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Helper functions
  const toggleBusinessSelection = (businessId: string) => {
    setSelectedBusinesses(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleReviewSelection = (reviewId: number) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const selectAllBusinesses = () => {
    setSelectedBusinesses(filteredBusinesses?.map(b => b.placeid) || []);
  };

  const clearBusinessSelection = () => {
    setSelectedBusinesses([]);
  };

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers?.map(u => u.id) || []);
  };

  const clearUserSelection = () => {
    setSelectedUsers([]);
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
    
    updatePasswordMutation.mutate({
      userId: editingUser.id,
      newPassword: newPassword.trim()
    });
  };

  const handleUpdateCity = (formData: FormData) => {
    const newName = formData.get('cityName') as string;
    const description = formData.get('description') as string;
    
    if (!editingCity || !newName.trim()) return;
    
    updateCityMutation.mutate({
      oldName: editingCity.city,
      newName: newName.trim(),
      description: description?.trim()
    });
  };

  // Check admin access
  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Business Directory Management</p>
        </div>
        
        <nav className="mt-6 px-3 pb-6">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("businesses")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "businesses" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Building2 className="h-5 w-5 mr-3" />
              Businesses
            </button>
            
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "users" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              Users
            </button>
            
            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "categories" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <FileText className="h-5 w-5 mr-3" />
              Categories
            </button>
            
            <button
              onClick={() => setActiveTab("cities")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "cities" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <MapPin className="h-5 w-5 mr-3" />
              Cities
            </button>
            
            <button
              onClick={() => setActiveTab("reviews")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "reviews" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Star className="h-5 w-5 mr-3" />
              Reviews
            </button>
            
            <button
              onClick={() => setActiveTab("ownership")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "ownership" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <UserCheck className="h-5 w-5 mr-3" />
              Ownership
            </button>
            
            <button
              onClick={() => setActiveTab("import")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "import" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Download className="h-5 w-5 mr-3" />
              Import
            </button>
            
            <button
              onClick={() => setActiveTab("api")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "api" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Key className="h-5 w-5 mr-3" />
              API
            </button>
            
            <button
              onClick={() => setActiveTab("cms")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "cms" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Globe className="h-5 w-5 mr-3" />
              CMS
            </button>
            
            <button
              onClick={() => setActiveTab("export")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "export" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Upload className="h-5 w-5 mr-3" />
              Export
            </button>
            
            <button
              onClick={() => setActiveTab("leads")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "leads" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Mail className="h-5 w-5 mr-3" />
              Leads
            </button>
            
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "settings" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </button>
            
            <button
              onClick={() => setActiveTab("faq")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "faq" 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <HelpCircle className="h-5 w-5 mr-3" />
              FAQ
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
          {/* Businesses Tab */}
          {activeTab === "businesses" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Management</CardTitle>
                  <CardDescription>Enhanced business management with mass operations and ownership tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search businesses..."
                            value={businessSearchTerm}
                            onChange={(e) => setBusinessSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Business
                        </Button>
                        <Button variant="outline">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                          {selectedBusinesses.length > 0 && `${selectedBusinesses.length} selected`}
                        </span>
                      </div>
                      {selectedBusinesses.length > 0 && (
                        <>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowMassCategoryDialog(true)}
                            >
                              Change Category
                            </Button>
                            <Button
                              variant="outline"
                              onClick={clearBusinessSelection}
                            >
                              Clear Selection
                            </Button>
                          </div>
                        </>
                      )}
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
                                  <Badge variant="outline">{business.categoryname || 'Uncategorized'}</Badge>
                                </TableCell>
                                <TableCell>{business.city}, {business.state}</TableCell>
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
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setEditingBusiness(business);
                                        setShowBusinessEditDialog(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setEditingBusiness(business);
                                        setShowAssignOwnerDialog(true);
                                      }}
                                    >
                                      <UserCheck className="h-4 w-4" />
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
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Enhanced user management with mass operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search users..."
                              value={userSearchTerm}
                              onChange={(e) => setUserSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">
                            {selectedUsers.length > 0 && `${selectedUsers.length} selected`}
                          </span>
                        </div>
                        {selectedUsers.length > 0 && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMassUserAction('suspend')}
                            >
                              Suspend Selected
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMassUserAction('activate')}
                            >
                              Activate Selected
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleMassUserAction('delete')}
                            >
                              Delete Selected
                            </Button>
                            <Button
                              variant="outline"
                              onClick={clearUserSelection}
                            >
                              Clear Selection
                            </Button>
                          </div>
                        )}
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* API Tab */}
            {activeTab === "api" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>API Management</CardTitle>
                      <CardDescription>Monitor API endpoints, rate limits, and system health</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">API Endpoints Status</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <span className="font-mono text-sm">GET /api/businesses</span>
                                <div className="text-xs text-muted-foreground">Retrieve business listings</div>
                              </div>
                              <Badge>Active</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <span className="font-mono text-sm">POST /api/businesses</span>
                                <div className="text-xs text-muted-foreground">Create new business</div>
                              </div>
                              <Badge>Active</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <span className="font-mono text-sm">GET /api/categories</span>
                                <div className="text-xs text-muted-foreground">Retrieve categories</div>
                              </div>
                              <Badge>Active</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "export" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Data Export & Backup</CardTitle>
                      <CardDescription>Export data, create backups, and manage data integrity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Quick Exports</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="outline" className="h-20 flex-col">
                              <Building2 className="h-6 w-6 mb-2" />
                              Export All Businesses
                            </Button>
                            <Button variant="outline" className="h-20 flex-col">
                              <Users className="h-6 w-6 mb-2" />
                              Export All Users
                            </Button>
                            <Button variant="outline" className="h-20 flex-col">
                              <Star className="h-6 w-6 mb-2" />
                              Export All Reviews
                            </Button>
                            <Button variant="outline" className="h-20 flex-col">
                              <Mail className="h-6 w-6 mb-2" />
                              Export All Leads
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Default placeholder for other tabs */}
              {!["businesses", "users", "api", "export"].includes(activeTab) && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</CardTitle>
                      <CardDescription>Manage your {activeTab} settings and data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management interface coming soon...
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={showBusinessEditDialog} onOpenChange={setShowBusinessEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Business: {editingBusiness?.title}</DialogTitle>
              <DialogDescription>
                Comprehensive business information editing
              </DialogDescription>
            </DialogHeader>
            {editingBusiness && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Business Name</Label>
                    <Input id="title" defaultValue={editingBusiness.title} />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select defaultValue={editingBusiness.categoryId?.toString()}>
                      <SelectTrigger>
                        <SelectValue />
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue={editingBusiness.phone || ''} />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue={editingBusiness.website || ''} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue={editingBusiness.address || ''} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" defaultValue={editingBusiness.city || ''} />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" defaultValue={editingBusiness.state || ''} />
                  </div>
                  <div>
                    <Label htmlFor="zip">Zip Code</Label>
                    <Input id="zip" defaultValue={editingBusiness.zip || ''} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    defaultValue={editingBusiness.description || ''} 
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input 
                      id="rating" 
                      type="number" 
                      min="0" 
                      max="5" 
                      step="0.1"
                      defaultValue={editingBusiness.rating || 0} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="priceLevel">Price Level</Label>
                    <Select defaultValue={editingBusiness.priceLevel?.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">$ (Budget)</SelectItem>
                        <SelectItem value="2">$$ (Moderate)</SelectItem>
                        <SelectItem value="3">$$$ (Expensive)</SelectItem>
                        <SelectItem value="4">$$$$ (Very Expensive)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="featured" defaultChecked={editingBusiness.featured} />
                  <Label htmlFor="featured">Featured Business</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowBusinessEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Password</DialogTitle>
              <DialogDescription>
                Change password for {editingUser?.firstName} {editingUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdatePassword}
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
                  disabled={massCategoryChangeMutation.isPending}
                >
                  {massCategoryChangeMutation.isPending ? "Updating..." : "Update Category"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }