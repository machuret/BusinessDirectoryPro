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
import { AlertTriangle, Upload, Users, Building2, Settings, FileText } from "lucide-react";
import type { BusinessWithCategory, User, Category, SiteSetting } from "@shared/schema";

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

  const { data: siteSettings } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/site-settings"],
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="businesses" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Businesses</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Ownership Claims</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import</span>
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
      </Tabs>
    </div>
  );
}