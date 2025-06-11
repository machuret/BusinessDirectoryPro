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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, Key, UserCheck, UserX, Edit, Trash2, Star, MapPin, Building2, FileText, CheckCircle, XCircle } from "lucide-react";
import type { BusinessWithCategory, User, Category, Review } from "@shared/schema";

export default function EnhancedAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showBusinessAssignDialog, setShowBusinessAssignDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [reviewSearchTerm, setReviewSearchTerm] = useState("");

  // Redirect if not admin
  if (!user || (user as any).role !== 'admin') {
    setLocation('/');
    return null;
  }

  // Data queries
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/admin/businesses"],
  });

  const { data: allReviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews"],
  });

  const { data: ownershipClaims, isLoading: claimsLoading } = useQuery<any[]>({
    queryKey: ["/api/ownership-claims"],
  });

  const { data: citiesData, isLoading: citiesLoading } = useQuery<{city: string, count: number}[]>({
    queryKey: ["/api/cities"],
  });

  // Enhanced user management mutations
  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/change-password`, { password });
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setShowPasswordDialog(false);
      setNewPassword("");
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignBusinessMutation = useMutation({
    mutationFn: async ({ userId, businessId }: { userId: string; businessId: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/assign-business`, { businessId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Business assigned successfully" });
      setShowBusinessAssignDialog(false);
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const massUserActionMutation = useMutation({
    mutationFn: async ({ userIds, action }: { userIds: string[]; action: "suspend" | "activate" | "delete" }) => {
      await apiRequest("POST", `/api/admin/users/mass-action`, { userIds, action });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: `Users ${action}d successfully` });
      setSelectedUsers([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Mass action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const massReviewActionMutation = useMutation({
    mutationFn: async ({ reviewIds, action }: { reviewIds: number[]; action: "approve" | "reject" }) => {
      await apiRequest("POST", `/api/admin/reviews/mass-action`, { reviewIds, action });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: `Reviews ${action}d successfully` });
      setSelectedReviews([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Mass review action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase())
  ) || [];

  const filteredReviews = allReviews?.filter(review =>
    (review as any).reviewerName?.toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
    (review as any).comment?.toLowerCase().includes(reviewSearchTerm.toLowerCase())
  ) || [];

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectReview = (reviewId: number) => {
    setSelectedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleSelectAllReviews = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map(review => review.id));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Enhanced Admin Dashboard</h1>
        <p className="text-muted-foreground">Advanced administration tools for user management, reviews, and business operations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Enhanced User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enhanced User Management
              </CardTitle>
              <CardDescription>
                Advanced user operations including password changes, business assignments, and mass actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Input
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex gap-2">
                  {selectedUsers.length > 0 && (
                    <>
                      <Button
                        onClick={() => massUserActionMutation.mutate({ userIds: selectedUsers, action: "suspend" })}
                        variant="outline"
                        size="sm"
                        disabled={massUserActionMutation.isPending}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Suspend ({selectedUsers.length})
                      </Button>
                      <Button
                        onClick={() => massUserActionMutation.mutate({ userIds: selectedUsers, action: "activate" })}
                        variant="outline"
                        size="sm"
                        disabled={massUserActionMutation.isPending}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate ({selectedUsers.length})
                      </Button>
                      <Button
                        onClick={() => massUserActionMutation.mutate({ userIds: selectedUsers, action: "delete" })}
                        variant="destructive"
                        size="sm"
                        disabled={massUserActionMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete ({selectedUsers.length})
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={handleSelectAllUsers}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading users...</TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No users found</TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => handleSelectUser(user.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'suspended' ? 'destructive' : 'outline'}>
                              {user.role === 'suspended' ? 'Suspended' : 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt || '').toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => {
                                  setEditingUser(user);
                                  setShowPasswordDialog(true);
                                }}
                                variant="ghost"
                                size="sm"
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setEditingUser(user);
                                  setShowBusinessAssignDialog(true);
                                }}
                                variant="ghost"
                                size="sm"
                              >
                                <Building2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Review Management */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Enhanced Review Management
              </CardTitle>
              <CardDescription>
                Mass review operations and advanced review filtering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Input
                  placeholder="Search reviews..."
                  value={reviewSearchTerm}
                  onChange={(e) => setReviewSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex gap-2">
                  {selectedReviews.length > 0 && (
                    <>
                      <Button
                        onClick={() => massReviewActionMutation.mutate({ reviewIds: selectedReviews, action: "approve" })}
                        variant="outline"
                        size="sm"
                        disabled={massReviewActionMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve ({selectedReviews.length})
                      </Button>
                      <Button
                        onClick={() => massReviewActionMutation.mutate({ reviewIds: selectedReviews, action: "reject" })}
                        variant="destructive"
                        size="sm"
                        disabled={massReviewActionMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject ({selectedReviews.length})
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedReviews.length === filteredReviews.length && filteredReviews.length > 0}
                          onCheckedChange={handleSelectAllReviews}
                        />
                      </TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading reviews...</TableCell>
                      </TableRow>
                    ) : filteredReviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No reviews found</TableCell>
                      </TableRow>
                    ) : (
                      filteredReviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedReviews.includes(review.id)}
                              onCheckedChange={() => handleSelectReview(review.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{(review as any).reviewerName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">{(review as any).comment}</div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={(review as any).status === 'approved' ? 'default' : (review as any).status === 'rejected' ? 'destructive' : 'secondary'}
                            >
                              {(review as any).status || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(review.createdAt || '').toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ownership Claims Management */}
        <TabsContent value="ownership" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Business Ownership Claims
              </CardTitle>
              <CardDescription>
                Manage business ownership verification requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Claimant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claimsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading claims...</TableCell>
                      </TableRow>
                    ) : !ownershipClaims || ownershipClaims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No ownership claims found</TableCell>
                      </TableRow>
                    ) : (
                      ownershipClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell>
                            <div className="font-medium">{claim.businessName}</div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{claim.userEmail}</div>
                              <div className="text-sm text-muted-foreground">{claim.userName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={claim.status === 'approved' ? 'default' : claim.status === 'rejected' ? 'destructive' : 'secondary'}
                            >
                              {claim.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {claim.status === 'pending' && (
                                <>
                                  <Button size="sm" variant="outline">
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cities Management */}
        <TabsContent value="cities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Cities Management
              </CardTitle>
              <CardDescription>
                Manage city listings and business distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Business Count</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {citiesLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Loading cities...</TableCell>
                      </TableRow>
                    ) : !citiesData || citiesData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">No cities found</TableCell>
                      </TableRow>
                    ) : (
                      citiesData.map((city) => (
                        <TableRow key={city.city}>
                          <TableCell>
                            <div className="font-medium">{city.city}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{city.count} businesses</Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Dashboard */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{businesses?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allReviews?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cities</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{citiesData?.length || 0}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
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
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (editingUser && newPassword) {
                    changePasswordMutation.mutate({ userId: editingUser.id, password: newPassword });
                  }
                }}
                disabled={!newPassword || changePasswordMutation.isPending}
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setNewPassword("");
                  setEditingUser(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Business Assignment Dialog */}
      <Dialog open={showBusinessAssignDialog} onOpenChange={setShowBusinessAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Business</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Business</Label>
              <Select onValueChange={(businessId) => {
                if (editingUser) {
                  assignBusinessMutation.mutate({ userId: editingUser.id, businessId });
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a business..." />
                </SelectTrigger>
                <SelectContent>
                  {businesses?.map((business) => (
                    <SelectItem key={business.placeid} value={business.placeid}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowBusinessAssignDialog(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}