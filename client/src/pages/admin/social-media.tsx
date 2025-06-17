import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

export default function AdminSocialMediaPage() {
  const queryClient = useQueryClient();

  const { data: socialMediaLinks, isLoading } = useQuery({
    queryKey: ['/api/admin/social-media'],
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetch(`/api/admin/social-media/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-media'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/social-media/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-media'] });
    },
  });

  const platformIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    youtube: Youtube,
    linkedin: Linkedin,
  };

  if (isLoading) {
    return <div className="p-6">Loading social media links...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Social Media Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Social Link
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Social Media Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">URL</label>
                <Input placeholder="https://facebook.com/yourpage" />
              </div>

              <Button className="w-full">Add Social Link</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Media Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Links:</span>
                <Badge>{socialMediaLinks?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Links:</span>
                <Badge variant="default">
                  {socialMediaLinks?.filter((link: any) => link.isActive).length || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Most Popular:</span>
                <span className="text-sm text-gray-600">Facebook</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Current Social Media Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {socialMediaLinks?.map((link: any) => {
              const IconComponent = platformIcons[link.platform as keyof typeof platformIcons];
              
              return (
                <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                    <div>
                      <h3 className="font-medium capitalize">{link.platform}</h3>
                      <p className="text-sm text-gray-600">{link.url}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={link.isActive}
                        onCheckedChange={(checked) => 
                          toggleActiveMutation.mutate({ id: link.id, isActive: checked })
                        }
                      />
                      <span className="text-sm">
                        {link.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <Button variant="outline" size="sm">
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
              );
            }) || (
              <div className="text-center py-8">
                <p className="text-gray-500">No social media links configured</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Link
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}