import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import type { MenuItem } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function MenuEdit() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    position: "header",
    order: 0,
    isActive: true,
    target: "_self"
  });

  const isNewItem = id === "new";

  // Fetch menu item if editing existing item
  const { data: menuItem, isLoading } = useQuery<MenuItem>({
    queryKey: ["/api/admin/menus", id],
    enabled: !isNewItem && !!id && !!user && (user as any).role === 'admin',
  });

  // Update form data when menu item loads
  useEffect(() => {
    if (menuItem) {
      setFormData({
        name: menuItem.name,
        url: menuItem.url,
        position: menuItem.position,
        order: menuItem.order,
        isActive: menuItem.isActive,
        target: menuItem.target || "_self"
      });
    }
  }, [menuItem]);

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/admin/menus", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menus"] });
      toast({ title: "Menu item created successfully" });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Create failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("PATCH", `/api/admin/menus/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menus"] });
      toast({ title: "Menu item updated successfully" });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/menus/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menus"] });
      toast({ title: "Menu item deleted successfully" });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewItem) {
      createMenuItemMutation.mutate(formData);
    } else {
      updateMenuItemMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItemMutation.mutate();
    }
  };

  // Check if user is admin
  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <p>You need administrator privileges to access this page.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading && !isNewItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/admin")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-2xl font-bold">
              {isNewItem ? "Add New Menu Item" : "Edit Menu Item"}
            </h1>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isNewItem ? "Create Menu Item" : "Update Menu Item"}
              </CardTitle>
              <CardDescription>
                {isNewItem 
                  ? "Add a new navigation item to your website menu"
                  : "Modify the details of this menu item"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Menu Item Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Home, About Us, Contact"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="e.g., /, /about, /contact, https://example.com"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Select 
                      value={formData.position} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target">Link Target</Label>
                    <Select 
                      value={formData.target} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, target: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_self">Same Window</SelectItem>
                        <SelectItem value="_blank">New Window</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="isActive">Status</Label>
                    <Select 
                      value={formData.isActive ? "true" : "false"} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === "true" }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-between pt-6">
                  <div>
                    {!isNewItem && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteMenuItemMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deleteMenuItemMutation.isPending ? "Deleting..." : "Delete Item"}
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/admin")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {createMenuItemMutation.isPending || updateMenuItemMutation.isPending 
                        ? "Saving..." 
                        : isNewItem ? "Create Item" : "Update Item"
                      }
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}