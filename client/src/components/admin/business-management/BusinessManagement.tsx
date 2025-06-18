import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import BusinessTable from "./components/BusinessTable";
import BusinessDialog from "./components/BusinessDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";

export default function BusinessManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [showMassDeleteConfirm, setShowMassDeleteConfirm] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch businesses and categories
  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ["/api/admin/businesses"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const filteredBusinesses = businesses?.filter((business: any) => {
    const matchesSearch = 
      business.businessname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || business.categoryId === parseInt(filterCategory);
    const matchesStatus = filterStatus === "all" || business.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const handleEdit = (business: any) => {
    setEditingBusiness(business);
    setShowEditDialog(true);
  };

  const handleView = (business: any) => {
    // TODO: Implement view business functionality
  };

  const handleDialogClose = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setEditingBusiness(null);
  };

  // Mass delete mutation
  const massDeleteMutation = useMutation({
    mutationFn: async (businessIds: string[]) => {
      const response = await apiRequest('POST', '/api/admin/businesses/bulk-delete', {
        businessIds
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      setSelectedBusinesses([]);
      setShowMassDeleteConfirm(false);
      toast({
        title: "Success",
        description: "Selected businesses deleted successfully"
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

  // Selection handlers
  const handleSelectionChange = (businessId: string, checked: boolean) => {
    if (checked) {
      setSelectedBusinesses(prev => [...prev, businessId]);
    } else {
      setSelectedBusinesses(prev => prev.filter(id => id !== businessId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBusinesses(filteredBusinesses.map((business: any) => business.placeid));
    } else {
      setSelectedBusinesses([]);
    }
  };

  const handleMassDelete = () => {
    setShowMassDeleteConfirm(true);
  };

  const confirmMassDelete = () => {
    massDeleteMutation.mutate(selectedBusinesses);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Business Management</CardTitle>
              <CardDescription>Manage business listings and information</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          <BusinessTable
            businesses={filteredBusinesses}
            isLoading={businessesLoading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={setDeleteConfirmId}
            searchTerm={searchTerm}
            filterCategory={filterCategory}
            filterStatus={filterStatus}
            selectedBusinesses={selectedBusinesses}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
          />
        </CardContent>
      </Card>

      <BusinessDialog
        open={showCreateDialog || showEditDialog}
        onClose={handleDialogClose}
        business={editingBusiness}
        isEdit={showEditDialog}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        businessId={deleteConfirmId}
      />

      {/* Mass Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showMassDeleteConfirm}
        onClose={() => setShowMassDeleteConfirm(false)}
        businessId={null}
        isMultiple={true}
        count={selectedBusinesses.length}
        onConfirm={confirmMassDelete}
        isLoading={massDeleteMutation.isPending}
      />
    </div>
  );
}