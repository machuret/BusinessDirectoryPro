import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminMassDeleteDemo() {
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Login first
  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/login', {
        email: 'admin@businesshub.com',
        password: 'Xola2025'
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({
        title: "Success",
        description: "Logged in as admin"
      });
    }
  });

  // Fetch businesses
  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["/api/admin/businesses"],
    enabled: false // Only fetch after login
  });

  // Mass delete mutation
  const massDeleteMutation = useMutation({
    mutationFn: async (businessIds: string[]) => {
      const response = await apiRequest('POST', '/api/admin/businesses/bulk-delete', {
        businessIds
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      setSelectedBusinesses([]);
      setShowConfirmDialog(false);
      toast({
        title: "Success",
        description: `${data.deletedCount} businesses deleted successfully`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleLogin = () => {
    loginMutation.mutate();
  };

  const handleSelectionChange = (businessId: string, checked: boolean) => {
    if (checked) {
      setSelectedBusinesses(prev => [...prev, businessId]);
    } else {
      setSelectedBusinesses(prev => prev.filter(id => id !== businessId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBusinesses(businesses.map((business: any) => business.placeid));
    } else {
      setSelectedBusinesses([]);
    }
  };

  const handleMassDelete = () => {
    setShowConfirmDialog(true);
  };

  const confirmMassDelete = () => {
    massDeleteMutation.mutate(selectedBusinesses);
  };

  const getBusinessName = (business: any) => {
    return business.title || business.businessname || business.name || "Unnamed Business";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Mass Delete Demo</CardTitle>
            <CardDescription>
              Demonstration of the mass delete functionality for business management
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!loginMutation.isSuccess ? (
              <div className="text-center py-8">
                <Button 
                  onClick={handleLogin}
                  disabled={loginMutation.isPending}
                  size="lg"
                >
                  {loginMutation.isPending ? "Logging in..." : "Login as Admin"}
                </Button>
              </div>
            ) : (
              <>
                {/* Mass Delete Actions */}
                {selectedBusinesses.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {selectedBusinesses.length} business{selectedBusinesses.length !== 1 ? 'es' : ''} selected
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBusinesses([])}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear selection
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleMassDelete}
                      disabled={massDeleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected ({selectedBusinesses.length})
                    </Button>
                  </div>
                )}

                {/* Business Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedBusinesses.length === businesses.length && businesses.length > 0}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all businesses"
                          />
                        </TableHead>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Loading businesses...
                          </TableCell>
                        </TableRow>
                      ) : businesses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No businesses found
                          </TableCell>
                        </TableRow>
                      ) : (
                        businesses.map((business: any) => (
                          <TableRow key={business.placeid}>
                            <TableCell>
                              <Checkbox
                                checked={selectedBusinesses.includes(business.placeid)}
                                onCheckedChange={(checked) => handleSelectionChange(business.placeid, checked as boolean)}
                                aria-label={`Select ${getBusinessName(business)}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {getBusinessName(business)}
                            </TableCell>
                            <TableCell>{business.category || 'N/A'}</TableCell>
                            <TableCell>{business.city || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>
                                {business.status || 'active'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="text-sm text-gray-600 mt-4">
                  Total businesses: {businesses.length} | Selected: {selectedBusinesses.length}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Mass Delete Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Mass Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedBusinesses.length} business{selectedBusinesses.length !== 1 ? 'es' : ''}? 
                This action cannot be undone. All associated data including reviews and ratings will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmMassDelete}
                disabled={massDeleteMutation.isPending}
              >
                {massDeleteMutation.isPending ? "Deleting..." : `Delete ${selectedBusinesses.length} Business${selectedBusinesses.length !== 1 ? 'es' : ''}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}