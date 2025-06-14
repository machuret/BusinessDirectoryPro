import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Save, RefreshCw } from "lucide-react";

interface ContentString {
  key: string;
  value: string;
  category: string;
  description?: string;
}

export default function ContentEditorPage() {
  const { toast } = useToast();
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  // Fetch all content strings
  const { data: contentStrings = {}, isLoading, error } = useQuery({
    queryKey: ["/api/content/strings"],
    refetchOnWindowFocus: false,
  });

  // Convert the content object to an array for easier manipulation
  const contentArray: ContentString[] = Object.entries(contentStrings as Record<string, string>).map(([key, value]) => ({
    key,
    value: value as string,
    category: key.split('.')[0], // Extract category from key prefix
    description: `Content string for ${key}`,
  }));

  // Get unique categories
  const categories = Array.from(new Set(contentArray.map(item => item.category)));

  // Filter content based on search and category
  const filteredContent = contentArray.filter(item => {
    const matchesSearch = item.key.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         item.value.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Update content strings mutation
  const updateContentMutation = useMutation({
    mutationFn: async (updates: Record<string, string>) => {
      const response = await apiRequest("PUT", "/api/admin/content/strings", updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content Updated",
        description: "All content strings have been successfully updated.",
      });
      setEditedValues({});
      queryClient.invalidateQueries({ queryKey: ["/api/content/strings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update content strings.",
        variant: "destructive",
      });
    },
  });

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveChanges = () => {
    if (Object.keys(editedValues).length === 0) {
      toast({
        title: "No Changes",
        description: "No content strings have been modified.",
      });
      return;
    }

    updateContentMutation.mutate(editedValues);
  };

  const getCurrentValue = (key: string) => {
    return editedValues[key] ?? (contentStrings as Record<string, string>)[key] ?? "";
  };

  const hasChanges = Object.keys(editedValues).length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Content</CardTitle>
          <CardDescription>
            Failed to load content strings. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Editor</h1>
        <p className="text-muted-foreground mt-2">
          Manage all website text content from this centralized interface.
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Content</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by key or value..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[200px]">
              <Label htmlFor="category">Filter by Category</Label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Strings Editor */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Content Strings</CardTitle>
            <CardDescription>
              {filteredContent.length} of {contentArray.length} strings shown
            </CardDescription>
          </div>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || updateContentMutation.isPending}
            className="min-w-[120px]"
          >
            {updateContentMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </CardHeader>
        <CardContent>
          {hasChanges && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>{Object.keys(editedValues).length}</strong> content string{Object.keys(editedValues).length === 1 ? '' : 's'} modified. 
                Don't forget to save your changes!
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filteredContent.map((item, index) => (
              <div key={item.key}>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Label 
                        htmlFor={`content-${item.key}`}
                        className="font-mono text-sm font-medium"
                      >
                        {item.key}
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      {editedValues[item.key] && (
                        <Badge variant="outline" className="text-xs">
                          Modified
                        </Badge>
                      )}
                    </div>
                    <Input
                      id={`content-${item.key}`}
                      value={getCurrentValue(item.key)}
                      onChange={(e) => handleValueChange(item.key, e.target.value)}
                      placeholder="Enter content value..."
                      className="font-normal"
                    />
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                {index < filteredContent.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}

            {filteredContent.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No content strings match your current filters.</p>
                <p className="text-sm mt-1">Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{contentArray.length}</div>
              <div className="text-sm text-muted-foreground">Total Strings</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(editedValues).length}
              </div>
              <div className="text-sm text-muted-foreground">Modified</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredContent.length}
              </div>
              <div className="text-sm text-muted-foreground">Shown</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}