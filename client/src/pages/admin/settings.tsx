import { useState } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Upload, Image, Save, Eye } from "lucide-react";

interface SiteSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
}

interface AzureBlobSettings {
  accountName: string;
  accountKey: string;
  containerName: string;
  connectionString: string;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  // Fetch site settings
  const { data: settings, isLoading } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/site-settings"],
  });

  // Get Azure Blob settings from site settings
  const azureSettings: AzureBlobSettings = {
    accountName: settings?.find(s => s.key === "azure_blob_account_name")?.value || "",
    accountKey: settings?.find(s => s.key === "azure_blob_account_key")?.value || "",
    containerName: settings?.find(s => s.key === "azure_blob_container")?.value || "uploads",
    connectionString: settings?.find(s => s.key === "azure_blob_connection_string")?.value || "",
  };

  // Current logo and background URLs
  const logoUrl = settings?.find(s => s.key === "site_logo_url")?.value || "";
  const backgroundUrl = settings?.find(s => s.key === "header_background_url")?.value || "";

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, description, category }: { key: string; value: string; description?: string; category?: string }) => {
      const res = await apiRequest("PUT", `/api/admin/site-settings/${key}`, { 
        value, 
        description: description || "",
        category: category || "azure"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      toast({
        title: "Setting Updated",
        description: "Azure Blob Storage configuration saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test Azure Blob Storage connection
  const testAzureMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/azure-blob/test");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Connection Test Successful",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: 'logo' | 'background' }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update the corresponding site setting with the uploaded image URL
      const settingKey = variables.type === 'logo' ? 'site_logo_url' : 'header_background_url';
      const description = variables.type === 'logo' ? 'Site logo image URL' : 'Header background image URL';
      
      updateSettingMutation.mutate({
        key: settingKey,
        value: data.url,
        description,
        category: 'branding'
      });
      
      toast({
        title: "Upload Successful",
        description: `${variables.type === 'logo' ? 'Logo' : 'Background image'} uploaded successfully.`,
      });
      
      // Clear file input
      if (variables.type === 'logo') setLogoFile(null);
      else setBackgroundFile(null);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveAzureSettings = () => {
    const form = document.getElementById('azure-form') as HTMLFormElement;
    const formData = new FormData(form);
    
    const updates = [
      { key: "azure_blob_account_name", value: formData.get('accountName') as string, description: "Azure Blob Storage account name" },
      { key: "azure_blob_account_key", value: formData.get('accountKey') as string, description: "Azure Blob Storage account key" },
      { key: "azure_blob_container", value: formData.get('containerName') as string, description: "Azure Blob Storage container name" },
      { key: "azure_blob_connection_string", value: formData.get('connectionString') as string, description: "Azure Blob Storage connection string" },
    ];

    updates.forEach(update => {
      updateSettingMutation.mutate(update);
    });
  };

  const handleFileUpload = (file: File | null, type: 'logo' | 'background') => {
    if (!file) return;
    
    // Validate Azure settings first
    if (!azureSettings.accountName || !azureSettings.connectionString) {
      toast({
        title: "Configuration Required",
        description: "Please configure Azure Blob Storage settings first.",
        variant: "destructive",
      });
      return;
    }
    
    uploadFileMutation.mutate({ file, type });
  };

  if (isLoading) {
    return (
      <AdminPageLayout title="Settings" description="Configure platform settings and preferences">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Settings" description="Configure platform settings and preferences">
      <Tabs defaultValue="azure" className="space-y-6">
        <TabsList>
          <TabsTrigger value="azure">Azure Storage</TabsTrigger>
          <TabsTrigger value="uploads">Image Uploads</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="azure">
          <Card>
            <CardHeader>
              <CardTitle>Azure Blob Storage Configuration</CardTitle>
              <CardDescription>
                Configure Azure Blob Storage for file uploads and media management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="azure-form" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Storage Account Name</Label>
                    <Input
                      id="accountName"
                      name="accountName"
                      placeholder="your-storage-account"
                      defaultValue={azureSettings.accountName}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="containerName">Container Name</Label>
                    <Input
                      id="containerName"
                      name="containerName"
                      placeholder="uploads"
                      defaultValue={azureSettings.containerName}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountKey">Account Key</Label>
                  <Input
                    id="accountKey"
                    name="accountKey"
                    type="password"
                    placeholder="Your Azure storage account key"
                    defaultValue={azureSettings.accountKey}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="connectionString">Connection String</Label>
                  <Input
                    id="connectionString"
                    name="connectionString"
                    placeholder="DefaultEndpointsProtocol=https;AccountName=..."
                    defaultValue={azureSettings.connectionString}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="button" 
                    onClick={handleSaveAzureSettings}
                    disabled={updateSettingMutation.isPending}
                    className="flex-1 sm:flex-none"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Azure Configuration
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => testAzureMutation.mutate()}
                    disabled={testAzureMutation.isPending}
                    className="flex-1 sm:flex-none"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {testAzureMutation.isPending ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Logo Upload</CardTitle>
                <CardDescription>Upload your site logo (recommended: PNG, 200x60px)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {logoUrl && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Image className="w-8 h-8 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Current Logo</p>
                      <p className="text-sm text-gray-500 truncate">{logoUrl}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={logoUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleFileUpload(logoFile, 'logo')}
                    disabled={!logoFile || uploadFileMutation.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Header Background Upload</CardTitle>
                <CardDescription>Upload background image for "Find Local Businesses" header section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {backgroundUrl && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Image className="w-8 h-8 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Current Background</p>
                      <p className="text-sm text-gray-500 truncate">{backgroundUrl}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={backgroundUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleFileUpload(backgroundFile, 'background')}
                    disabled={!backgroundFile || uploadFileMutation.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Background
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration options</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Additional general settings will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}