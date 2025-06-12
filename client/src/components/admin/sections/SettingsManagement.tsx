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

  // Fetch current settings
  const { data: settings } = useQuery({
    queryKey: ["/api/site-settings"],
    queryFn: () => fetch("/api/site-settings").then(res => res.json())
  });

  // Get current logo
  const currentLogo = settings?.find((s: any) => s.key === "website_logo")?.value;

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