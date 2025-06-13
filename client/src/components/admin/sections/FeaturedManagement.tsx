import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, XCircle, Search, Filter } from "lucide-react";

interface Business {
  placeid: string;
  title: string;
  categoryname: string;
  city: string;
  featured: boolean;
  createdat: string;
  description?: string;
}

export function FeaturedManagement() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);

  const { data: allBusinesses } = useQuery<Business[]>({
    queryKey: ["/api/admin/businesses"],
  });

  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const featuredBusinesses = allBusinesses?.filter(business => business.featured) || [];

  const addFeaturedMutation = useMutation({
    mutationFn: async (businessId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/businesses/${businessId}`, { featured: true });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Success", description: "Business added to featured listings" });
      setShowAddDialog(false);
      setSelectedBusiness("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const removeFeaturedMutation = useMutation({
    mutationFn: async (businessId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/businesses/${businessId}`, { featured: false });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Success", description: "Business removed from featured listings" });
      setRemoveConfirmId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const getAvailableBusinesses = () => {
    if (!allBusinesses) return [];
    
    return allBusinesses.filter(business => {
      const notFeatured = !business.featured;
      const matchesSearch = searchTerm === "" || 
        business.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || business.categoryname === selectedCategory;
      
      return notFeatured && matchesSearch && matchesCategory;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Featured Listings Management</CardTitle>
          <CardDescription>Manage which businesses appear as featured on the homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold" id="featured-businesses-title">
                Currently Featured ({featuredBusinesses.length})
              </h3>
              <Button 
                onClick={() => setShowAddDialog(true)}
                aria-label="Add new featured business"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Add Featured Business
              </Button>
            </div>
            
            {featuredBusinesses.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Featured Since</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featuredBusinesses.map((business) => (
                      <TableRow key={business.placeid}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{business.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {business.description ? business.description.substring(0, 50) + '...' : 'No description'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{business.categoryname}</Badge>
                        </TableCell>
                        <TableCell>{business.city}</TableCell>
                        <TableCell>{new Date(business.createdat).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setRemoveConfirmId(business.placeid)}
                            disabled={removeFeaturedMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No featured businesses yet. Add some to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Featured Business Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Featured Business</DialogTitle>
            <DialogDescription>
              Search and select a business to feature on the homepage
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search">Search Businesses</Label>
                <Input
                  id="search"
                  placeholder="Search by business name or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-48">
                <Label htmlFor="category">Filter by Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto border rounded">
              {getAvailableBusinesses().length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getAvailableBusinesses().map((business) => (
                      <TableRow key={business.placeid}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{business.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {business.description ? business.description.substring(0, 40) + '...' : 'No description'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{business.categoryname}</Badge>
                        </TableCell>
                        <TableCell>{business.city}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => addFeaturedMutation.mutate(business.placeid)}
                            disabled={addFeaturedMutation.isPending}
                          >
                            Add Featured
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || selectedCategory ? 'No businesses match your search criteria' : 'All businesses are already featured'}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={!!removeConfirmId} onOpenChange={() => setRemoveConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Featured Business</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this business from featured listings?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveConfirmId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => removeConfirmId && removeFeaturedMutation.mutate(removeConfirmId)}
              disabled={removeFeaturedMutation.isPending}
            >
              Remove Featured
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}