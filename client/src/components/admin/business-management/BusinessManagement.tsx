import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { BusinessTable } from "./components/BusinessTable";
import { BusinessFilters } from "./components/BusinessFilters";
import { useBusinesses } from "./hooks/useBusinesses";
import type { Business, BusinessFilters as Filters } from "./types/business-types";

export default function BusinessManagement() {
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "all",
    status: "all",
  });

  const {
    businesses,
    categories,
    isLoading,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    bulkDeleteBusinesses,
    bulkUpdateBusinesses,
  } = useBusinesses();

  // Filter businesses based on current filters
  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch = !filters.search || 
      (business.title || business.name || business.businessname || "")
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      business.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      business.city.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory = filters.category === "all" || 
      business.categoryId.toString() === filters.category;

    const matchesStatus = filters.status === "all" || 
      (business.status || "active") === filters.status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSelectBusiness = (id: string) => {
    setSelectedBusinesses(prev => 
      prev.includes(id) 
        ? prev.filter(bid => bid !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedBusinesses(selected ? filteredBusinesses.map(b => b.placeid) : []);
  };

  const handleEdit = (business: Business) => {
    // TODO: Open edit dialog
    console.log("Edit business:", business);
  };

  const handleView = (business: Business) => {
    // TODO: Open view dialog
    console.log("View business:", business);
  };

  const handleDelete = (id: string) => {
    // TODO: Show confirmation dialog
    deleteBusiness(id);
  };

  const handleBulkDelete = () => {
    if (selectedBusinesses.length > 0) {
      bulkDeleteBusinesses(selectedBusinesses);
      setSelectedBusinesses([]);
    }
  };

  const handleBulkStatusChange = (status: string) => {
    if (selectedBusinesses.length > 0) {
      bulkUpdateBusinesses({ ids: selectedBusinesses, updates: { status } });
      setSelectedBusinesses([]);
    }
  };

  const handleBulkCategoryChange = (categoryId: number) => {
    if (selectedBusinesses.length > 0) {
      bulkUpdateBusinesses({ ids: selectedBusinesses, updates: { categoryId } });
      setSelectedBusinesses([]);
    }
  };

  const handleCreateNew = () => {
    // TODO: Open create dialog
    console.log("Create new business");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Management
            </CardTitle>
            <CardDescription>
              Manage all businesses in your directory ({filteredBusinesses.length} businesses)
            </CardDescription>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <BusinessFilters
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
        />

        {selectedBusinesses.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
            <span className="text-sm font-medium">
              {selectedBusinesses.length} business(es) selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange("active")}
              >
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange("inactive")}
              >
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        )}

        <BusinessTable
          businesses={filteredBusinesses}
          isLoading={isLoading}
          selectedBusinesses={selectedBusinesses}
          onSelectBusiness={handleSelectBusiness}
          onSelectAll={handleSelectAll}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
}