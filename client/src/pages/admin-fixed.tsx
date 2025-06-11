import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Building2, Users, Star, Settings, Search, Plus, Edit, 
  UserCheck, Globe, FileText, HelpCircle, Mail, MapPin,
  Download, Upload, Key, CheckCircle, XCircle
} from "lucide-react";
import type { BusinessWithCategory, User, Category } from "@shared/schema";

export default function AdminFixed() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("businesses");
  const [businessSearchTerm, setBusinessSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showMassCategoryDialog, setShowMassCategoryDialog] = useState(false);
  const [newCategoryForMass, setNewCategoryForMass] = useState("");

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

  const selectAllBusinesses = () => {
    setSelectedBusinesses(filteredBusinesses?.map(b => b.placeid) || []);
  };

  const clearBusinessSelection = () => {
    setSelectedBusinesses([]);
  };

  const handleMassCategoryChange = () => {
    if (!newCategoryForMass || selectedBusinesses.length === 0) return;
    
    massCategoryChangeMutation.mutate({
      businessIds: selectedBusinesses,
      categoryId: parseInt(newCategoryForMass)
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Business Directory Management</p>
        </div>
        
        <nav className="mt-6 px-3 pb-6 space-y-1">
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
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                          {selectedBusinesses.length > 0 && `${selectedBusinesses.length} selected`}
                        </span>
                      </div>
                      {selectedBusinesses.length > 0 && (
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
                                    <Button size="sm" variant="outline">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline">
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
                  </div>
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

                    {usersLoading ? (
                      <p>Loading users...</p>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <Checkbox />
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
                                    <Button size="sm" variant="outline">
                                      <Key className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline">
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

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Categories Management</CardTitle>
                  <CardDescription>Manage business categories and subcategories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Categories</h3>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Business Count</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categories?.map((category) => (
                            <TableRow key={category.id}>
                              <TableCell className="font-medium">{category.name}</TableCell>
                              <TableCell>{category.slug}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{(category as any).count || 0} businesses</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cities Tab */}
          {activeTab === "cities" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cities Management</CardTitle>
                  <CardDescription>Manage city names, merge duplicates, and organize locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Cities</h3>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add City
                      </Button>
                    </div>
                    
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
                              <TableCell className="font-medium">{city.city}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{city.count} businesses</Badge>
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
                  <CardTitle>API Key Management</CardTitle>
                  <CardDescription>Manage external API keys and integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">OpenAI Integration</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="openai-key">OpenAI API Key</Label>
                          <div className="flex gap-2">
                            <Input 
                              id="openai-key" 
                              type="password" 
                              placeholder="sk-..." 
                              className="font-mono"
                            />
                            <Button>
                              <Key className="h-4 w-4 mr-2" />
                              Update
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Used for AI-powered business descriptions and content optimization
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">Connection Status</div>
                            <div className="text-sm text-muted-foreground">Last tested: 2 hours ago</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Connected</Badge>
                            <Button size="sm" variant="outline">Test Connection</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Ownership Tab */}
          {activeTab === "ownership" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ownership Claims Management</CardTitle>
                  <CardDescription>Review and manage business ownership claims</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Pending Claims</h3>
                      <Badge variant="secondary">0 pending</Badge>
                    </div>
                    
                    <div className="text-center py-8 text-muted-foreground">
                      <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pending ownership claims at this time</p>
                      <p className="text-sm">Claims will appear here when users request business ownership</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CMS Tab */}
          {activeTab === "cms" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management System</CardTitle>
                  <CardDescription>Manage pages, content, and website structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Pages</h3>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Page
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      <div className="flex justify-between items-center p-4 border rounded">
                        <div>
                          <h4 className="font-semibold">About Us</h4>
                          <p className="text-sm text-muted-foreground">Company information and mission</p>
                          <div className="text-xs text-muted-foreground mt-1">Last updated: 2 days ago</div>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="default">Published</Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 border rounded">
                        <div>
                          <h4 className="font-semibold">Contact</h4>
                          <p className="text-sm text-muted-foreground">Contact information and form</p>
                          <div className="text-xs text-muted-foreground mt-1">Last updated: 1 week ago</div>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="default">Published</Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Default placeholder for other tabs */}
          {!["businesses", "users", "categories", "cities", "api", "ownership", "cms"].includes(activeTab) && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</CardTitle>
                  <CardDescription>Manage your {activeTab} settings and data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} functionality is being implemented.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

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