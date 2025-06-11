import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertTriangle, Upload, Users, Building2, Settings, FileText, Star, Menu, Key, Zap, MapPin, Globe, UserX, UserCheck, Trash2, Edit, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import type { BusinessWithCategory, User, Category, SiteSetting, MenuItem, Page } from "@shared/schema";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("businesses");
  const [businessSearchTerm, setBusinessSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deleteBusinessId, setDeleteBusinessId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithCategory | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [optimizerProgress, setOptimizerProgress] = useState<{type: string, current: number, total: number} | null>(null);
  const [optimizerResults, setOptimizerResults] = useState<any>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showBusinessAssignDialog, setShowBusinessAssignDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [editingCity, setEditingCity] = useState<any>(null);
  const [showCityForm, setShowCityForm] = useState(false);
  const [reviewSearchTerm, setReviewSearchTerm] = useState("");
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);


  // Data queries
  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/admin/businesses"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: ownershipClaims, isLoading: claimsLoading } = useQuery<any[]>({
    queryKey: ["/api/ownership-claims"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });

  // Category management mutations
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/admin/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: siteSettings } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/site-settings"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/admin/menus"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: pages, isLoading: pagesLoading } = useQuery<Page[]>({
    queryKey: ["/api/admin/pages"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: websiteFaqs, isLoading: websiteFaqsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/website-faqs"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: citiesData, isLoading: citiesLoading } = useQuery<{city: string, count: number}[]>({
    queryKey: ["/api/cities"],
    enabled: !!user && (user as any).role === 'admin'
  });

  const { data: allReviews, isLoading: allReviewsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/reviews"],
    enabled: !!user && (user as any).role === 'admin'
  });

  // Separate pending and approved reviews
  const pendingReviews = allReviews?.filter(review => review.status === 'pending') || [];
  const reviews = allReviews?.filter(review => review.status !== 'pending') || [];
  const reviewsLoading = allReviewsLoading;
  const pendingReviewsLoading = allReviewsLoading;

  // CSV Import mutation
  const csvImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/import/businesses', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({
        title: "Import Successful",
        description: `Imported ${data.success} businesses with ${data.errors?.length || 0} errors.`,
      });
      setUploadProgress(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(null);
    },
  });

  // Business mutations
  const deleteBusinessMutation = useMutation({
    mutationFn: async (placeid: string) => {
      await apiRequest("DELETE", `/api/admin/businesses/${placeid}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Business deleted successfully" });
    },
  });



  // Ownership claim mutations
  const processClaimMutation = useMutation({
    mutationFn: async ({ id, status, adminMessage }: { id: number; status: string; adminMessage?: string }) => {
      await apiRequest("PATCH", `/api/ownership-claims/${id}`, { status, adminMessage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ownership-claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Ownership claim processed successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error processing claim",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Review management mutations
  const approveReviewMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes?: string }) => {
      await apiRequest("PATCH", `/api/admin/reviews/${id}/approve`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews/pending"] });
      toast({ title: "Review approved successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error approving review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectReviewMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes?: string }) => {
      await apiRequest("PATCH", `/api/admin/reviews/${id}/reject`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews/pending"] });
      toast({ title: "Review rejected successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error rejecting review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Business update mutation
  const updateBusinessMutation = useMutation({
    mutationFn: async (params: { id: string; featured?: boolean; data?: any }) => {
      const updateData = params.featured !== undefined ? { featured: params.featured } : params.data;
      await apiRequest("PATCH", `/api/businesses/${params.id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses/featured"] });
      setEditingBusiness(null);
      setShowBusinessForm(false);
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

  // City update mutation
  const updateCityMutation = useMutation({
    mutationFn: async (params: { oldName: string; newName: string; description?: string }) => {
      await apiRequest("PATCH", `/api/admin/cities/${encodeURIComponent(params.oldName)}`, {
        newName: params.newName,
        description: params.description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      setEditingCity(null);
      setShowCityForm(false);
      toast({ title: "City updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "City update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mass user action mutation
  const massUserActionMutation = useMutation({
    mutationFn: async ({ userIds, action }: { userIds: string[]; action: "suspend" | "activate" | "delete" }) => {
      await apiRequest("POST", `/api/admin/users/mass-action`, { userIds, action });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: `Users ${action}d successfully` });
      setSelectedUsers([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Mass action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mass review action mutation
  const massReviewActionMutation = useMutation({
    mutationFn: async ({ reviewIds, action }: { reviewIds: number[]; action: "approve" | "reject" }) => {
      await apiRequest("POST", `/api/admin/reviews/mass-action`, { reviewIds, action });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: `Reviews ${action}d successfully` });
      setSelectedReviews([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Mass review action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      await apiRequest("DELETE", `/api/admin/reviews/${reviewId}`);
    },
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews/pending"] });
      toast({ title: "Review deleted successfully" });
      setSelectedReviews(prev => prev.filter(id => id !== reviewId));
    },
    onError: (error: Error) => {
      toast({
        title: "Review deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk delete businesses mutation
  const bulkDeleteBusinessesMutation = useMutation({
    mutationFn: async (businessIds: string[]) => {
      await apiRequest("POST", "/api/admin/businesses/bulk-delete", { businessIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      setSelectedBusinesses([]);
      toast({ title: "Selected businesses deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // User mutations
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<User> }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
      setShowUserForm(false);
    },
  });

  // Site settings mutations
  const updateSiteSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await apiRequest("PATCH", `/api/admin/site-settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      toast({ title: "Setting updated successfully" });
    },
  });

  // Menu management mutation for delete only (edit happens on separate page)
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/menus/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menus"] });
      toast({ title: "Menu item deleted successfully" });
    },
  });

  // Category deletion mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // OpenAI optimization mutations
  const optimizeDescriptionsMutation = useMutation({
    mutationFn: async (businessIds: string[]) => {
      const res = await apiRequest("POST", "/api/admin/optimize/descriptions", { businessIds });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      setOptimizerProgress(null);
      setSelectedBusinesses([]);
      setOptimizerResults(data);
      setShowResultsModal(true);
      toast({ 
        title: "Descriptions optimized successfully",
        description: `${data.success} businesses updated, ${data.errors.length} errors`
      });
    },
    onError: (error: Error) => {
      setOptimizerProgress(null);
      toast({
        title: "Optimization failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateFAQsMutation = useMutation({
    mutationFn: async (businessIds: string[]) => {
      const res = await apiRequest("POST", "/api/admin/optimize/faqs", { businessIds });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      setOptimizerProgress(null);
      setSelectedBusinesses([]);
      setOptimizerResults(data);
      setShowResultsModal(true);
      toast({ 
        title: "FAQs generated successfully",
        description: `${data.success} businesses updated, ${data.errors.length} errors`
      });
    },
    onError: (error: Error) => {
      setOptimizerProgress(null);
      toast({
        title: "FAQ generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Page management mutations
  const createPageMutation = useMutation({
    mutationFn: async (pageData: any) => {
      const res = await apiRequest("POST", "/api/admin/pages", pageData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      setShowPageForm(false);
      setEditingPage(null);
      toast({ title: "Page created successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Create failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, ...pageData }: any) => {
      const res = await apiRequest("PATCH", `/api/admin/pages/${id}`, pageData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      setShowPageForm(false);
      setEditingPage(null);
      toast({ title: "Page updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishPageMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/admin/pages/${id}/publish`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ title: "Page published successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Publish failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/pages/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      setDeletingPageId(null);
      toast({ title: "Page deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setUploadProgress(0);
      csvImportMutation.mutate(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const editBusiness = (business: BusinessWithCategory) => {
    setEditingBusiness(business);
    setShowBusinessForm(true);
  };

  const handleUpdateBusiness = (formData: FormData) => {
    if (!editingBusiness) return;

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      phone: formData.get("phone"),
      website: formData.get("website"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      postalcode: formData.get("postalcode"),
      categoryname: formData.get("categoryname"),
      seotitle: formData.get("seotitle") || null,
      seodescription: formData.get("seodescription") || null,
    };

    updateBusinessMutation.mutate({
      id: editingBusiness.placeid,
      data
    });
  };

  const editUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  // Page management functions
  const handleCreatePage = (formData: FormData) => {
    const data = {
      title: formData.get("title"),
      content: formData.get("content"),
      seoTitle: formData.get("seoTitle") || null,
      seoDescription: formData.get("seoDescription") || null,
      status: formData.get("status") || "draft",
    };
    createPageMutation.mutate(data);
  };

  const handleUpdatePage = (formData: FormData) => {
    if (!editingPage) return;
    
    const data = {
      id: editingPage.id,
      title: formData.get("title"),
      content: formData.get("content"),
      seoTitle: formData.get("seoTitle") || null,
      seoDescription: formData.get("seoDescription") || null,
      status: formData.get("status") || "draft",
    };
    updatePageMutation.mutate(data);
  };

  const editPage = (page: Page) => {
    setEditingPage(page);
    setShowPageForm(true);
  };

  // Business selection helpers
  const toggleBusinessSelection = (businessId: string) => {
    setSelectedBusinesses(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  const selectAllBusinesses = () => {
    const allIds = filteredBusinesses?.map(b => b.placeid) || [];
    setSelectedBusinesses(allIds);
  };

  const clearBusinessSelection = () => {
    setSelectedBusinesses([]);
  };

  const handleOptimizeDescriptions = () => {
    if (selectedBusinesses.length === 0) {
      toast({
        title: "No businesses selected",
        description: "Please select businesses to optimize",
        variant: "destructive",
      });
      return;
    }
    setOptimizerProgress({type: 'descriptions', current: 0, total: selectedBusinesses.length});
    optimizeDescriptionsMutation.mutate(selectedBusinesses);
  };

  const handleGenerateFAQs = () => {
    if (selectedBusinesses.length === 0) {
      toast({
        title: "No businesses selected",
        description: "Please select businesses to generate FAQs for",
        variant: "destructive",
      });
      return;
    }
    setOptimizerProgress({type: 'faqs', current: 0, total: selectedBusinesses.length});
    generateFAQsMutation.mutate(selectedBusinesses);
  };

  const handleBulkDelete = () => {
    if (selectedBusinesses.length === 0) {
      toast({
        title: "No businesses selected",
        description: "Please select businesses to delete",
        variant: "destructive",
      });
      return;
    }
    
    const confirmMessage = `Are you sure you want to delete ${selectedBusinesses.length} selected business${selectedBusinesses.length > 1 ? 'es' : ''}? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      bulkDeleteBusinessesMutation.mutate(selectedBusinesses);
    }
  };

  // User selection handlers
  const handleSelectAllUsers = (checked: boolean) => {
    if (checked && filteredUsers) {
      setSelectedUsers(filteredUsers.map((user: any) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Review selection handlers
  const handleSelectAllReviews = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(filteredReviews.map((review: any) => review.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleReviewSelect = (reviewId: number, checked: boolean) => {
    if (checked) {
      setSelectedReviews(prev => [...prev, reviewId]);
    } else {
      setSelectedReviews(prev => prev.filter(id => id !== reviewId));
    }
  };

  // Auth check
  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Access Denied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need administrator privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredBusinesses = businesses?.filter(business =>
    (business.title || '').toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
    (business.city || '').toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
    (business.categoryname || '').toLowerCase().includes(businessSearchTerm.toLowerCase())
  );

  const filteredUsers = users?.filter(user =>
    user.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredReviews = allReviews?.filter(review =>
    (review.authorName || '').toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
    (review.comment || '').toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
    (review.businessId || '').toLowerCase().includes(reviewSearchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage businesses, users, and site settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
          <TabsTrigger value="businesses" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Businesses</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="cities" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Cities</span>
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Pages</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Claims</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </TabsTrigger>
          <TabsTrigger value="optimizer" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>OPTIMIZER</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Global SEO</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Businesses Tab */}
        <TabsContent value="businesses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Management</CardTitle>
              <CardDescription>Manage business listings and their details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Search businesses..."
                  value={businessSearchTerm}
                  onChange={(e) => setBusinessSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex space-x-2">
                  {selectedBusinesses.length > 0 && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        disabled={bulkDeleteBusinessesMutation.isPending}
                      >
                        Delete Selected ({selectedBusinesses.length})
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearBusinessSelection}
                      >
                        Clear Selection
                      </Button>
                    </>
                  )}
                  <Button onClick={() => setShowBusinessForm(true)}>Add Business</Button>
                </div>
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
                        <TableHead>Status</TableHead>
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
                              <p className="font-medium">{business.title}</p>
                              <p className="text-sm text-muted-foreground">{business.subtitle}</p>
                            </div>
                          </TableCell>
                          <TableCell>{business.categoryname || 'No Category'}</TableCell>
                          <TableCell>{business.city}, {business.state}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {business.featured && (
                                <Badge variant="default">Featured</Badge>
                              )}
                              {business.permanentlyclosed && (
                                <Badge variant="destructive">Closed</Badge>
                              )}
                              {business.temporarilyclosed && (
                                <Badge variant="secondary">Temp Closed</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/business/${business.slug || business.placeid}`, '_blank')}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateBusinessMutation.mutate({ 
                                  id: business.placeid, 
                                  featured: !(business.featured || false)
                                })}
                                disabled={updateBusinessMutation.isPending}
                              >
                                {business.featured ? 'Unfeature' : 'Feature'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editBusiness(business)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this business?')) {
                                    deleteBusinessMutation.mutate(business.placeid);
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex gap-2">
                  {selectedUsers.length > 0 && (
                    <>
                      <Button
                        onClick={() => massUserActionMutation.mutate({ userIds: selectedUsers, action: "suspend" })}
                        variant="outline"
                        size="sm"
                        disabled={massUserActionMutation.isPending}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Suspend ({selectedUsers.length})
                      </Button>
                      <Button
                        onClick={() => massUserActionMutation.mutate({ userIds: selectedUsers, action: "activate" })}
                        variant="outline"
                        size="sm"
                        disabled={massUserActionMutation.isPending}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate ({selectedUsers.length})
                      </Button>
                      <Button
                        onClick={() => massUserActionMutation.mutate({ userIds: selectedUsers, action: "delete" })}
                        variant="destructive"
                        size="sm"
                        disabled={massUserActionMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete ({selectedUsers.length})
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {usersLoading ? (
                <p>Loading users...</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.length === (filteredUsers?.length || 0) && (filteredUsers?.length || 0) > 0}
                            onCheckedChange={handleSelectAllUsers}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => handleUserSelect(user.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editUser(user)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this user?')) {
                                    deleteUserMutation.mutate(user.id);
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cities Tab */}
        <TabsContent value="cities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cities Management</CardTitle>
              <CardDescription>View and manage cities with business listings</CardDescription>
            </CardHeader>
            <CardContent>
              {citiesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !citiesData || citiesData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No cities with businesses found.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Cities are automatically created when businesses are added with city information.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {citiesData.map((city) => (
                      <Card key={city.city} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{city.city}</h3>
                              <p className="text-sm text-gray-600">
                                {city.count} business{city.count !== 1 ? 'es' : ''}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCity(city);
                                  setShowCityForm(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/cities/${encodeURIComponent(city.city)}`, '_blank')}
                              >
                                View Page
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>Edit category titles and descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {!categories ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No categories found.
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="border">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: category.color || '#6366f1' }}
                              />
                              <h3 className="font-semibold text-lg">{category.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                ID: {category.id}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Category Title</label>
                              <input
                                type="text"
                                defaultValue={category.name}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onBlur={(e) => {
                                  if (e.target.value !== category.name) {
                                    updateCategoryMutation.mutate({
                                      id: category.id,
                                      data: { name: e.target.value }
                                    });
                                  }
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Color</label>
                              <input
                                type="color"
                                defaultValue={category.color || '#6366f1'}
                                className="w-full h-10 border border-gray-300 rounded-md"
                                onChange={(e) => {
                                  updateCategoryMutation.mutate({
                                    id: category.id,
                                    data: { color: e.target.value }
                                  });
                                }}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                              defaultValue={category.description || ''}
                              placeholder="Enter category description..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                              onBlur={(e) => {
                                if (e.target.value !== (category.description || '')) {
                                  updateCategoryMutation.mutate({
                                    id: category.id,
                                    data: { description: e.target.value }
                                  });
                                }
                              }}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-sm text-gray-500">
                              Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updateCategoryMutation.isPending}
                              >
                                {updateCategoryMutation.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteCategoryMutation.isPending}
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
                                    deleteCategoryMutation.mutate(category.id);
                                  }
                                }}
                              >
                                {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ownership Claims Tab */}
        <TabsContent value="claims" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Ownership Claims</CardTitle>
              <CardDescription>Review and manage business ownership requests</CardDescription>
            </CardHeader>
            <CardContent>
              {claimsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !ownershipClaims || ownershipClaims.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No ownership claims found.
                </div>
              ) : (
                <div className="space-y-4">
                  {ownershipClaims.map((claim: any) => (
                    <Card key={claim.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">Business ID: {claim.businessId}</h3>
                              <Badge variant={
                                claim.status === 'pending' ? 'default' :
                                claim.status === 'approved' ? 'default' :
                                'destructive'
                              }>
                                {claim.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>Requester:</strong> {claim.userId}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Message:</strong> {claim.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                            </p>
                            {claim.adminMessage && (
                              <p className="text-sm text-gray-600">
                                <strong>Admin Response:</strong> {claim.adminMessage}
                              </p>
                            )}
                          </div>
                          {claim.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Review Ownership Claim</DialogTitle>
                                    <DialogDescription>
                                      Review and approve or reject this business ownership claim request.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <p><strong>Business ID:</strong> {claim.businessId}</p>
                                      <p><strong>Requester:</strong> {claim.userId}</p>
                                      <p><strong>Message:</strong> {claim.message}</p>
                                    </div>
                                    <div>
                                      <Label htmlFor="admin-response">Admin Response (Optional)</Label>
                                      <Textarea
                                        id="admin-response"
                                        placeholder="Add a message for the user..."
                                        onChange={(e) => {
                                          // Store response in state if needed
                                        }}
                                      />
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={() => {
                                          const textarea = document.getElementById('admin-response') as HTMLTextAreaElement;
                                          processClaimMutation.mutate({
                                            id: claim.id,
                                            status: 'approved',
                                            adminMessage: textarea?.value || undefined
                                          });
                                        }}
                                        className="flex-1"
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => {
                                          const textarea = document.getElementById('admin-response') as HTMLTextAreaElement;
                                          processClaimMutation.mutate({
                                            id: claim.id,
                                            status: 'rejected',
                                            adminMessage: textarea?.value || 'Claim rejected by admin.'
                                          });
                                        }}
                                        className="flex-1"
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV Import</CardTitle>
              <CardDescription>Import business data from CSV files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={csvImportMutation.isPending}
                  />
                </div>
                
                {csvImportMutation.isPending && (
                  <div className="space-y-2">
                    <p>Importing businesses...</p>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>CSV should include columns like: placeid, title, description, categoryname, city, state, etc.</p>
                  <p>Total businesses: {businesses?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    defaultValue={siteSettings?.find(s => s.key === 'openai_api_key')?.value || ''}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateSiteSettingMutation.mutate({
                          key: 'openai_api_key',
                          value: e.currentTarget.value
                        });
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const input = document.getElementById('openai-key') as HTMLInputElement;
                      if (input) {
                        updateSiteSettingMutation.mutate({
                          key: 'openai_api_key',
                          value: input.value
                        });
                      }
                    }}
                    disabled={updateSiteSettingMutation.isPending}
                  >
                    {updateSiteSettingMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  OpenAI API key for content optimization. Get yours at platform.openai.com
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OPTIMIZER Tab */}
        <TabsContent value="optimizer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Content OPTIMIZER</CardTitle>
              <CardDescription>Mass optimize business content using AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Select Businesses</h3>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={selectAllBusinesses}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearBusinessSelection}>
                      Clear Selection
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
                  {filteredBusinesses?.map((business) => (
                    <div key={business.placeid} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedBusinesses.includes(business.placeid)}
                        onChange={() => toggleBusinessSelection(business.placeid)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {business.title} - {business.city}
                      </span>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedBusinesses.length} businesses
                </p>
              </div>

              {/* Optimization Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Improve Descriptions</CardTitle>
                    <CardDescription>
                      Enhance existing business descriptions using AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleOptimizeDescriptions}
                      disabled={optimizeDescriptionsMutation.isPending || selectedBusinesses.length === 0}
                      className="w-full"
                    >
                      {optimizeDescriptionsMutation.isPending ? "Optimizing..." : "Improve Descriptions"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Generate FAQs</CardTitle>
                    <CardDescription>
                      Create 4 FAQ questions and answers for businesses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleGenerateFAQs}
                      disabled={generateFAQsMutation.isPending || selectedBusinesses.length === 0}
                      className="w-full"
                    >
                      {generateFAQsMutation.isPending ? "Generating..." : "Create FAQs"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Display */}
              {optimizerProgress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {optimizerProgress.type === 'descriptions' ? 'Optimizing Descriptions' : 'Generating FAQs'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{optimizerProgress.current} / {optimizerProgress.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(optimizerProgress.current / optimizerProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global SEO Settings</CardTitle>
              <CardDescription>Configure website-wide SEO and analytics settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="website-title">Website Title</Label>
                    <Input
                      id="website-title"
                      placeholder="Your Business Directory"
                      defaultValue={siteSettings?.find(s => s.key === 'website_title')?.value || ''}
                      onBlur={(e) => {
                        updateSiteSettingMutation.mutate({
                          key: 'website_title',
                          value: e.target.value
                        });
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Main title displayed in browser tabs and search results
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="website-description">Website Description</Label>
                    <Textarea
                      id="website-description"
                      placeholder="Find the best local businesses in your area..."
                      defaultValue={siteSettings?.find(s => s.key === 'website_description')?.value || ''}
                      onBlur={(e) => {
                        updateSiteSettingMutation.mutate({
                          key: 'website_description',
                          value: e.target.value
                        });
                      }}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Meta description for search engines (150-160 characters)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@yourdomain.com"
                      defaultValue={siteSettings?.find(s => s.key === 'admin_email')?.value || ''}
                      onBlur={(e) => {
                        updateSiteSettingMutation.mutate({
                          key: 'admin_email',
                          value: e.target.value
                        });
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Contact email for administrative purposes
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="opengraph-image">Open Graph Image URL</Label>
                    <Input
                      id="opengraph-image"
                      placeholder="https://yourdomain.com/og-image.jpg"
                      defaultValue={siteSettings?.find(s => s.key === 'opengraph_image')?.value || ''}
                      onBlur={(e) => {
                        updateSiteSettingMutation.mutate({
                          key: 'opengraph_image',
                          value: e.target.value
                        });
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Image displayed when sharing on social media (1200x630px recommended)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="google-analytics">Google Analytics Code</Label>
                    <Textarea
                      id="google-analytics"
                      placeholder="<script>&#10;// Your Google Analytics code here&#10;</script>"
                      defaultValue={siteSettings?.find(s => s.key === 'google_analytics')?.value || ''}
                      onBlur={(e) => {
                        updateSiteSettingMutation.mutate({
                          key: 'google_analytics',
                          value: e.target.value
                        });
                      }}
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Complete Google Analytics or other tracking code (will be added to header)
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Preview</h3>
                    <p className="text-sm text-gray-500">How your site appears in search results</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast({ title: "SEO settings saved successfully" });
                    }}
                  >
                    Save All SEO Settings
                  </Button>
                </div>
                
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {siteSettings?.find(s => s.key === 'website_title')?.value || 'Your Business Directory'}
                  </div>
                  <div className="text-green-700 text-sm">
                    yourdomain.com
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {siteSettings?.find(s => s.key === 'website_description')?.value || 'Find the best local businesses in your area...'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Enhanced Review Management
              </CardTitle>
              <CardDescription>
                Mass review operations and advanced review filtering. {pendingReviews?.length || 0} pending review(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Input
                  placeholder="Search reviews..."
                  value={reviewSearchTerm}
                  onChange={(e) => setReviewSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex gap-2">
                  {selectedReviews.length > 0 && (
                    <>
                      <Button
                        onClick={() => massReviewActionMutation.mutate({ reviewIds: selectedReviews, action: "approve" })}
                        variant="outline"
                        size="sm"
                        disabled={massReviewActionMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve ({selectedReviews.length})
                      </Button>
                      <Button
                        onClick={() => massReviewActionMutation.mutate({ reviewIds: selectedReviews, action: "reject" })}
                        variant="outline"
                        size="sm"
                        disabled={massReviewActionMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject ({selectedReviews.length})
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${selectedReviews.length} selected review(s)? This action cannot be undone.`)) {
                            selectedReviews.forEach(reviewId => {
                              deleteReviewMutation.mutate(reviewId);
                            });
                          }
                        }}
                        variant="destructive"
                        size="sm"
                        disabled={deleteReviewMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete ({selectedReviews.length})
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {reviewsLoading || pendingReviewsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pending Reviews Section */}
                  {pendingReviews && pendingReviews.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-orange-600">
                        Pending Reviews ({pendingReviews.length})
                      </h3>
                      <div className="space-y-4">
                        {pendingReviews.map((review: any) => (
                          <Card key={review.id} className="border-orange-200">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-medium">{review.authorName}</span>
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <Badge variant="outline" className="text-orange-600">
                                      Pending
                                    </Badge>
                                  </div>
                                  {review.title && (
                                    <h4 className="font-semibold mb-1">{review.title}</h4>
                                  )}
                                  <p className="text-gray-600 mb-2">{review.comment}</p>
                                  <p className="text-sm text-gray-500">
                                    Business ID: {review.businessId} • {new Date(review.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <Button
                                    size="sm"
                                    onClick={() => approveReviewMutation.mutate({ id: review.id })}
                                    disabled={approveReviewMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => rejectReviewMutation.mutate({ id: review.id })}
                                    disabled={rejectReviewMutation.isPending}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Reviews Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">All Reviews</h3>
                    {reviews && reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review: any) => (
                          <Card key={review.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium">{review.authorName}</span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <Badge 
                                  variant={review.status === 'approved' ? 'default' : review.status === 'rejected' ? 'destructive' : 'secondary'}
                                >
                                  {review.status}
                                </Badge>
                              </div>
                              {review.title && (
                                <h4 className="font-semibold mb-1">{review.title}</h4>
                              )}
                              <p className="text-gray-600 mb-2">{review.comment}</p>
                              <p className="text-sm text-gray-500">
                                Business ID: {review.businessId} • {new Date(review.createdAt).toLocaleDateString()}
                                {review.reviewedAt && ` • Reviewed: ${new Date(review.reviewedAt).toLocaleDateString()}`}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No reviews found.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Management</CardTitle>
              <CardDescription>Create and manage website pages with SEO optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Button 
                  onClick={() => {
                    setEditingPage(null);
                    setShowPageForm(true);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Globe className="h-4 w-4" />
                  <span>Create New Page</span>
                </Button>
              </div>

              {pagesLoading ? (
                <p>Loading pages...</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>SEO Title</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pages?.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell className="font-medium">{page.title}</TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-1 rounded">/{page.slug}</code>
                          </TableCell>
                          <TableCell>
                            <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                              {page.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {page.seoTitle || 'No SEO title'}
                          </TableCell>
                          <TableCell>
                            {page.createdAt ? new Date(page.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/pages/${page.slug}`, '_blank')}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editPage(page)}
                              >
                                Edit
                              </Button>
                              {page.status === 'draft' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => publishPageMutation.mutate(page.id)}
                                  disabled={publishPageMutation.isPending}
                                >
                                  Publish
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this page?')) {
                                    deletePageMutation.mutate(page.id);
                                  }
                                }}
                                disabled={deletePageMutation.isPending}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {(!pages || pages.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No pages found. Create your first page to get started.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Management Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Website FAQ Management
              </CardTitle>
              <CardDescription>
                Manage frequently asked questions for your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Button onClick={() => setShowFaqForm(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Add New FAQ
                </Button>
              </div>

              {websiteFaqsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : websiteFaqs && websiteFaqs.length > 0 ? (
                <div className="space-y-4">
                  {websiteFaqs.map((faq) => (
                    <Card key={faq.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{faq.question}</h3>
                            <p className="text-gray-600 mb-2">{faq.answer}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Badge variant={faq.category ? 'secondary' : 'outline'}>
                                {faq.category || 'General'}
                              </Badge>
                              <span>Order: {faq.sortOrder}</span>
                              <Badge variant={faq.isActive ? 'default' : 'destructive'}>
                                {faq.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editFaq(faq)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this FAQ?')) {
                                  deleteFaqMutation.mutate(faq.id);
                                }
                              }}
                              disabled={deleteFaqMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No FAQs found. Add your first FAQ to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>Configure site-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {siteSettings?.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <Label>{setting.key}</Label>
                    <div className="flex space-x-2">
                      <Input
                        defaultValue={setting.value || ''}
                        onBlur={(e) => {
                          if (e.target.value !== setting.value) {
                            updateSiteSettingMutation.mutate({
                              key: setting.key,
                              value: e.target.value
                            });
                          }
                        }}
                      />
                    </div>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Businesses Tab */}
        <TabsContent value="featured" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured Business Management</CardTitle>
              <CardDescription>Control which businesses are featured on the homepage and how many to display</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Featured Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxFeatured">Maximum Featured Businesses</Label>
                    <Input
                      id="maxFeatured"
                      type="number" 
                      min="1"
                      max="20"
                      defaultValue="6"
                      className="max-w-xs"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button>Update Settings</Button>
                  </div>
                </div>

                {/* Featured Business List */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Featured Businesses</h3>
                  {businessesLoading ? (
                    <p>Loading businesses...</p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Business</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {businesses?.filter(business => 
                            business.title?.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
                            business.categoryname?.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
                            business.city?.toLowerCase().includes(businessSearchTerm.toLowerCase())
                          ).map((business) => (
                            <TableRow key={business.placeid}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{business.title}</div>
                                  {business.phone && (
                                    <div className="text-sm text-muted-foreground">{business.phone}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{business.categoryname}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {business.city}, {business.state}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={business.featured ? "default" : "outline"}>
                                  {business.featured ? "Featured" : "Not Featured"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant={business.featured ? "outline" : "default"}
                                    onClick={() => {
                                      // Toggle featured status
                                      updateBusinessMutation.mutate({
                                        id: business.placeid,
                                        featured: !business.featured
                                      });
                                    }}
                                  >
                                    {business.featured ? "Remove Featured" : "Make Featured"}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu Management Tab */}
        <TabsContent value="menus" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header Menu */}
            <Card>
              <CardHeader>
                <CardTitle>Header Menu</CardTitle>
                <CardDescription>Manage navigation menu items in the header</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menuItemsLoading ? (
                    <p>Loading menu items...</p>
                  ) : (
                    <>
                      {menuItems?.filter(item => item.position === 'header').map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setLocation(`/admin/menu/${item.id}`)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this menu item?')) {
                                    deleteMenuItemMutation.mutate(item.id);
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">Link: {item.url}</p>
                          <p className="text-xs text-gray-400">Order: {item.order}</p>
                        </div>
                      ))}
                      <Button 
                        className="w-full"
                        onClick={() => setLocation('/admin/menu/new')}
                      >
                        Add New Menu Item
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Footer Menu */}
            <Card>
              <CardHeader>
                <CardTitle>Footer Menu</CardTitle>
                <CardDescription>Manage footer links and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menuItemsLoading ? (
                    <p>Loading menu items...</p>
                  ) : (
                    <>
                      {menuItems?.filter(item => item.position === 'footer').map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setLocation(`/admin/menu/${item.id}`)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this menu item?')) {
                                    deleteMenuItemMutation.mutate(item.id);
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">Link: {item.url}</p>
                          <p className="text-xs text-gray-400">Order: {item.order}</p>
                        </div>
                      ))}
                      <Button 
                        className="w-full"
                        onClick={() => setLocation('/admin/menu/new')}
                      >
                        Add New Footer Link
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Business Edit Modal */}
      {editingBusiness && (
        <Dialog open={showBusinessForm} onOpenChange={(open) => {
          if (!open) {
            setShowBusinessForm(false);
            setEditingBusiness(null);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Business: {editingBusiness.title}</DialogTitle>
              <DialogDescription>
                Update business information and SEO settings.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateBusiness(formData);
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="title">Business Name</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingBusiness.title || ""}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingBusiness.description || ""}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editingBusiness.phone || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    defaultValue={editingBusiness.website || ""}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={editingBusiness.address || ""}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={editingBusiness.city || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={editingBusiness.state || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="postalcode">Postal Code</Label>
                  <Input
                    id="postalcode"
                    name="postalcode"
                    defaultValue={editingBusiness.postalcode || ""}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="categoryname">Category</Label>
                <Select name="categoryname" defaultValue={editingBusiness.categoryname || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SEO Section */}
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold mb-3">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="seotitle">SEO Title</Label>
                    <Input
                      id="seotitle"
                      name="seotitle"
                      defaultValue={editingBusiness.seotitle || ""}
                      placeholder="Enter custom SEO title (auto-generated if empty)"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 50-60 characters. Leave empty for auto-generation.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="seodescription">SEO Description</Label>
                    <Textarea
                      id="seodescription"
                      name="seodescription"
                      defaultValue={editingBusiness.seodescription || ""}
                      placeholder="Enter custom SEO description (auto-generated if empty)"
                      maxLength={160}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 150-160 characters. Leave empty for auto-generation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBusinessForm(false);
                    setEditingBusiness(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateBusinessMutation.isPending}
                >
                  {updateBusinessMutation.isPending ? "Updating..." : "Update Business"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* User Edit Dialog */}
      {showUserForm && editingUser && (
        <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user account information and role permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                firstName: formData.get("firstName") as string,
                lastName: formData.get("lastName") as string,
                email: formData.get("email") as string,
                role: formData.get("role") as string,
              };
              updateUserMutation.mutate({ id: editingUser.id, userData: data });
            }} className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={editingUser.firstName || ""}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={editingUser.lastName || ""}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingUser.email}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={editingUser.role || "user"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowUserForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Page Form Dialog */}
      {showPageForm && (
        <Dialog open={showPageForm} onOpenChange={setShowPageForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
              <DialogDescription>
                {editingPage ? 'Update page content and SEO settings' : 'Create a new page with content and SEO optimization'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (editingPage) {
                handleUpdatePage(formData);
              } else {
                handleCreatePage(formData);
              }
            }} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div>
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    defaultValue={editingPage?.title || ""}
                    placeholder="Enter page title"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Page Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    rows={12}
                    defaultValue={editingPage?.content || ""}
                    placeholder="Enter page content using HTML or plain text..."
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingPage?.status || "draft"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">SEO Settings</h3>
                
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    name="seoTitle"
                    defaultValue={editingPage?.seoTitle || ""}
                    placeholder="Custom title for search engines (optional)"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    If empty, the page title will be used for SEO
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    rows={3}
                    defaultValue={editingPage?.seoDescription || ""}
                    placeholder="Brief description for search engine results (optional)"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Recommended: 150-160 characters
                  </p>
                </div>
              </div>

              {/* URL Preview */}
              {editingPage && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">URL Preview</h3>
                  <div className="p-3 bg-muted rounded-md">
                    <code className="text-sm">/{editingPage.slug}</code>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowPageForm(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPageMutation.isPending || updatePageMutation.isPending}
                >
                  {createPageMutation.isPending || updatePageMutation.isPending 
                    ? "Saving..." 
                    : editingPage ? "Update Page" : "Create Page"
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Optimization Results Dialog */}
      {showResultsModal && optimizerResults && (
        <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI Optimization Results</DialogTitle>
              <DialogDescription>
                Review the results of AI-powered business description and FAQ optimization.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{optimizerResults.success}</div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{optimizerResults.errors.length}</div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{optimizerResults.details.length}</div>
                    <div className="text-sm text-gray-600">Total Processed</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detailed Results</h3>
                
                {optimizerResults.details.map((detail: any, index: number) => (
                  <Card key={index} className={`${
                    detail.status === 'optimized' || detail.status === 'created' ? 'border-green-200' :
                    detail.status === 'error' ? 'border-red-200' : 'border-yellow-200'
                  }`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{detail.businessName}</CardTitle>
                        <Badge variant={
                          detail.status === 'optimized' || detail.status === 'created' ? 'default' :
                          detail.status === 'error' ? 'destructive' : 'secondary'
                        }>
                          {detail.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {detail.status === 'error' ? (
                        <div className="text-red-600 text-sm">{detail.error}</div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">Before:</div>
                            <div className="text-sm bg-gray-50 p-2 rounded border">
                              {detail.before}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">After:</div>
                            <div className="text-sm bg-green-50 p-2 rounded border border-green-200">
                              {detail.after}
                            </div>
                          </div>

                          {detail.faqItems && (
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-2">Generated FAQ Items:</div>
                              <div className="space-y-2">
                                {detail.faqItems.map((faq: any, faqIndex: number) => (
                                  <div key={faqIndex} className="bg-blue-50 p-2 rounded border border-blue-200">
                                    <div className="font-medium text-sm">{faq.question}</div>
                                    <div className="text-sm text-gray-600 mt-1">{faq.answer}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Errors Section */}
              {optimizerResults.errors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">Errors Encountered</h3>
                  <div className="space-y-2">
                    {optimizerResults.errors.map((error: any, index: number) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="font-medium text-sm">{error.businessName}</div>
                        <div className="text-sm text-red-600">{error.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setShowResultsModal(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* City Edit Dialog */}
      {showCityForm && editingCity && (
        <Dialog open={showCityForm} onOpenChange={setShowCityForm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit City</DialogTitle>
              <DialogDescription>Update city name and description</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newName = formData.get('newName') as string;
                const description = formData.get('description') as string;
                
                updateCityMutation.mutate({
                  oldName: editingCity.city,
                  newName: newName.trim(),
                  description: description.trim()
                });
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currentName" className="text-right">
                    Current Name
                  </Label>
                  <Input
                    id="currentName"
                    value={editingCity.city}
                    disabled
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newName" className="text-right">
                    New Name
                  </Label>
                  <Input
                    id="newName"
                    name="newName"
                    defaultValue={editingCity.city}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Optional description for this city"
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p>Business count: {editingCity.count}</p>
                  <p className="mt-1">Note: Changing the city name will update all businesses in this city.</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCityForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCityMutation.isPending}>
                  {updateCityMutation.isPending ? "Updating..." : "Update City"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}