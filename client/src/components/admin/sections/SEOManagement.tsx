import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Upload, Globe, Code, Search } from "lucide-react";

interface SiteSetting {
  key: string;
  value: any;
  category?: string;
  description?: string;
}

export default function SEOManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string>("");

  const { data: siteSettings, isLoading } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/site-settings"],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, description, category }: { 
      key: string; 
      value: any; 
      description?: string; 
      category?: string; 
    }) => {
      const response = await apiRequest("PATCH", `/api/admin/site-settings/${key}`, {
        value,
        description,
        category,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({
        title: "Success",
        description: "SEO setting updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadOgImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest("PUT", "/api/site-settings/og_image", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({
        title: "Success",
        description: "OpenGraph image uploaded successfully",
      });
      setOgImageFile(null);
      setOgImagePreview("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getSetting = (key: string): string => {
    const setting = siteSettings?.find(s => s.key === key);
    return setting?.value || "";
  };

  const handleSettingUpdate = (key: string, value: string, description?: string, category?: string) => {
    updateSettingMutation.mutate({ key, value, description, category });
  };

  const handleOgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOgImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOgImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardDescription>
            Manage search engine optimization, meta tags, and schema markup for your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General SEO</TabsTrigger>
              <TabsTrigger value="opengraph">OpenGraph</TabsTrigger>
              <TabsTrigger value="schema">Schema Markup</TabsTrigger>
              <TabsTrigger value="analytics">Analytics & Code</TabsTrigger>
            </TabsList>

            {/* General SEO Tab */}
            <TabsContent value="general" className="space-y-6">
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="site_title">Site Title</Label>
                  <Input
                    id="site_title"
                    value={getSetting("site_title")}
                    onChange={(e) => handleSettingUpdate("site_title", e.target.value, "Site brand title", "branding")}
                    placeholder="Your Website Title"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Brand title for your website (used in navigation and branding)
                  </p>
                </div>

                <div>
                  <Label htmlFor="homepage_seo_title">Homepage SEO Title</Label>
                  <Input
                    id="homepage_seo_title"
                    value={getSetting("homepage_seo_title")}
                    onChange={(e) => handleSettingUpdate("homepage_seo_title", e.target.value, "SEO title for homepage", "seo")}
                    placeholder="Best Business Directory | Find Local Services"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    SEO-optimized title for homepage (recommended: 50-60 characters)
                  </p>
                </div>

                <div>
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea
                    id="site_description"
                    value={getSetting("site_description")}
                    onChange={(e) => handleSettingUpdate("site_description", e.target.value, "Default meta description for SEO", "seo")}
                    placeholder="A brief description of your website and services"
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Default meta description (recommended: 150-160 characters)
                  </p>
                </div>

                <div>
                  <Label htmlFor="site_keywords">Default Keywords</Label>
                  <Input
                    id="site_keywords"
                    value={getSetting("site_keywords")}
                    onChange={(e) => handleSettingUpdate("site_keywords", e.target.value, "Default meta keywords for SEO", "seo")}
                    placeholder="business directory, local services, reviews"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Comma-separated keywords for your website
                  </p>
                </div>

                <div>
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={getSetting("canonical_url")}
                    onChange={(e) => handleSettingUpdate("canonical_url", e.target.value, "Primary domain for canonical URLs", "seo")}
                    placeholder="https://yourdomain.com"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Primary domain for canonical link tags
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* OpenGraph Tab */}
            <TabsContent value="opengraph" className="space-y-6">
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="og_title">OpenGraph Title</Label>
                  <Input
                    id="og_title"
                    value={getSetting("og_title")}
                    onChange={(e) => handleSettingUpdate("og_title", e.target.value, "Title for social media sharing", "opengraph")}
                    placeholder="Title for social media shares"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="og_description">OpenGraph Description</Label>
                  <Textarea
                    id="og_description"
                    value={getSetting("og_description")}
                    onChange={(e) => handleSettingUpdate("og_description", e.target.value, "Description for social media sharing", "opengraph")}
                    placeholder="Description when shared on social media"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>OpenGraph Image</Label>
                  <div className="mt-2 space-y-4">
                    {/* Current OG Image Display */}
                    {getSetting("og_image") && (
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                        <img
                          src={getSetting("og_image")}
                          alt="Current OpenGraph image"
                          className="h-20 w-32 object-cover border rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Current OpenGraph Image</p>
                          <p className="text-xs text-gray-500">1200x630px recommended</p>
                        </div>
                      </div>
                    )}

                    {/* Image Preview */}
                    {ogImagePreview && (
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50">
                        <img
                          src={ogImagePreview}
                          alt="Preview"
                          className="h-20 w-32 object-cover border rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Preview</p>
                          <p className="text-xs text-gray-500">Ready to upload</p>
                        </div>
                        <Button
                          onClick={() => ogImageFile && uploadOgImageMutation.mutate(ogImageFile)}
                          disabled={uploadOgImageMutation.isPending}
                          size="sm"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadOgImageMutation.isPending ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    )}

                    {/* File Input */}
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleOgImageChange}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Upload an image for social media sharing (1200x630px recommended)
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="twitter_card">Twitter Card Type</Label>
                  <Input
                    id="twitter_card"
                    value={getSetting("twitter_card")}
                    onChange={(e) => handleSettingUpdate("twitter_card", e.target.value, "Twitter card type", "opengraph")}
                    placeholder="summary_large_image"
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Schema Markup Tab */}
            <TabsContent value="schema" className="space-y-6">
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="organization_name">Organization Name</Label>
                  <Input
                    id="organization_name"
                    value={getSetting("organization_name")}
                    onChange={(e) => handleSettingUpdate("organization_name", e.target.value, "Organization name for schema markup", "schema")}
                    placeholder="Your Business Name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="organization_logo">Organization Logo URL</Label>
                  <Input
                    id="organization_logo"
                    value={getSetting("organization_logo")}
                    onChange={(e) => handleSettingUpdate("organization_logo", e.target.value, "Organization logo URL for schema markup", "schema")}
                    placeholder="https://yourdomain.com/logo.png"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={getSetting("contact_phone")}
                    onChange={(e) => handleSettingUpdate("contact_phone", e.target.value, "Primary contact phone for schema markup", "schema")}
                    placeholder="+1-555-123-4567"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    value={getSetting("contact_email")}
                    onChange={(e) => handleSettingUpdate("contact_email", e.target.value, "Primary contact email for schema markup", "schema")}
                    placeholder="contact@yourdomain.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="business_address">Business Address</Label>
                  <Textarea
                    id="business_address"
                    value={getSetting("business_address")}
                    onChange={(e) => handleSettingUpdate("business_address", e.target.value, "Primary business address for schema markup", "schema")}
                    placeholder="123 Main St, City, State, ZIP"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Analytics & Code Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="google_analytics">Google Analytics Code</Label>
                  <Textarea
                    id="google_analytics"
                    value={getSetting("google_analytics")}
                    onChange={(e) => handleSettingUpdate("google_analytics", e.target.value, "Google Analytics tracking code", "analytics")}
                    placeholder="<!-- Google Analytics code here -->"
                    className="mt-1 font-mono text-sm"
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Paste your Google Analytics tracking code here (will be added to &lt;head&gt;)
                  </p>
                </div>

                <div>
                  <Label htmlFor="google_tag_manager">Google Tag Manager</Label>
                  <Textarea
                    id="google_tag_manager"
                    value={getSetting("google_tag_manager")}
                    onChange={(e) => handleSettingUpdate("google_tag_manager", e.target.value, "Google Tag Manager code", "analytics")}
                    placeholder="<!-- Google Tag Manager code here -->"
                    className="mt-1 font-mono text-sm"
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Paste your Google Tag Manager code here
                  </p>
                </div>

                <div>
                  <Label htmlFor="custom_head_code">Custom Head Code</Label>
                  <Textarea
                    id="custom_head_code"
                    value={getSetting("custom_head_code")}
                    onChange={(e) => handleSettingUpdate("custom_head_code", e.target.value, "Custom HTML code for head section", "analytics")}
                    placeholder="<!-- Custom HTML code for <head> section -->"
                    className="mt-1 font-mono text-sm"
                    rows={8}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Add any custom HTML code to be included in the &lt;head&gt; section of all pages
                  </p>
                </div>

                <div>
                  <Label htmlFor="facebook_pixel">Facebook Pixel</Label>
                  <Textarea
                    id="facebook_pixel"
                    value={getSetting("facebook_pixel")}
                    onChange={(e) => handleSettingUpdate("facebook_pixel", e.target.value, "Facebook Pixel tracking code", "analytics")}
                    placeholder="<!-- Facebook Pixel code here -->"
                    className="mt-1 font-mono text-sm"
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Paste your Facebook Pixel tracking code here
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* SEO Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            SEO Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Badge variant={getSetting("site_title") ? "default" : "secondary"}>
                {getSetting("site_title") ? "SET" : "MISSING"}
              </Badge>
              <p className="text-sm font-medium mt-2">Site Title</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant={getSetting("site_description") ? "default" : "secondary"}>
                {getSetting("site_description") ? "SET" : "MISSING"}
              </Badge>
              <p className="text-sm font-medium mt-2">Meta Description</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant={getSetting("og_image") ? "default" : "secondary"}>
                {getSetting("og_image") ? "SET" : "MISSING"}
              </Badge>
              <p className="text-sm font-medium mt-2">OG Image</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant={getSetting("google_analytics") ? "default" : "secondary"}>
                {getSetting("google_analytics") ? "SET" : "MISSING"}
              </Badge>
              <p className="text-sm font-medium mt-2">Analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}