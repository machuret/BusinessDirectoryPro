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
  Download, Upload, Key
} from "lucide-react";
import type { BusinessWithCategory, User, Category } from "@shared/schema";

export default function AdminClean() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("businesses");
  const [businessSearchTerm, setBusinessSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

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

                    {businessesLoading ? (
                      <p>Loading businesses...</p>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <Checkbox />
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

          {/* Export Tab */}
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
  );
}