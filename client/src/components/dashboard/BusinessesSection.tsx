import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessMutations } from "@/hooks/useBusinessData";
import { useFormManagement, useModalState } from "@/hooks/useFormManagement";
import { LoadingState } from "@/components/loading/LoadingState";
import { ErrorState } from "@/components/error/ErrorState";
import { Building2, Edit, Star, MapPin, Phone } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessesSectionProps {
  businesses: BusinessWithCategory[];
  isLoading: boolean;
}

export function BusinessesSection({ businesses, isLoading }: BusinessesSectionProps) {
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithCategory | null>(null);
  const { updateBusiness } = useBusinessMutations();
  const editModal = useModalState();

  const editForm = useFormManagement({
    initialValues: {
      title: "",
      description: "",
      phone: "",
      website: "",
      address: "",
      seotitle: "",
      seodescription: "",
      slug: "",
    },
    onSubmit: async (values) => {
      if (!editingBusiness) return;
      
      await updateBusiness.mutateAsync({
        id: editingBusiness.placeid,
        data: values,
      });
      
      setEditingBusiness(null);
      editModal.close();
    },
  });

  const handleEditBusiness = (business: BusinessWithCategory) => {
    setEditingBusiness(business);
    editForm.updateFields({
      title: business.title || "",
      description: business.description || "",
      phone: business.phone || "",
      website: business.website || "",
      address: business.address || "",
      seotitle: business.seotitle || "",
      seodescription: business.seodescription || "",
      slug: business.slug || "",
    });
    editModal.open();
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
          <LoadingState message="Loading your businesses..." />
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
                    <Dialog open={editModal.isOpen} onOpenChange={editModal.setIsOpen}>
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
                        <form onSubmit={editForm.handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">Business Name</Label>
                              <Input
                                id="title"
                                value={editForm.values.title}
                                onChange={(e) => editForm.updateField("title", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={editForm.values.phone}
                                onChange={(e) => editForm.updateField("phone", e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={editForm.values.description}
                              onChange={(e) => editForm.updateField("description", e.target.value)}
                              rows={3}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="website">Website</Label>
                              <Input
                                id="website"
                                type="url"
                                value={editForm.values.website}
                                onChange={(e) => editForm.updateField("website", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="address">Address</Label>
                              <Input
                                id="address"
                                value={editForm.values.address}
                                onChange={(e) => editForm.updateField("address", e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium">SEO Settings</h4>
                            <div>
                              <Label htmlFor="seotitle">SEO Title</Label>
                              <Input
                                id="seotitle"
                                value={editForm.values.seotitle}
                                onChange={(e) => editForm.updateField("seotitle", e.target.value)}
                                placeholder="Custom page title for search engines"
                              />
                            </div>
                            <div>
                              <Label htmlFor="seodescription">SEO Description</Label>
                              <Textarea
                                id="seodescription"
                                value={editForm.values.seodescription}
                                onChange={(e) => editForm.updateField("seodescription", e.target.value)}
                                placeholder="Meta description for search engines (150-160 characters)"
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label htmlFor="slug">URL Slug</Label>
                              <Input
                                id="slug"
                                value={editForm.values.slug}
                                onChange={(e) => editForm.updateField("slug", e.target.value)}
                                placeholder="Custom URL path (e.g., my-business-name)"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={editModal.close}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.isSubmitting}>
                              {editForm.isSubmitting ? "Updating..." : "Update Business"}
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

// Default export for backward compatibility
export default BusinessesSection;