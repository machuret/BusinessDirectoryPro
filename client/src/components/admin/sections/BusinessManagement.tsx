import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Plus, Edit, UserCheck } from "lucide-react";
import type { BusinessWithCategory, Category } from "@shared/schema";

export default function BusinessManagement() {
  const { toast } = useToast();
  const [businessSearchTerm, setBusinessSearchTerm] = useState("");
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [showMassCategoryDialog, setShowMassCategoryDialog] = useState(false);
  const [newCategoryForMass, setNewCategoryForMass] = useState("");
  const [showAddBusinessDialog, setShowAddBusinessDialog] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    website: "",
    categoryId: ""
  });

  // Data queries
  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/admin/businesses"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Mutations
  const massCategoryChangeMutation = useMutation({
    mutationFn: async (data: { businessIds: string[]; categoryId: number }) => {
      const res = await apiRequest("PATCH", "/api/admin/businesses/mass-category", data);
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

  const createBusinessMutation = useMutation({
    mutationFn: async (businessData: typeof newBusiness) => {
      const res = await apiRequest("POST", "/api/businesses", {
        ...businessData,
        categoryId: parseInt(businessData.categoryId)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Success", description: "Business created successfully" });
      setShowAddBusinessDialog(false);
      setNewBusiness({
        title: "",
        description: "",
        address: "",
        city: "",
        state: "",
        phone: "",
        email: "",
        website: "",
        categoryId: ""
      });
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

  const filteredBusinesses = businesses?.filter(business =>
    (business.title || '').toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
    (business.city || '').toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
    (business.categoryname || '').toLowerCase().includes(businessSearchTerm.toLowerCase())
  );

  return (
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
                <Button variant="outline" onClick={() => setShowAddBusinessDialog(true)}>
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

      {/* Add Business Dialog */}
      <Dialog open={showAddBusinessDialog} onOpenChange={setShowAddBusinessDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Business</DialogTitle>
            <DialogDescription>Create a new business listing</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Business Name</Label>
              <Input
                id="title"
                value={newBusiness.title}
                onChange={(e) => setNewBusiness({...newBusiness, title: e.target.value})}
                placeholder="Enter business name"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newBusiness.categoryId} onValueChange={(value) => setNewBusiness({...newBusiness, categoryId: value})}>
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
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newBusiness.description}
                onChange={(e) => setNewBusiness({...newBusiness, description: e.target.value})}
                placeholder="Business description"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newBusiness.address}
                onChange={(e) => setNewBusiness({...newBusiness, address: e.target.value})}
                placeholder="Full address"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={newBusiness.city}
                onChange={(e) => setNewBusiness({...newBusiness, city: e.target.value})}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={newBusiness.state}
                onChange={(e) => setNewBusiness({...newBusiness, state: e.target.value})}
                placeholder="State"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newBusiness.phone}
                onChange={(e) => setNewBusiness({...newBusiness, phone: e.target.value})}
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newBusiness.email}
                onChange={(e) => setNewBusiness({...newBusiness, email: e.target.value})}
                placeholder="Email address"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={newBusiness.website}
                onChange={(e) => setNewBusiness({...newBusiness, website: e.target.value})}
                placeholder="Website URL"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowAddBusinessDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createBusinessMutation.mutate(newBusiness)}
              disabled={createBusinessMutation.isPending || !newBusiness.title || !newBusiness.categoryId}
            >
              {createBusinessMutation.isPending ? "Creating..." : "Create Business"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}