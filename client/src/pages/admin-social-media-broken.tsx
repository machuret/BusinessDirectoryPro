import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { SocialIcon } from "@/components/SocialIcon";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SocialMediaLink } from "@shared/schema";

const SOCIAL_PLATFORMS = [
  'facebook',
  'twitter', 
  'instagram',
  'linkedin',
  'youtube',
  'tiktok',
  'pinterest',
  'discord'
];

export default function AdminSocialMedia() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    iconClass: '',
    displayName: '',
    isActive: true,
    sortOrder: 0
  });

  // Fetch social media links
  const { data: socialLinks = [], isLoading } = useQuery<SocialMediaLink[]>({
    queryKey: ['/api/admin/social-media'],
    queryFn: async () => {
      const response = await fetch('/api/admin/social-media');
      if (!response.ok) throw new Error('Failed to fetch social media links');
      return response.json();
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<SocialMediaLink, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest('POST', '/api/admin/social-media', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
      setShowAddForm(false);
      setFormData({ platform: '', url: '', iconClass: '', displayName: '', isActive: true, sortOrder: 0 });
      toast({
        title: "Success",
        description: "Social media link created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Omit<SocialMediaLink, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest('PUT', `/api/admin/social-media/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
      setEditingId(null);
      toast({
        title: "Success",
        description: "Social media link updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/social-media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
      toast({
        title: "Success",
        description: "Social media link deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.platform || !formData.url) {
      toast({
        title: "Error",
        description: "Platform and URL are required",
        variant: "destructive"
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleEdit = (link: SocialMediaLink) => {
    setEditingId(link.id);
    setFormData({
      platform: link.platform,
      url: link.url,
      iconClass: link.iconClass,
      displayName: link.displayName,
      isActive: link.isActive,
      sortOrder: link.sortOrder || 0
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    updateMutation.mutate({
      id: editingId,
      ...formData
    } as SocialMediaLink);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this social media link?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({ platform: '', url: '', iconClass: '', displayName: '', isActive: true, sortOrder: 0 });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading social media links...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Social Media Management</h1>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Social Link
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Social Media Link</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select 
                      value={formData.platform} 
                      onValueChange={(value) => setFormData({...formData, platform: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOCIAL_PLATFORMS.map(platform => (
                          <SelectItem key={platform} value={platform}>
                            <div className="flex items-center gap-2">
                              <SocialIcon platform={platform} className="h-4 w-4" />
                              {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      placeholder="Facebook"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="iconClass">Icon Class</Label>
                    <Input
                      id="iconClass"
                      value={formData.iconClass}
                      onChange={(e) => setFormData({...formData, iconClass: e.target.value})}
                      placeholder="fab fa-facebook-f"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {createMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Links List */}
        <div className="grid gap-4">
          {socialLinks.map((link) => (
            <Card key={link.id}>
              <CardContent className="p-4">
                {editingId === link.id ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-platform">Platform</Label>
                        <Select 
                          value={formData.platform} 
                          onValueChange={(value) => setFormData({...formData, platform: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SOCIAL_PLATFORMS.map(platform => (
                              <SelectItem key={platform} value={platform}>
                                <div className="flex items-center gap-2">
                                  <SocialIcon platform={platform} className="h-4 w-4" />
                                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="edit-url">URL</Label>
                        <Input
                          id="edit-url"
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData({...formData, url: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-displayName">Display Name</Label>
                        <Input
                          id="edit-displayName"
                          value={formData.displayName}
                          onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-iconClass">Icon Class</Label>
                        <Input
                          id="edit-iconClass"
                          value={formData.iconClass}
                          onChange={(e) => setFormData({...formData, iconClass: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-sortOrder">Sort Order</Label>
                        <Input
                          id="edit-sortOrder"
                          type="number"
                          value={formData.sortOrder}
                          onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                        />
                        <Label htmlFor="edit-isActive">Active</Label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateMutation.isPending ? 'Updating...' : 'Update'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <SocialIcon platform={link.platform} className="h-6 w-6" />
                      <div>
                        <div className="font-semibold">
                          {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                        </div>
                        <div className="text-sm text-gray-600">{link.url}</div>
                        <div className="text-xs text-gray-500">
                          Order: {link.sortOrder || 0} • {link.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(link)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(link.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {socialLinks.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  No social media links configured yet.
                </div>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Social Link
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}