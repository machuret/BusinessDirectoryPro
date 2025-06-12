import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import BusinessTable from "./components/BusinessTable";
import BusinessDialog from "./components/BusinessDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";

export default function BusinessManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch businesses and categories
  const { data: businesses, isLoading: businessesLoading } = useQuery({
    queryKey: ["/api/admin/businesses"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const filteredBusinesses = businesses?.filter(business => {
    const matchesSearch = 
      business.businessname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || business.categoryId === parseInt(filterCategory);
    const matchesStatus = filterStatus === "all" || business.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const handleEdit = (business) => {
    setEditingBusiness(business);
    setShowEditDialog(true);
  };

  const handleView = (business) => {
    setEditingBusiness(business);
    setShowEditDialog(true);
  };

  const handleDialogClose = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setEditingBusiness(null);
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
                {categories?.map((category) => (
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

          <BusinessTable
            businesses={filteredBusinesses}
            isLoading={businessesLoading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={setDeleteConfirmId}
            searchTerm={searchTerm}
            filterCategory={filterCategory}
            filterStatus={filterStatus}
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
    </div>
  );
}