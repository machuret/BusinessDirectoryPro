import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, UserCheck, Eye, CheckCircle, XCircle, Clock, Building2, User, Mail, Phone, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OwnershipClaim {
  id: number;
  businessId: string;
  businessTitle?: string;
  userId: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string; // User's claim message
  adminMessage?: string; // Admin's response message
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export function OwnershipManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedClaim, setSelectedClaim] = useState<OwnershipClaim | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const { toast } = useToast();

  // Fetch ownership claims
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['/api/admin/ownership-claims'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/ownership-claims');
      return response.json();
    },
  });

  // Update claim status mutation
  const updateClaimMutation = useMutation({
    mutationFn: async ({ claimId, status, notes }: { claimId: number; status: string; notes: string }) => {
      const response = await apiRequest('PUT', `/api/admin/ownership-claims/${claimId}`, {
        status,
        adminMessage: notes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ownership-claims'] });
      setSelectedClaim(null);
      setReviewNotes("");
      toast({
        title: "Claim Updated",
        description: "Ownership claim status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete claim mutation
  const deleteClaimMutation = useMutation({
    mutationFn: async (claimId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/ownership-claims/${claimId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ownership-claims'] });
      setSelectedClaim(null);
      toast({
        title: "Claim Deleted",
        description: "Ownership claim has been permanently deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    if (selectedClaim) {
      updateClaimMutation.mutate({
        claimId: selectedClaim.id,
        status: 'approved',
        notes: reviewNotes,
      });
    }
  };

  const handleReject = () => {
    if (selectedClaim) {
      updateClaimMutation.mutate({
        claimId: selectedClaim.id,
        status: 'rejected',
        notes: reviewNotes,
      });
    }
  };

  const handleRevoke = () => {
    if (selectedClaim) {
      updateClaimMutation.mutate({
        claimId: selectedClaim.id,
        status: 'revoked',
        notes: reviewNotes,
      });
    }
  };

  // Filter claims
  const filteredClaims = claims.filter((claim: OwnershipClaim) => {
    const matchesSearch = claim.businessTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-foreground border-border"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-primary border-primary"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-destructive border-destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'revoked':
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {claims.length} total claims
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search & Filter Claims
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by business name or user email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ownership Claims</CardTitle>
          <CardDescription>
            {filteredClaims.length} claims found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClaims.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Ownership Claims Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "No claims match your current filters"
                  : "No business ownership claims have been submitted yet"
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Claimant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim: OwnershipClaim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{claim.businessTitle || 'Unknown Business'}</div>
                          <div className="text-sm text-muted-foreground">ID: {claim.businessId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {claim.userFirstName && claim.userLastName 
                              ? `${claim.userFirstName} ${claim.userLastName}` 
                              : 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">{claim.userEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedClaim(claim)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Ownership Claim</DialogTitle>
                            <DialogDescription>
                              Review the details and make a decision on this ownership claim
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedClaim && (
                            <div className="space-y-6">
                              {/* Business Info */}
                              <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  Business Information
                                </h4>
                                <div className="bg-muted p-3 rounded-lg">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Name:</span> {selectedClaim.businessTitle}
                                    </div>
                                    <div>
                                      <span className="font-medium">ID:</span> {selectedClaim.businessId}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Claimant Info */}
                              <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Claimant Information
                                </h4>
                                <div className="bg-muted p-3 rounded-lg">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <User className="h-3 w-3" />
                                      <span className="font-medium">Name:</span> 
                                      {selectedClaim.userFirstName && selectedClaim.userLastName 
                                        ? `${selectedClaim.userFirstName} ${selectedClaim.userLastName}` 
                                        : 'Not provided'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
                                      <span className="font-medium">Email:</span> {selectedClaim.userEmail}
                                    </div>
                                    <div className="col-span-2 text-xs text-muted-foreground">
                                      <span className="font-medium">User ID:</span> {selectedClaim.userId}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* User's Claim Message */}
                              {selectedClaim.message && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-orange-600">User's Claim Message</h4>
                                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                    <p className="text-sm leading-relaxed">{selectedClaim.message}</p>
                                  </div>
                                </div>
                              )}

                              {/* Admin Review */}
                              <div className="space-y-2">
                                <h4 className="font-semibold">Admin Review</h4>
                                <Textarea
                                  placeholder="Add notes about your decision..."
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              {/* Actions */}
                              {selectedClaim.status === 'pending' && (
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={handleReject}
                                    disabled={updateClaimMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={handleApprove}
                                    disabled={updateClaimMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              )}

                              {selectedClaim.status !== 'pending' && (
                                <div className="bg-muted p-3 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {getStatusBadge(selectedClaim.status)}
                                      <span className="text-sm text-muted-foreground">
                                        on {new Date(selectedClaim.reviewedAt || selectedClaim.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {selectedClaim.status === 'approved' && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRevoke}
                                        disabled={updateClaimMutation.isPending}
                                        className="text-orange-600 hover:text-orange-700"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Revoke Ownership
                                      </Button>
                                    )}
                                  </div>
                                  {selectedClaim.adminMessage && (
                                    <div className="mt-2 text-sm">
                                      <span className="font-medium">Admin Response:</span> {selectedClaim.adminMessage}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Ownership Claim</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to permanently delete this ownership claim? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="text-sm">
                                  <div><strong>Business:</strong> {claim.businessTitle}</div>
                                  <div><strong>Claimant:</strong> {claim.userFirstName} {claim.userLastName} ({claim.userEmail})</div>
                                  <div><strong>Status:</strong> {claim.status}</div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <DialogTrigger asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogTrigger>
                                <Button 
                                  variant="destructive"
                                  onClick={() => deleteClaimMutation.mutate(claim.id)}
                                  disabled={deleteClaimMutation.isPending}
                                >
                                  {deleteClaimMutation.isPending ? "Deleting..." : "Delete Permanently"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Default export compatibility layer
export default OwnershipManagement;