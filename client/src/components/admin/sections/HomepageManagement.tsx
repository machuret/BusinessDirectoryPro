import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Home, 
  Star, 
  Grid3X3, 
  Users, 
  Building, 
  TrendingUp,
  Edit,
  Save,
  RotateCcw,
  Eye,
  Link,
  Image,
  Type,
  Palette
} from "lucide-react";

interface HomepageSettings {
  [key: string]: string;
}

export default function HomepageManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("hero");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<HomepageSettings>({});

  const { data: settings, isLoading } = useQuery<HomepageSettings>({
    queryKey: ["/api/site-settings"],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return await apiRequest("PATCH", `/api/admin/site-settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({
        title: "Setting Updated",
        description: "Homepage content has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update homepage content.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: string, value: string) => {
    setPendingChanges(prev => ({ ...prev, [key]: value }));
  };

  const saveChanges = () => {
    Object.entries(pendingChanges).forEach(([key, value]) => {
      updateSettingMutation.mutate({ key, value });
    });
    setPendingChanges({});
  };

  const resetChanges = () => {
    setPendingChanges({});
  };

  const getSettingValue = (key: string, defaultValue: string = "") => {
    return pendingChanges[key] ?? settings?.[key] ?? defaultValue;
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Home className="h-8 w-8 text-primary" />
          <div className="text-sm text-muted-foreground">
            Customize all content sections on your homepage
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => window.open("/", "_blank")}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Live
          </Button>
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              {Object.keys(pendingChanges).length} unsaved changes
            </Badge>
          )}
        </div>
      </div>

      {/* Save/Reset Actions */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit className="h-4 w-4 text-orange-600" />
                <span className="text-orange-800 font-medium">You have unsaved changes</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetChanges}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={saveChanges}
                  disabled={updateSettingMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save All Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Management Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hero" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Hero</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <Grid3X3 className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Features</span>
          </TabsTrigger>
          <TabsTrigger value="businesses" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Businesses</span>
          </TabsTrigger>
          <TabsTrigger value="cta" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Call to Action</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Stats</span>
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Hero Section</span>
              </CardTitle>
              <CardDescription>
                Main banner section that appears at the top of your homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hero-title">Main Title</Label>
                    <Input
                      id="hero-title"
                      value={getSettingValue("homepage_hero_title", "Find Local Businesses")}
                      onChange={(e) => handleSettingChange("homepage_hero_title", e.target.value)}
                      placeholder="Enter main headline"
                      className="text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-subtitle">Subtitle</Label>
                    <Textarea
                      id="hero-subtitle"
                      value={getSettingValue("homepage_hero_subtitle", "Discover and connect with trusted local businesses in your area. From restaurants to services, we've got you covered.")}
                      onChange={(e) => handleSettingChange("homepage_hero_subtitle", e.target.value)}
                      placeholder="Enter subtitle description"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hero-bg-color">Background Color</Label>
                    <Input
                      id="hero-bg-color"
                      type="color"
                      value={getSettingValue("homepage_hero_bg_color", "#3B82F6")}
                      onChange={(e) => handleSettingChange("homepage_hero_bg_color", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-text-color">Text Color</Label>
                    <Input
                      id="hero-text-color"
                      type="color"
                      value={getSettingValue("homepage_hero_text_color", "#FFFFFF")}
                      onChange={(e) => handleSettingChange("homepage_hero_text_color", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Section */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Grid3X3 className="h-5 w-5" />
                <span>Browse by Category Section</span>
              </CardTitle>
              <CardDescription>
                Section showcasing business categories for easy navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categories-title">Section Title</Label>
                <Input
                  id="categories-title"
                  value={getSettingValue("homepage_categories_title", "Browse by Category")}
                  onChange={(e) => handleSettingChange("homepage_categories_title", e.target.value)}
                  placeholder="Browse by Category"
                />
              </div>
              <div>
                <Label htmlFor="categories-subtitle">Section Description</Label>
                <Textarea
                  id="categories-subtitle"
                  value={getSettingValue("homepage_categories_subtitle", "Explore businesses across different industries and find exactly what you need.")}
                  onChange={(e) => handleSettingChange("homepage_categories_subtitle", e.target.value)}
                  placeholder="Explore businesses across different industries and find exactly what you need."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Section */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Features Section</span>
              </CardTitle>
              <CardDescription>
                Highlight your platform's key features and benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="features-title">Section Title</Label>
                <Input
                  id="features-title"
                  value={getSettingValue("homepage_features_title", "Why Choose BusinessHub?")}
                  onChange={(e) => handleSettingChange("homepage_features_title", e.target.value)}
                  placeholder="Why Choose BusinessHub?"
                />
              </div>
              
              {/* Feature 1 */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">Feature 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="feature-1-title">Title</Label>
                    <Input
                      id="feature-1-title"
                      value={getSettingValue("homepage_feature_1_title", "Comprehensive Directory")}
                      onChange={(e) => handleSettingChange("homepage_feature_1_title", e.target.value)}
                      placeholder="Feature title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feature-1-desc">Description</Label>
                    <Textarea
                      id="feature-1-desc"
                      value={getSettingValue("homepage_feature_1_description", "Access thousands of verified local businesses across multiple categories and industries.")}
                      onChange={(e) => handleSettingChange("homepage_feature_1_description", e.target.value)}
                      placeholder="Feature description"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">Feature 2</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="feature-2-title">Title</Label>
                    <Input
                      id="feature-2-title"
                      value={getSettingValue("homepage_feature_2_title", "Real Reviews")}
                      onChange={(e) => handleSettingChange("homepage_feature_2_title", e.target.value)}
                      placeholder="Feature title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feature-2-desc">Description</Label>
                    <Textarea
                      id="feature-2-desc"
                      value={getSettingValue("homepage_feature_2_description", "Read authentic reviews from real customers to make informed decisions about local businesses.")}
                      onChange={(e) => handleSettingChange("homepage_feature_2_description", e.target.value)}
                      placeholder="Feature description"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">Feature 3</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="feature-3-title">Title</Label>
                    <Input
                      id="feature-3-title"
                      value={getSettingValue("homepage_feature_3_title", "Easy Discovery")}
                      onChange={(e) => handleSettingChange("homepage_feature_3_title", e.target.value)}
                      placeholder="Feature title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feature-3-desc">Description</Label>
                    <Textarea
                      id="feature-3-desc"
                      value={getSettingValue("homepage_feature_3_description", "Find exactly what you're looking for with our advanced search and filtering capabilities.")}
                      onChange={(e) => handleSettingChange("homepage_feature_3_description", e.target.value)}
                      placeholder="Feature description"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Businesses Section */}
        <TabsContent value="businesses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Featured Businesses */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Businesses</CardTitle>
                <CardDescription>
                  Section highlighting featured/premium businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="featured-title">Section Title</Label>
                  <Input
                    id="featured-title"
                    value={getSettingValue("homepage_featured_title", "Featured Businesses")}
                    onChange={(e) => handleSettingChange("homepage_featured_title", e.target.value)}
                    placeholder="Featured Businesses"
                  />
                </div>
                <div>
                  <Label htmlFor="featured-subtitle">Section Description</Label>
                  <Textarea
                    id="featured-subtitle"
                    value={getSettingValue("homepage_featured_subtitle", "Discover top-rated businesses handpicked for their exceptional service and quality.")}
                    onChange={(e) => handleSettingChange("homepage_featured_subtitle", e.target.value)}
                    placeholder="Section description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Random/Latest Businesses */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Businesses</CardTitle>
                <CardDescription>
                  Section showing random or recently added businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="random-title">Section Title</Label>
                  <Input
                    id="random-title"
                    value={getSettingValue("homepage_random_title", "Latest Businesses")}
                    onChange={(e) => handleSettingChange("homepage_random_title", e.target.value)}
                    placeholder="Latest Businesses"
                  />
                </div>
                <div>
                  <Label htmlFor="random-subtitle">Section Description</Label>
                  <Textarea
                    id="random-subtitle"
                    value={getSettingValue("homepage_random_subtitle", "Discover amazing businesses from our directory with excellent reviews and service.")}
                    onChange={(e) => handleSettingChange("homepage_random_subtitle", e.target.value)}
                    placeholder="Section description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="random-button">Button Text</Label>
                  <Input
                    id="random-button"
                    value={getSettingValue("homepage_random_button_text", "View All Businesses")}
                    onChange={(e) => handleSettingChange("homepage_random_button_text", e.target.value)}
                    placeholder="View All Businesses"
                  />
                </div>
                <div>
                  <Label htmlFor="random-button-url">Button URL</Label>
                  <Input
                    id="random-button-url"
                    value={getSettingValue("homepage_random_button_url", "/businesses")}
                    onChange={(e) => handleSettingChange("homepage_random_button_url", e.target.value)}
                    placeholder="/businesses"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Call to Action Section */}
        <TabsContent value="cta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Business Owner Call to Action</span>
              </CardTitle>
              <CardDescription>
                Encourage business owners to list their businesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cta-title">Main Title</Label>
                    <Input
                      id="cta-title"
                      value={getSettingValue("homepage_cta_title", "Are You a Business Owner?")}
                      onChange={(e) => handleSettingChange("homepage_cta_title", e.target.value)}
                      placeholder="Are You a Business Owner?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta-subtitle">Description</Label>
                    <Textarea
                      id="cta-subtitle"
                      value={getSettingValue("homepage_cta_subtitle", "Join thousands of businesses already listed on BusinessHub. Increase your visibility and connect with more customers today.")}
                      onChange={(e) => handleSettingChange("homepage_cta_subtitle", e.target.value)}
                      placeholder="Call to action description"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cta-primary-button">Primary Button Text</Label>
                    <Input
                      id="cta-primary-button"
                      value={getSettingValue("homepage_cta_primary_text", "List Your Business")}
                      onChange={(e) => handleSettingChange("homepage_cta_primary_text", e.target.value)}
                      placeholder="List Your Business"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta-primary-url">Primary Button URL</Label>
                    <Input
                      id="cta-primary-url"
                      value={getSettingValue("homepage_cta_primary_url", "/api/login")}
                      onChange={(e) => handleSettingChange("homepage_cta_primary_url", e.target.value)}
                      placeholder="/api/login"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta-secondary-button">Secondary Button Text</Label>
                    <Input
                      id="cta-secondary-button"
                      value={getSettingValue("homepage_cta_secondary_text", "Learn More")}
                      onChange={(e) => handleSettingChange("homepage_cta_secondary_text", e.target.value)}
                      placeholder="Learn More"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta-secondary-url">Secondary Button URL</Label>
                    <Input
                      id="cta-secondary-url"
                      value={getSettingValue("homepage_cta_secondary_url", "/about")}
                      onChange={(e) => handleSettingChange("homepage_cta_secondary_url", e.target.value)}
                      placeholder="/about"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Section */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Statistics Section</span>
              </CardTitle>
              <CardDescription>
                Display key metrics and achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stat-1-label">Stat 1 Label</Label>
                  <Input
                    id="stat-1-label"
                    value={getSettingValue("homepage_stat_1_label", "Local Businesses")}
                    onChange={(e) => handleSettingChange("homepage_stat_1_label", e.target.value)}
                    placeholder="Local Businesses"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat-2-value">Stat 2 Value</Label>
                  <Input
                    id="stat-2-value"
                    value={getSettingValue("homepage_stat_2_value", "89,234")}
                    onChange={(e) => handleSettingChange("homepage_stat_2_value", e.target.value)}
                    placeholder="89,234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat-2-label">Stat 2 Label</Label>
                  <Input
                    id="stat-2-label"
                    value={getSettingValue("homepage_stat_2_label", "Customer Reviews")}
                    onChange={(e) => handleSettingChange("homepage_stat_2_label", e.target.value)}
                    placeholder="Customer Reviews"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat-4-value">Stat 4 Value</Label>
                  <Input
                    id="stat-4-value"
                    value={getSettingValue("homepage_stat_4_value", "150+")}
                    onChange={(e) => handleSettingChange("homepage_stat_4_value", e.target.value)}
                    placeholder="150+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat-4-label">Stat 4 Label</Label>
                  <Input
                    id="stat-4-label"
                    value={getSettingValue("homepage_stat_4_label", "Cities Covered")}
                    onChange={(e) => handleSettingChange("homepage_stat_4_label", e.target.value)}
                    placeholder="Cities Covered"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}