import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Eye, Building2, Loader2, Star, Search, Phone, Mail, Globe, MapPin, Clock, Users, Filter } from "lucide-react";

interface Business {
  placeid: string;
  name?: string;
  businessname?: string;
  title?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  hours?: string;
  categoryId: number;
  featured: boolean;
  verified?: boolean;
  status?: string;
  rating: number;
  reviewCount?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: { name: string };
}

const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  hours: z.string().optional(),
  categoryId: z.number().min(1, "Category is required"),
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
  // New fields for enhanced business management
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  faq: z.string().optional(),
  socialMedia: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
  ownerInfo: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export default function BusinessManagement() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [viewingBusiness, setViewingBusiness] = useState<Business | null>(null);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: businesses, isLoading } = useQuery<Business[]>({
    queryKey: ["/api/admin/businesses"],
  });

  const { data: categories } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      website: "",
      description: "",
      hours: "",
      categoryId: 0,
      featured: false,
      verified: false,
      status: "active",
      seoTitle: "",
      seoDescription: "",
      faq: "",
      socialMedia: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
      ownerInfo: {
        name: "",
        email: "",
        phone: "",
      },
    },
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (data: BusinessFormData) => {
      const res = await apiRequest("POST", "/api/admin/businesses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Success", description: "Business created successfully" });
      setShowCreateDialog(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BusinessFormData> }) => {
      const res = await apiRequest("PATCH", `/api/admin/businesses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Success", description: "Business updated successfully" });
      setShowEditDialog(false);
      setEditingBusiness(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteBusinessMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/businesses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Success", description: "Business deleted successfully" });
      setDeleteConfirmId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const massDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => apiRequest("DELETE", `/api/admin/businesses/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Success", description: `${selectedBusinesses.length} businesses deleted successfully` });
      setSelectedBusinesses([]);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const massUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<BusinessFormData> }) => {
      await Promise.all(ids.map(id => apiRequest("PATCH", `/api/admin/businesses/${id}`, updates)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Success", description: `Updated ${selectedBusinesses.length} businesses successfully` });
      setSelectedBusinesses([]);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getBusinessName = (business: Business) => {
    if (!business) return 'Unnamed Business';
    return business.name || business.businessname || business.title || 'Unnamed Business';
  };

  const filteredBusinesses = businesses?.filter(business => {
    const name = getBusinessName(business).toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                         business.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || business.categoryId.toString() === filterCategory;
    const matchesStatus = filterStatus === "all" || business.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const handleCreate = () => {
    form.reset();
    setShowCreateDialog(true);
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    const businessData = business as any; // Type assertion for additional fields
    form.reset({
      name: getBusinessName(business),
      address: business.address,
      city: business.city,
      phone: business.phone || "",
      email: business.email || "",
      website: business.website || "",
      description: business.description || "",
      hours: business.hours || "",
      categoryId: business.categoryId,
      featured: business.featured,
      verified: business.verified || false,
      status: (business.status as "active" | "inactive" | "pending") || "active",
      seoTitle: businessData.seotitle || "",
      seoDescription: businessData.seodescription || "",
      faq: businessData.faq ? (typeof businessData.faq === 'string' ? businessData.faq : JSON.stringify(businessData.faq)) : "",
      socialMedia: {
        facebook: businessData.facebook || "",
        twitter: businessData.twitter || "",
        instagram: businessData.instagram || "",
        linkedin: businessData.linkedin || "",
      },
      ownerInfo: {
        name: businessData.ownerName || "",
        email: businessData.ownerEmail || "",
        phone: businessData.ownerPhone || "",
      },
    });
    setShowEditDialog(true);
  };

  const handleView = (business: Business) => {
    setViewingBusiness(business);
    setShowViewDialog(true);
  };

  const onSubmit = (data: BusinessFormData) => {
    if (editingBusiness) {
      updateBusinessMutation.mutate({ id: editingBusiness.placeid, data });
    } else {
      createBusinessMutation.mutate(data);
    }
  };

  const handleSelectAll = () => {
    if (selectedBusinesses.length === filteredBusinesses.length) {
      setSelectedBusinesses([]);
    } else {
      setSelectedBusinesses(filteredBusinesses.map(business => business.placeid));
    }
  };

  const handleSelectBusiness = (businessId: string) => {
    setSelectedBusinesses(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  const handleMassFeature = (featured: boolean) => {
    massUpdateMutation.mutate({ ids: selectedBusinesses, updates: { featured } });
  };

  const handleMassVerify = (verified: boolean) => {
    massUpdateMutation.mutate({ ids: selectedBusinesses, updates: { verified } });
  };

  const handleMassStatus = (status: "active" | "inactive" | "pending") => {
    massUpdateMutation.mutate({ ids: selectedBusinesses, updates: { status } });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Management</CardTitle>
          <CardDescription>Comprehensive business listing management with full CRUD operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Businesses ({filteredBusinesses.length})</h3>
                {selectedBusinesses.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedBusinesses.length} selected</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMassFeature(true)}
                      disabled={massUpdateMutation.isPending}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Feature
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMassVerify(true)}
                      disabled={massUpdateMutation.isPending}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => massDeleteMutation.mutate(selectedBusinesses)}
                      disabled={massDeleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete ({selectedBusinesses.length})
                    </Button>
                  </div>
                )}
              </div>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Business
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search businesses (name, city, address, phone, email)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
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
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Business Table */}
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedBusinesses.length === filteredBusinesses.length && filteredBusinesses.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Business Details</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business) => (
                    <TableRow key={business.placeid}>
                      <TableCell>
                        <Checkbox
                          checked={selectedBusinesses.includes(business.placeid)}
                          onCheckedChange={() => handleSelectBusiness(business.placeid)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{getBusinessName(business)}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {business.city}
                          </div>
                          <div className="flex gap-1">
                            {business.featured && <Badge variant="default" className="text-xs">Featured</Badge>}
                            {business.verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {business.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {business.phone}
                            </div>
                          )}
                          {business.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {business.email}
                            </div>
                          )}
                          {business.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              Website
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {business.category?.name || (
                          <span className="text-muted-foreground italic">Uncategorized</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          business.status === "active" ? "default" : 
                          business.status === "inactive" ? "destructive" : "secondary"
                        }>
                          {business.status || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          {business.rating && business.rating > 0 ? business.rating.toFixed(1) : (
                            <span className="text-muted-foreground">No rating</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(business)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(business)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(business.placeid)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBusinesses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {searchTerm || filterCategory !== "all" || filterStatus !== "all" 
                          ? "No businesses match your filters." 
                          : "No businesses found. Create your first business to get started."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Business Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          setEditingBusiness(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBusiness ? "Edit Business" : "Create New Business"}</DialogTitle>
            <DialogDescription>
              {editingBusiness ? "Update the business information." : "Add a new business to the directory."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                  <TabsTrigger value="owner">Owner Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Business description..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Select a category</SelectItem>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Full business address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="business@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Hours</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Mon-Fri: 9AM-5PM&#10;Sat: 10AM-3PM&#10;Sun: Closed"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending Review</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Business</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Display this business in the featured section
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="verified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Verified Business</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Mark this business as verified and trustworthy
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter SEO title for search engines" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter meta description for search engines (150-160 characters recommended)"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="faq" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="faq"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequently Asked Questions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter FAQ content in JSON format or plain text"
                            rows={8}
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Add frequently asked questions about this business
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="socialMedia.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/business" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialMedia.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://twitter.com/business" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialMedia.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/business" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialMedia.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/company/business" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="owner" className="space-y-4">
                  <h3 className="text-lg font-medium">Business Owner Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="ownerInfo.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Business owner full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ownerInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner Email</FormLabel>
                          <FormControl>
                            <Input placeholder="owner@business.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ownerInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="submit" disabled={createBusinessMutation.isPending || updateBusinessMutation.isPending}>
                  {(createBusinessMutation.isPending || updateBusinessMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingBusiness ? "Update Business" : "Create Business"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Business Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Business Details</DialogTitle>
            <DialogDescription>Complete information for {getBusinessName(viewingBusiness!)}</DialogDescription>
          </DialogHeader>
          
          {viewingBusiness && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Business Name</h4>
                  <p className="text-sm text-muted-foreground">{getBusinessName(viewingBusiness)}</p>
                </div>
                <div>
                  <h4 className="font-medium">Category</h4>
                  <p className="text-sm text-muted-foreground">{viewingBusiness.category?.name || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium">Address</h4>
                <p className="text-sm text-muted-foreground">{viewingBusiness.address}, {viewingBusiness.city}</p>
              </div>

              {viewingBusiness.description && (
                <div>
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">{viewingBusiness.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {viewingBusiness.phone && (
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-sm text-muted-foreground">{viewingBusiness.phone}</p>
                  </div>
                )}
                {viewingBusiness.email && (
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">{viewingBusiness.email}</p>
                  </div>
                )}
              </div>

              {viewingBusiness.website && (
                <div>
                  <h4 className="font-medium">Website</h4>
                  <p className="text-sm text-muted-foreground">{viewingBusiness.website}</p>
                </div>
              )}

              {viewingBusiness.hours && (
                <div>
                  <h4 className="font-medium">Business Hours</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{viewingBusiness.hours}</p>
                </div>
              )}

              <div className="flex gap-2">
                {viewingBusiness.featured && <Badge>Featured</Badge>}
                {viewingBusiness.verified && <Badge variant="secondary">Verified</Badge>}
                <Badge variant={
                  viewingBusiness.status === "active" ? "default" : 
                  viewingBusiness.status === "inactive" ? "destructive" : "secondary"
                }>
                  {viewingBusiness.status || "active"}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Business</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this business? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmId && deleteBusinessMutation.mutate(deleteConfirmId)}
              disabled={deleteBusinessMutation.isPending}
            >
              {deleteBusinessMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}