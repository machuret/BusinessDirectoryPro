import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Save, FileText, Globe } from 'lucide-react';

export default function AdminContentPage() {
  const queryClient = useQueryClient();
  const [editingString, setEditingString] = useState<any>(null);

  const { data: contentStrings, isLoading } = useQuery({
    queryKey: ['/api/admin/content-strings'],
  });

  const updateStringMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      fetch(`/api/admin/content-strings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-strings'] });
      setEditingString(null);
    },
  });

  const createStringMutation = useMutation({
    mutationFn: ({ key, value, category }: { key: string; value: string; category?: string }) =>
      fetch('/api/admin/content-strings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, category })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-strings'] });
    },
  });

  const handleSaveEdit = (value: string) => {
    if (editingString) {
      updateStringMutation.mutate({ id: editingString.id, value });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading content strings...</div>;
  }

  const groupedStrings = contentStrings?.reduce((acc: any, string: any) => {
    const category = string.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(string);
    return acc;
  }, {}) || {};

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Content String
        </Button>
      </div>

      <Tabs defaultValue="strings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="strings">Content Strings</TabsTrigger>
          <TabsTrigger value="pages">Static Pages</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
        </TabsList>

        <TabsContent value="strings">
          <div className="space-y-6">
            {Object.entries(groupedStrings).map(([category, strings]: [string, any]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      {category.charAt(0).toUpperCase() + category.slice(1)} Content
                    </span>
                    <Badge variant="secondary">{strings.length} strings</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {strings.map((string: any) => (
                      <div key={string.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {string.key}
                            </code>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingString(string)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {editingString?.id === string.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingString.value}
                              onChange={(e) => setEditingString({
                                ...editingString,
                                value: e.target.value
                              })}
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(editingString.value)}
                                disabled={updateStringMutation.isPending}
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingString(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 mt-2">
                            {string.value}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Static Pages Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">About Page</h3>
                    <p className="text-sm text-gray-600">/about</p>
                  </div>
                  <Button variant="outline">Edit Page</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Privacy Policy</h3>
                    <p className="text-sm text-gray-600">/privacy</p>
                  </div>
                  <Button variant="outline">Edit Page</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Terms of Service</h3>
                    <p className="text-sm text-gray-600">/terms</p>
                  </div>
                  <Button variant="outline">Edit Page</Button>
                </div>
                
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations">
          <Card>
            <CardHeader>
              <CardTitle>Multi-language Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Default Language:</span>
                  <Badge>English (EN)</Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Available Languages:</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline">Spanish (ES)</Badge>
                    <Badge variant="outline">French (FR)</Badge>
                    <Badge variant="outline">German (DE)</Badge>
                  </div>
                </div>
                
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Language
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}