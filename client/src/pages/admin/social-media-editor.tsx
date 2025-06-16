import { useState } from "react";
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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, GripVertical, ExternalLink, Save, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle } from "lucide-react";

type SocialMediaLink = {
  id: number;
  platform: string;
  url: string;
  displayName: string;
  iconClass: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

const SUPPORTED_PLATFORMS = [
  { value: "facebook", label: "Facebook", icon: Facebook, iconClass: "fab fa-facebook-f" },
  { value: "twitter", label: "Twitter", icon: Twitter, iconClass: "fab fa-twitter" },
  { value: "instagram", label: "Instagram", icon: Instagram, iconClass: "fab fa-instagram" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, iconClass: "fab fa-linkedin" },
  { value: "youtube", label: "YouTube", icon: Youtube, iconClass: "fab fa-youtube" },
  { value: "tiktok", label: "TikTok", icon: MessageCircle, iconClass: "fab fa-tiktok" },
  { value: "pinterest", label: "Pinterest", icon: MessageCircle, iconClass: "fab fa-pinterest" },
  { value: "snapchat", label: "Snapchat", icon: MessageCircle, iconClass: "fab fa-snapchat" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, iconClass: "fab fa-whatsapp" }
];

function getPlatformIcon(platform: string) {
  const platformConfig = SUPPORTED_PLATFORMS.find(p => p.value === platform);
  return platformConfig?.icon || MessageCircle;
}

function SortableSocialMediaLink({ 
  link, 
  onEdit, 
  onDelete,
  onToggle
}: { 
  link: SocialMediaLink; 
  onEdit: (link: SocialMediaLink) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const PlatformIcon = getPlatformIcon(link.platform);

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
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <PlatformIcon className="h-5 w-5 text-gray-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-gray-900">{link.displayName}</h4>
                <Badge variant={link.isActive ? "default" : "secondary"}>
                  {link.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {link.platform}
                </span>
                <span className="truncate max-w-md">{link.url}</span>
                <ExternalLink className="h-3 w-3" />
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                Sort Order: {link.sortOrder} | Icon: {link.iconClass}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(link.id)}
          >
            {link.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(link)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(link.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SocialMediaLinkForm({ 
  link, 
  onSubmit, 
  onCancel,
  existingPlatforms = []
}: {
  link?: SocialMediaLink;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  existingPlatforms?: string[];
}) {
  const [formData, setFormData] = useState({
    platform: link?.platform || "",
    url: link?.url || "",
    displayName: link?.displayName || "",
    iconClass: link?.iconClass || "",
    isActive: link?.isActive ?? true,
    sortOrder: link?.sortOrder || 0
  });

  const handlePlatformChange = (platform: string) => {
    const platformConfig = SUPPORTED_PLATFORMS.find(p => p.value === platform);
    setFormData({
      ...formData,
      platform,
      displayName: platformConfig?.label || platform,
      iconClass: platformConfig?.iconClass || `fab fa-${platform}`
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const availablePlatforms = SUPPORTED_PLATFORMS.filter(p => 
    !existingPlatforms.includes(p.value) || p.value === link?.platform
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="platform">Platform</Label>
        <Select
          value={formData.platform}
          onValueChange={handlePlatformChange}
          disabled={!!link} // Cannot change platform when editing
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a platform" />
          </SelectTrigger>
          <SelectContent>
            {availablePlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <SelectItem key={platform.value} value={platform.value}>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{platform.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="Enter the full URL (e.g., https://facebook.com/yourpage)"
          required
        />
      </div>

      <div>
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          placeholder="Enter display name"
          required
        />
      </div>

      <div>
        <Label htmlFor="iconClass">Icon CSS Class</Label>
        <Input
          id="iconClass"
          value={formData.iconClass}
          onChange={(e) => setFormData({ ...formData, iconClass: e.target.value })}
          placeholder="e.g., fab fa-facebook-f"
          required
        />
      </div>

      {link && (
        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
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
          {link ? "Update Social Media Link" : "Create Social Media Link"}
        </Button>
      </div>
    </form>
  );
}

export default function SocialMediaEditor() {
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
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

  // Fetch all social media links
  const { data: socialMediaLinks = [], isLoading } = useQuery<SocialMediaLink[]>({
    queryKey: ["/api/admin/social-media"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/social-media");
      return response.json();
    }
  });

  const sortedLinks = [...socialMediaLinks].sort((a, b) => a.sortOrder - b.sortOrder);
  const existingPlatforms = socialMediaLinks.map(link => link.platform);

  // Create social media link mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/social-media", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-media"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Social media link created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create social media link",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update social media link mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/social-media/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-media"] });
      setIsEditDialogOpen(false);
      setEditingLink(null);
      toast({ title: "Social media link updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update social media link",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete social media link mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/social-media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-media"] });
      toast({ title: "Social media link deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete social media link",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Toggle social media link mutation
  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/admin/social-media/${id}/toggle`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-media"] });
      toast({ title: "Social media link status updated" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update social media link status",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Reorder social media links mutation
  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: number[]) => {
      await apiRequest("POST", "/api/admin/social-media/reorder", {
        orderedIds
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-media"] });
      setUnsavedChanges(false);
      toast({ title: "Social media order saved successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save social media order",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedLinks.findIndex(link => link.id === active.id);
      const newIndex = sortedLinks.findIndex(link => link.id === over.id);
      
      const reorderedLinks = arrayMove(sortedLinks, oldIndex, newIndex);
      
      // Update the query cache optimistically
      const newLinks = reorderedLinks.map((link, index) => ({
        ...link,
        sortOrder: index
      }));
      
      queryClient.setQueryData(["/api/admin/social-media"], newLinks);
      setUnsavedChanges(true);
    }
  };

  // Save order
  const handleSaveOrder = () => {
    const orderedIds = sortedLinks.map(link => link.id);
    reorderMutation.mutate(orderedIds);
  };

  // Handle create
  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  // Handle edit
  const handleEdit = (link: SocialMediaLink) => {
    setEditingLink(link);
    setIsEditDialogOpen(true);
  };

  // Handle update
  const handleUpdate = (data: any) => {
    if (editingLink) {
      updateMutation.mutate({ id: editingLink.id, data });
    }
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this social media link?")) {
      deleteMutation.mutate(id);
    }
  };

  // Handle toggle
  const handleToggle = (id: number) => {
    toggleMutation.mutate(id);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Social Media Editor</h1>
        <p className="text-gray-600">
          Manage social media links displayed on your website. Drag and drop to reorder, or use the controls to add, edit, and manage links.
        </p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Social Media Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Social Media Link</DialogTitle>
            </DialogHeader>
            <SocialMediaLinkForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              existingPlatforms={existingPlatforms}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Social Media Links</span>
            <Badge variant="outline">
              {socialMediaLinks.length} links
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedLinks.map(link => link.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sortedLinks.length > 0 ? (
                  sortedLinks.map((link) => (
                    <SortableSocialMediaLink
                      key={link.id}
                      link={link}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No social media links configured. Click "Add Social Media Link" to create one.
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Social Media Link</DialogTitle>
          </DialogHeader>
          {editingLink && (
            <SocialMediaLinkForm
              link={editingLink}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingLink(null);
              }}
              existingPlatforms={existingPlatforms}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}