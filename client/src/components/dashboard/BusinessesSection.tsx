import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Building2, Edit, Star, MapPin, Phone } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessesSectionProps {
  businesses: BusinessWithCategory[];
  isLoading: boolean;
}

export default function BusinessesSection({ businesses, isLoading }: BusinessesSectionProps) {
  const { toast } = useToast();
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithCategory | null>(null);

  const updateBusinessMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/businesses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/businesses"] });
      setEditingBusiness(null);
      toast({ title: "Business updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditBusiness = (business: BusinessWithCategory) => {
    setEditingBusiness(business);
  };

  const handleUpdateBusiness = (formData: FormData) => {
    if (!editingBusiness) return;

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      phone: formData.get("phone"),
      website: formData.get("website"),
      address: formData.get("address"),
      seotitle: formData.get("seotitle") || null,
      seodescription: formData.get("seodescription") || null,
      slug: formData.get("slug") || null,
    };

    updateBusinessMutation.mutate({
      id: editingBusiness.placeid,
      data,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Your Businesses
          </CardTitle>
          <CardDescription>Manage your business listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="mr-2 h-5 w-5" />
          Your Businesses
        </CardTitle>
        <CardDescription>Manage your business listings</CardDescription>
      </CardHeader>
      <CardContent>
        {businesses && businesses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => (
                <TableRow key={business.placeid}>
                  <TableCell className="font-medium">{business.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {business.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 text-yellow-400" />
                      {(business as any).averagerating || "No ratings"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={business.featured ? "default" : "secondary"}>
                      {business.featured ? "Featured" : "Standard"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBusiness(business)}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Business: {business.title}</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleUpdateBusiness(formData);
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">Business Name</Label>
                              <Input
                                id="title"
                                name="title"
                                defaultValue={business.title || ""}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                name="phone"
                                defaultValue={business.phone || ""}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              defaultValue={business.description || ""}
                              rows={3}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="website">Website</Label>
                              <Input
                                id="website"
                                name="website"
                                type="url"
                                defaultValue={business.website || ""}
                              />
                            </div>
                            <div>
                              <Label htmlFor="address">Address</Label>
                              <Input
                                id="address"
                                name="address"
                                defaultValue={business.address || ""}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium">SEO Settings</h4>
                            <div>
                              <Label htmlFor="seotitle">SEO Title</Label>
                              <Input
                                id="seotitle"
                                name="seotitle"
                                defaultValue={business.seotitle || ""}
                                placeholder="Custom page title for search engines"
                              />
                            </div>
                            <div>
                              <Label htmlFor="seodescription">SEO Description</Label>
                              <Textarea
                                id="seodescription"
                                name="seodescription"
                                defaultValue={business.seodescription || ""}
                                placeholder="Meta description for search engines (150-160 characters)"
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label htmlFor="slug">URL Slug</Label>
                              <Input
                                id="slug"
                                name="slug"
                                defaultValue={business.slug || ""}
                                placeholder="Custom URL path (e.g., my-business-name)"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button type="submit" disabled={updateBusinessMutation.isPending}>
                              {updateBusinessMutation.isPending ? "Updating..." : "Update Business"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">No businesses found</h3>
            <p className="text-gray-600">You don't own any business listings yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}