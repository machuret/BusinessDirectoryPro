import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Building2, Star, Globe, Phone, Mail, MapPin, Clock } from "lucide-react";
import FAQManager from "../../FAQManager";
import PhotoGalleryManager from "./PhotoGalleryManager";
import ReviewsManager from "./ReviewsManager";

const businessSchema = z.object({
  title: z.string().min(1, "Business name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  hours: z.string().optional(),
  categoryid: z.number().min(1, "Category is required"),
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
  status: z.enum(["active", "pending", "inactive"]).default("active"),
  seotitle: z.string().optional(),
  seodescription: z.string().optional(),
  ownerid: z.string().optional(),
  faq: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).optional()
});

interface BusinessDialogProps {
  open: boolean;
  onClose: () => void;
  business?: any;
  isEdit: boolean;
}

export default function BusinessDialog({ open, onClose, business, isEdit }: BusinessDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const form = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      title: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      website: "",
      description: "",
      hours: "",
      categoryid: 0,
      featured: false,
      verified: false,
      status: "active" as const,
      seotitle: "",
      seodescription: "",
      ownerid: "",
      faq: []
    }
  });

  useEffect(() => {
    if (business && isEdit) {
      const businessName = business.title || business.businessname || business.name || "";
      const parsedFaq = business.faq ? 
        (typeof business.faq === 'string' ? JSON.parse(business.faq) : business.faq) : [];
      
      form.reset({
        title: businessName,
        address: business.address || "",
        city: business.city || "",
        phone: business.phone || "",
        email: business.email || "",
        website: business.website || "",
        description: business.description || "",
        hours: business.hours || "",
        categoryid: business.categoryid || business.categoryId || 0,
        featured: business.featured || false,
        verified: business.verified || false,
        status: business.status || "active",
        seotitle: business.seotitle || "",
        seodescription: business.seodescription || "",
        ownerid: business.ownerid || "",
        faq: Array.isArray(parsedFaq) ? parsedFaq : []
      });
    } else if (!isEdit) {
      form.reset({
        title: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        website: "",
        description: "",
        hours: "",
        categoryid: 0,
        featured: false,
        verified: false,
        status: "active",
        faq: []
      });
    }
  }, [business, isEdit, form]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const slug = data.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      const businessData = {
        ...data,
        placeid: `generated-${Date.now()}`,
        slug,
        faq: JSON.stringify(data.faq || [])
      };
      
      const res = await apiRequest("POST", "/api/admin/businesses", businessData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({
        title: "Success",
        description: "Business created successfully"
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const businessData = {
        ...data,
        faq: JSON.stringify(data.faq || [])
      };
      
      const res = await apiRequest("PUT", `/api/admin/businesses/${business.placeid}`, businessData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({
        title: "Success",
        description: "Business updated successfully"
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: any) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEdit ? "Edit Business" : "Create New Business"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update business information and settings" : "Add a new business to the directory"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                {isEdit && <TabsTrigger value="photos">Photos</TabsTrigger>}
                {isEdit && <TabsTrigger value="reviews">Reviews</TabsTrigger>}
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter business name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category: any) => (
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
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          placeholder="Brief description of the business"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address *
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Street address" />
                        </FormControl>
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
                          <Input {...field} placeholder="City" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone number" />
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
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Email address" />
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
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
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
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Business Hours
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          placeholder="e.g. Mon-Fri 9am-5pm, Sat 10am-2pm, Closed Sunday"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">FAQ</h3>
                  <FormField
                    control={form.control}
                    name="faq"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FAQManager
                            value={field.value || []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign Owner</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "none" ? null : value)} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select owner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Owner</SelectItem>
                            {users?.map((user: any) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">SEO Settings</h3>
                  
                  <FormField
                    control={form.control}
                    name="seotitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Custom page title for search engines" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seodescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3}
                            placeholder="Meta description for search engines (150-160 characters recommended)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-6">
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
                          <FormLabel className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Featured Business
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Display prominently on homepage
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
                            Mark as verified listing
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {isEdit && (
                <TabsContent value="photos" className="space-y-4">
                  <PhotoGalleryManager businessId={business?.placeid} business={business} />
                </TabsContent>
              )}

              {isEdit && (
                <TabsContent value="reviews" className="space-y-4">
                  <ReviewsManager businessId={business?.placeid} business={business} />
                </TabsContent>
              )}
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Update Business" : "Create Business"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}