import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SettingsManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [homepageContent, setHomepageContent] = useState({
    hero_title: "",
    hero_subtitle: "",
    features_title: "",
    feature_1_title: "",
    feature_1_description: "",
    feature_2_title: "",
    feature_2_description: "",
    feature_3_title: "",
    feature_3_description: "",
  });

  // Fetch current settings
  const { data: settings } = useQuery({
    queryKey: ["/api/site-settings"],
    queryFn: () => fetch("/api/site-settings").then(res => res.json())
  });

  // Get current logo
  const currentLogo = settings && Array.isArray(settings) 
    ? settings.find((s: any) => s.key === "website_logo")?.value 
    : null;

  // Logo upload mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Save to database
      const res = await apiRequest("PUT", "/api/site-settings/website_logo", {
        value: base64,
        description: "Website logo image stored as base64",
        category: "branding"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({
        title: "Logo uploaded successfully",
        description: "Your website logo has been updated."
      });
      setUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      setUploading(false);
    }
  });

  // Remove logo mutation
  const removeLogoMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", "/api/site-settings/website_logo", {
        value: null,
        description: "Website logo removed",
        category: "branding"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({
        title: "Logo removed",
        description: "Website logo has been removed."
      });
    }
  });

  // Save homepage content mutation
  const saveHomepageContentMutation = useMutation({
    mutationFn: async (content: typeof homepageContent) => {
      const promises = Object.entries(content).map(([key, value]) => {
        return apiRequest("PATCH", `/api/admin/site-settings/homepage_${key}`, {
          value: value,
          description: `Homepage ${key.replace(/_/g, ' ')} content`,
          category: "homepage"
        });
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({
        title: "Success",
        description: "Homepage content updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update homepage content",
        variant: "destructive",
      });
    },
  });

  // Individual setting update function
  const updateSetting = async (key: string, value: string) => {
    try {
      await apiRequest("PATCH", `/api/admin/site-settings/${key}`, {
        value: value,
        description: `${key.replace(/_/g, ' ')} setting`,
        category: key.startsWith('homepage_') ? 'homepage' : 'general'
      });
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({
        title: "Setting updated",
        description: `${key.replace(/_/g, ' ')} has been updated successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, GIF, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    uploadLogoMutation.mutate(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>Configure global application settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Logo Upload Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Branding</h3>
              <div className="space-y-4">
                <div>
                  <Label>Website Logo</Label>
                  <div className="mt-2 space-y-4">
                    {/* Current Logo Display */}
                    {currentLogo && (
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                        <img
                          src={currentLogo}
                          alt="Current website logo"
                          className="h-16 w-auto max-w-32 object-contain border rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Current Logo</p>
                          <p className="text-xs text-gray-500">Click "Remove Logo" to delete</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLogoMutation.mutate()}
                          disabled={removeLogoMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    )}

                    {/* Upload Section */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {currentLogo ? "Replace Logo" : "Upload Logo"}
                          </>
                        )}
                      </Button>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      <div className="text-sm text-gray-500">
                        <p>Supported: PNG, JPG, GIF, WebP</p>
                        <p>Max size: 5MB</p>
                      </div>
                    </div>

                    {/* No Logo Placeholder */}
                    {!currentLogo && (
                      <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <div className="text-center">
                          <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No logo uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" defaultValue="Business Directory" />
                </div>
                <div>
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea id="site-description" defaultValue="Find the best local businesses in your area" />
                </div>
              </div>
            </div>

            {/* Homepage Content Management */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Homepage Content Management</h3>
              <div className="space-y-6">
                {/* Hero Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Hero Section</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hero-title">Hero Title</Label>
                      <Input 
                        id="hero-title" 
                        value={homepageContent.hero_title || (settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_hero_title")?.value || "Find Local Businesses"
                          : "Find Local Businesses"
                        )}
                        onChange={(e) => setHomepageContent(prev => ({ ...prev, hero_title: e.target.value }))}
                        placeholder="Find Local Businesses"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                      <Textarea 
                        id="hero-subtitle" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_hero_subtitle")?.value || "Discover and connect with trusted local businesses in your area. From restaurants to services, we've got you covered."
                          : "Discover and connect with trusted local businesses in your area. From restaurants to services, we've got you covered."
                        }
                        placeholder="Discover and connect with trusted local businesses in your area. From restaurants to services, we've got you covered."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Welcome Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Welcome Section</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="welcome-title">Welcome Title</Label>
                      <Input 
                        id="welcome-title" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "welcome_title")?.value || "Welcome to Our Business Directory"
                          : "Welcome to Our Business Directory"
                        }
                        placeholder="Welcome to Our Business Directory"
                        onBlur={(e) => updateSetting('welcome_title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="welcome-content">Welcome Content</Label>
                      <Textarea 
                        id="welcome-content" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "welcome_content")?.value || "Discover amazing local businesses in your area. Browse our comprehensive directory to find the services you need, read authentic reviews, and connect with trusted local providers."
                          : "Discover amazing local businesses in your area. Browse our comprehensive directory to find the services you need, read authentic reviews, and connect with trusted local providers."
                        }
                        placeholder="Discover amazing local businesses in your area. Browse our comprehensive directory to find the services you need, read authentic reviews, and connect with trusted local providers."
                        rows={3}
                        onBlur={(e) => updateSetting('welcome_content', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Features Section</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="features-title">Features Section Title</Label>
                      <Input 
                        id="features-title" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_features_title")?.value || "Why Choose BusinessHub?"
                          : "Why Choose BusinessHub?"
                        }
                        placeholder="Why Choose BusinessHub?"
                      />
                    </div>
                    
                    {/* Feature 1 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Feature 1</Label>
                      <div className="space-y-2">
                        <Input 
                          placeholder="Feature 1 Title" 
                          defaultValue={settings && Array.isArray(settings) 
                            ? settings.find((s: any) => s.key === "homepage_feature_1_title")?.value || "Trusted Businesses"
                            : "Trusted Businesses"
                          }
                        />
                        <Textarea 
                          placeholder="Feature 1 Description" 
                          defaultValue={settings && Array.isArray(settings) 
                            ? settings.find((s: any) => s.key === "homepage_feature_1_description")?.value || "All businesses are verified and reviewed by our community"
                            : "All businesses are verified and reviewed by our community"
                          }
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Feature 2</Label>
                      <div className="space-y-2">
                        <Input 
                          placeholder="Feature 2 Title" 
                          defaultValue={settings && Array.isArray(settings) 
                            ? settings.find((s: any) => s.key === "homepage_feature_2_title")?.value || "Local Community"
                            : "Local Community"
                          }
                        />
                        <Textarea 
                          placeholder="Feature 2 Description" 
                          defaultValue={settings && Array.isArray(settings) 
                            ? settings.find((s: any) => s.key === "homepage_feature_2_description")?.value || "Connect with businesses in your local area and community"
                            : "Connect with businesses in your local area and community"
                          }
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Feature 3</Label>
                      <div className="space-y-2">
                        <Input 
                          placeholder="Feature 3 Title" 
                          defaultValue={settings && Array.isArray(settings) 
                            ? settings.find((s: any) => s.key === "homepage_feature_3_title")?.value || "Quality Reviews"
                            : "Quality Reviews"
                          }
                        />
                        <Textarea 
                          placeholder="Feature 3 Description" 
                          defaultValue={settings && Array.isArray(settings) 
                            ? settings.find((s: any) => s.key === "homepage_feature_3_description")?.value || "Read authentic reviews from real customers to make informed decisions"
                            : "Read authentic reviews from real customers to make informed decisions"
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Browse by Category Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Browse by Category Section</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categories-title">Section Title</Label>
                      <Input 
                        id="categories-title" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_categories_title")?.value || "Browse by Category"
                          : "Browse by Category"
                        }
                        placeholder="Browse by Category"
                        onBlur={(e) => updateSetting('homepage_categories_title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="categories-subtitle">Section Description</Label>
                      <Textarea 
                        id="categories-subtitle" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_categories_subtitle")?.value || "Explore businesses across different industries and find exactly what you need."
                          : "Explore businesses across different industries and find exactly what you need."
                        }
                        placeholder="Explore businesses across different industries and find exactly what you need."
                        rows={2}
                        onBlur={(e) => updateSetting('homepage_categories_subtitle', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Featured Businesses Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Featured Businesses Section</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="featured-title">Section Title</Label>
                      <Input 
                        id="featured-title" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_featured_title")?.value || "Featured Businesses"
                          : "Featured Businesses"
                        }
                        placeholder="Featured Businesses"
                        onBlur={(e) => updateSetting('homepage_featured_title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="featured-subtitle">Section Description</Label>
                      <Textarea 
                        id="featured-subtitle" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_featured_subtitle")?.value || "Discover top-rated businesses handpicked for their exceptional service and quality."
                          : "Discover top-rated businesses handpicked for their exceptional service and quality."
                        }
                        placeholder="Discover top-rated businesses handpicked for their exceptional service and quality."
                        rows={2}
                        onBlur={(e) => updateSetting('homepage_featured_subtitle', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Latest Businesses Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Latest Businesses Section</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="latest-title">Section Title</Label>
                      <Input 
                        id="latest-title" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_latest_title")?.value || "Latest Businesses"
                          : "Latest Businesses"
                        }
                        placeholder="Latest Businesses"
                        onBlur={(e) => updateSetting('homepage_latest_title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="latest-subtitle">Section Description</Label>
                      <Textarea 
                        id="latest-subtitle" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_latest_subtitle")?.value || "Discover newly added businesses in your area with excellent reviews and service."
                          : "Discover newly added businesses in your area with excellent reviews and service."
                        }
                        placeholder="Discover newly added businesses in your area with excellent reviews and service."
                        rows={2}
                        onBlur={(e) => updateSetting('homepage_latest_subtitle', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Business Owner CTA Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Business Owner CTA Section</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cta-title">CTA Title</Label>
                      <Input 
                        id="cta-title" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_cta_title")?.value || "Are You a Business Owner?"
                          : "Are You a Business Owner?"
                        }
                        placeholder="Are You a Business Owner?"
                        onBlur={(e) => updateSetting('homepage_cta_title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cta-subtitle">CTA Description</Label>
                      <Textarea 
                        id="cta-subtitle" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_cta_subtitle")?.value || "Join thousands of businesses already listed on BusinessHub. Increase your visibility and connect with more customers today."
                          : "Join thousands of businesses already listed on BusinessHub. Increase your visibility and connect with more customers today."
                        }
                        placeholder="Join thousands of businesses already listed on BusinessHub. Increase your visibility and connect with more customers today."
                        rows={3}
                        onBlur={(e) => updateSetting('homepage_cta_subtitle', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cta-button-text">Primary Button Text</Label>
                      <Input 
                        id="cta-button-text" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_cta_button_text")?.value || "List Your Business"
                          : "List Your Business"
                        }
                        placeholder="List Your Business"
                        onBlur={(e) => updateSetting('homepage_cta_button_text', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cta-button-secondary">Secondary Button Text</Label>
                      <Input 
                        id="cta-button-secondary" 
                        defaultValue={settings && Array.isArray(settings) 
                          ? settings.find((s: any) => s.key === "homepage_cta_button_secondary")?.value || "Learn More"
                          : "Learn More"
                        }
                        placeholder="Learn More"
                        onBlur={(e) => updateSetting('homepage_cta_button_secondary', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => saveHomepageContentMutation.mutate(homepageContent)}
                  disabled={saveHomepageContentMutation.isPending}
                >
                  {saveHomepageContentMutation.isPending ? "Saving..." : "Save Homepage Content"}
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Featured Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-approve-reviews" />
                  <Label htmlFor="auto-approve-reviews">Auto-approve reviews</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="allow-public-submissions" defaultChecked />
                  <Label htmlFor="allow-public-submissions">Allow public business submissions</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}