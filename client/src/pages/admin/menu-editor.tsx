import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
  SortableContext as SortableContextType,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, GripVertical, ExternalLink, Save } from "lucide-react";

type MenuItem = {
  id: number;
  name: string;
  url: string;
  position: string;
  order: number;
  isActive: boolean;
  target: string | null;
  createdAt: string;
  updatedAt: string;
};

type MenuPosition = "header" | "footer" | "footer1" | "footer2";

const POSITION_LABELS: Record<MenuPosition, string> = {
  header: "Header",
  footer: "Footer",
  footer1: "Footer Column 1", 
  footer2: "Footer Column 2"
};

const TARGET_OPTIONS = [
  { value: "_self", label: "Same Tab" },
  { value: "_blank", label: "New Tab" }
];

function SortableMenuItem({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: MenuItem; 
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-2 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-2 hover:bg-gray-100 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{item.url}</span>
              {item.target === "_blank" && (
                <ExternalLink className="h-3 w-3" />
              )}
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              Order: {item.order} | Position: {POSITION_LABELS[item.position as MenuPosition]}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MenuItemForm({ 
  item, 
  onSubmit, 
  onCancel 
}: {
  item?: MenuItem;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    url: item?.url || "",
    position: item?.position || "header",
    target: item?.target || "_self",
    isActive: item?.isActive ?? true,
    order: item?.order || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission with data:", formData);
    
    // Basic validation
    if (!formData.name.trim()) {
      alert("Menu name is required");
      return;
    }
    if (!formData.url.trim()) {
      alert("URL is required");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Menu Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter menu name"
          required
        />
      </div>

      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="Enter URL (e.g., /about, https://example.com)"
          required
        />
      </div>

      <div>
        <Label htmlFor="position">Position</Label>
        <Select
          value={formData.position}
          onValueChange={(value) => setFormData({ ...formData, position: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(POSITION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="target">Link Target</Label>
        <Select
          value={formData.target}
          onValueChange={(value) => setFormData({ ...formData, target: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TARGET_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {item && (
        <div>
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {item ? "Update Menu Item" : "Create Menu Item"}
        </Button>
      </div>
    </form>
  );
}

export default function MenuEditor() {
  const [selectedPosition, setSelectedPosition] = useState<MenuPosition>("header");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch all menu items
  const { data: allMenuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/admin/menu-items"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/menu-items");
      return response.json();
    }
  });

  // Filter items by position
  const filteredItems = allMenuItems.filter(item => item.position === selectedPosition);
  const sortedItems = [...filteredItems].sort((a, b) => a.order - b.order);

  // Create menu item mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating menu item with data:", data);
      const response = await apiRequest("POST", "/api/admin/menu-items", data);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (result) => {
      console.log("Menu item created successfully:", result);
      // Add the new item to cache immediately
      queryClient.setQueryData(["/api/admin/menu-items"], (oldData: MenuItem[] | undefined) => {
        return oldData ? [...oldData, result] : [result];
      });
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Menu item created successfully" });
    },
    onError: (error: any) => {
      console.error("Failed to create menu item:", error);
      toast({
        title: "Failed to create menu item",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    }
  });

  // Update menu item mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/menu-items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Menu item updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update menu item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete menu item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/menu-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
      toast({ title: "Menu item deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete menu item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Reorder menu items mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ position, orderedIds }: { position: string; orderedIds: number[] }) => {
      await apiRequest("POST", "/api/admin/menu-items/reorder", {
        position,
        orderedIds
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
      setUnsavedChanges(false);
      toast({ title: "Menu order saved successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save menu order",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex(item => item.id === active.id);
      const newIndex = sortedItems.findIndex(item => item.id === over.id);
      
      const reorderedItems = arrayMove(sortedItems, oldIndex, newIndex);
      
      // Update the query cache optimistically
      const newAllItems = allMenuItems.map(item => {
        if (item.position === selectedPosition) {
          const newOrder = reorderedItems.findIndex(reordered => reordered.id === item.id);
          return { ...item, order: newOrder };
        }
        return item;
      });
      
      queryClient.setQueryData(["/api/admin/menu-items"], newAllItems);
      setUnsavedChanges(true);
    }
  };

  // Save order
  const handleSaveOrder = () => {
    const orderedIds = sortedItems.map(item => item.id);
    reorderMutation.mutate({ position: selectedPosition, orderedIds });
  };

  // Handle create
  const handleCreate = (data: any) => {
    console.log("handleCreate called with:", data);
    // Ensure the data has all required fields
    const menuData = {
      name: data.name.trim(),
      url: data.url.trim(),
      position: data.position || selectedPosition,
      target: data.target || "_self",
      isActive: data.isActive !== undefined ? data.isActive : true
    };
    console.log("Submitting menu data:", menuData);
    createMutation.mutate(menuData);
  };

  // Handle edit
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  // Handle update
  const handleUpdate = (data: any) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    }
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Editor</h1>
        <p className="text-gray-600">
          Manage navigation menu items across different positions. Drag and drop to reorder items within each position.
        </p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Menu Item</DialogTitle>
            </DialogHeader>
            <MenuItemForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {unsavedChanges && (
          <Button 
            onClick={handleSaveOrder}
            disabled={reorderMutation.isPending}
            className="ml-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Order
          </Button>
        )}
      </div>

      <Tabs value={selectedPosition} onValueChange={(value) => setSelectedPosition(value as MenuPosition)}>
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(POSITION_LABELS).map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(POSITION_LABELS).map((position) => (
          <TabsContent key={position} value={position} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{POSITION_LABELS[position as MenuPosition]} Menu Items</span>
                  <Badge variant="outline">
                    {allMenuItems.filter(item => item.position === position).length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {position === selectedPosition && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sortedItems.map(item => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {sortedItems.length > 0 ? (
                          sortedItems.map((item) => (
                            <SortableMenuItem
                              key={item.id}
                              item={item}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                            />
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No menu items in this position. Click "Add Menu Item" to create one.
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <MenuItemForm
              item={editingItem}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingItem(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}