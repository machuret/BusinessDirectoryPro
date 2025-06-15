import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, Save, X, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SocialMediaLink, InsertSocialMediaLink } from "@shared/schema";

const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'pinterest', label: 'Pinterest', icon: '📌' },
  { value: 'discord', label: 'Discord', icon: '🎮' }
];

export default function AdminSocialMediaPage() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLink, setNewLink] = useState<Partial<InsertSocialMediaLink>>({
    platform: '',
    url: '',
    isActive: true,
    sortOrder: 0
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: socialMediaLinks = [], isLoading } = useQuery<SocialMediaLink[]>({
    queryKey: ['/api/admin/social-media'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertSocialMediaLink) => {
      const response = await apiRequest('POST', '/api/admin/social-media', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
      setIsAddingNew(false);
      setNewLink({ platform: '', url: '', isActive: true, sortOrder: 0 });
      toast({ title: "Success", description: "Social media link created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSocialMediaLink> }) => {
      const response = await apiRequest('PUT', `/api/admin/social-media/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
      setEditingId(null);
      toast({ title: "Success", description: "Social media link updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/social-media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
      toast({ title: "Success", description: "Social media link deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/admin/social-media/${id}/toggle`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
      toast({ title: "Success", description: "Social media link status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleCreate = () => {
    if (!newLink.platform || !newLink.url) {
      toast({ title: "Error", description: "Platform and URL are required", variant: "destructive" });
      return;
    }

    const maxSortOrder = Math.max(...socialMediaLinks.map(link => link.sortOrder || 0), 0);
    createMutation.mutate({
      ...newLink,
      sortOrder: maxSortOrder + 1
    } as InsertSocialMediaLink);
  };

  const handleUpdate = (id: number, data: Partial<InsertSocialMediaLink>) => {
    updateMutation.mutate({ id, data });
  };

  const getPlatformLabel = (platform: string) => {
    const found = SOCIAL_PLATFORMS.find(p => p.value === platform);
    return found ? `${found.icon} ${found.label}` : platform;
  };

  const getUsedPlatforms = () => {
    return socialMediaLinks.map(link => link.platform);
  };

  const getAvailablePlatforms = () => {
    const used = getUsedPlatforms();
    return SOCIAL_PLATFORMS.filter(platform => !used.includes(platform.value));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Social Media Management</h1>
        <Button
          onClick={() => setIsAddingNew(true)}
          disabled={getAvailablePlatforms().length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Social Media Link
        </Button>
      </div>

      {/* Add New Link Dialog */}
      <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Social Media Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={newLink.platform}
                onValueChange={(value) => setNewLink({ ...newLink, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePlatforms().map(platform => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.icon} {platform.label}
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
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={newLink.isActive}
                onCheckedChange={(checked) => setNewLink({ ...newLink, isActive: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Social Media Links List */}
      <div className="space-y-4">
        {socialMediaLinks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No social media links configured yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Add links to display social media icons in your footer.
              </p>
            </CardContent>
          </Card>
        ) : (
          socialMediaLinks
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((link) => (
              <Card key={link.id}>
                <CardContent className="p-4">
                  {editingId === link.id ? (
                    <EditLinkForm
                      link={link}
                      onSave={(data) => handleUpdate(link.id, data)}
                      onCancel={() => setEditingId(null)}
                      isLoading={updateMutation.isPending}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {getPlatformLabel(link.platform)}
                          </div>
                          <div className="text-sm text-gray-600">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {link.url}
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={link.isActive}
                          onCheckedChange={() => toggleMutation.mutate(link.id)}
                          disabled={toggleMutation.isPending}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(link.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(link.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {socialMediaLinks.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Footer Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Active social media links will appear in your website footer:
            </p>
            <div className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
              {socialMediaLinks
                .filter(link => link.isActive)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map(link => (
                  <div
                    key={link.id}
                    className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm"
                    title={link.platform}
                  >
                    {SOCIAL_PLATFORMS.find(p => p.value === link.platform)?.icon || '🔗'}
                  </div>
                ))}
              {socialMediaLinks.filter(link => link.isActive).length === 0 && (
                <p className="text-gray-400 text-sm">No active social media links</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EditLinkForm({
  link,
  onSave,
  onCancel,
  isLoading
}: {
  link: SocialMediaLink;
  onSave: (data: Partial<InsertSocialMediaLink>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    url: link.url,
    isActive: link.isActive
  });

  const handleSave = () => {
    if (!formData.url) {
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-url">URL</Label>
        <Input
          id="edit-url"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="edit-active"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="edit-active">Active</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}