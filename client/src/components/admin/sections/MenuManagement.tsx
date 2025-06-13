import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { MenuItem } from "@shared/schema";

interface MenuItemForm {
  name: string;
  url: string;
  position: string;
  order: number;
  isActive: boolean;
}

export default function MenuManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemForm>({
    name: "",
    url: "",
    position: "header",
    order: 1,
    isActive: true,
  });

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/admin/menu-items"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: MenuItemForm) => {
      await apiRequest("POST", "/api/admin/menu-items", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Menu item added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MenuItemForm }) => {
      await apiRequest("PUT", `/api/admin/menu-items/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Menu item updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/menu-items/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: number; direction: 'up' | 'down' }) => {
      await apiRequest("PUT", `/api/admin/menu-items/${id}/reorder`, { direction });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      position: "header",
      order: 1,
      isActive: true,
    });
    setEditingItem(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      url: item.url,
      position: item.position,
      order: item.order,
      isActive: item.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleReorder = (id: number, direction: 'up' | 'down') => {
    reorderMutation.mutate({ id, direction });
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const groupedMenuItems = menuItems?.reduce((acc, item) => {
    if (!acc[item.position]) acc[item.position] = [];
    acc[item.position].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>) || {};

  const renderMenuSection = (position: string, title: string) => {
    const items = groupedMenuItems[position] || [];
    
    return (
      <Card key={position}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No menu items in this location
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.sort((a, b) => a.order - b.order).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.url}</TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? 'default' : 'secondary'}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.order}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReorder(item.id, 'up')}
                            disabled={reorderMutation.isPending}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReorder(item.id, 'down')}
                            disabled={reorderMutation.isPending}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
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
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Manage navigation menus for different sections of your website
        </div>
      </div>

      {isLoading ? (
        <p>Loading menu items...</p>
      ) : (
        <div className="space-y-6">
          {renderMenuSection('header', 'Header Menu')}
          {renderMenuSection('footer1', 'Footer Menu 1')}
          {renderMenuSection('footer2', 'Footer Menu 2')}
        </div>
      )}

      {/* Add Menu Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>
              Create a new menu item for your website navigation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Title</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., About Us"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="e.g., /about"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Menu Location</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select menu location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header Menu</SelectItem>
                  <SelectItem value="footer1">Footer Menu 1</SelectItem>
                  <SelectItem value="footer2">Footer Menu 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={addMutation.isPending || !formData.name || !formData.url}
            >
              {addMutation.isPending ? "Adding..." : "Add Menu Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the menu item details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Title</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., About Us"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="e.g., /about"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Menu Location</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select menu location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header Menu</SelectItem>
                  <SelectItem value="footer1">Footer Menu 1</SelectItem>
                  <SelectItem value="footer2">Footer Menu 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-order">Order</Label>
              <Input
                id="edit-order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={updateMutation.isPending || !formData.name || !formData.url}
            >
              {updateMutation.isPending ? "Updating..." : "Update Menu Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}