import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, Users, Building2, MessageSquare, MapPin, HelpCircle, 
  FileText, Upload, BarChart3, Search, Plus, Edit, Trash2, 
  Star, Eye, ChevronRight, Globe, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SEOManagement from "@/components/admin/sections/SEOManagement";

export default function ModernAdmin() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Analytics data
  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
    queryFn: () => fetch("/api/admin/analytics").then(res => res.json())
  });

  // FAQ management
  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: ["/api/website-faqs"],
    queryFn: () => fetch("/api/website-faqs").then(res => res.json())
  });

  const createFaqMutation = useMutation({
    mutationFn: async (faqData: any) => {
      const res = await apiRequest("POST", "/api/website-faqs", faqData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-faqs"] });
      toast({ title: "FAQ created successfully" });
    }
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/website-faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-faqs"] });
      toast({ title: "FAQ deleted successfully" });
    }
  });

  // Navigation menu
  const navigationSections = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, description: "Overview and analytics" },
    { id: "seo", label: "SEO Settings", icon: Globe, description: "Search engine optimization" },
    { id: "categories", label: "Categories", icon: Building2, description: "Manage business categories" },
    { id: "cities", label: "Cities", icon: MapPin, description: "Location management" },
    { id: "users", label: "Users", icon: Users, description: "User accounts and permissions" },
    { id: "businesses", label: "Businesses", icon: Building2, description: "Business listings management" },
    { id: "reviews", label: "Reviews", icon: MessageSquare, description: "Review moderation" },
    { id: "faq", label: "Website FAQ", icon: HelpCircle, description: "Site-wide frequently asked questions" },
    { id: "cms", label: "Pages (CMS)", icon: FileText, description: "Content management system" },
    { id: "importer", label: "Data Importer", icon: Upload, description: "Bulk import tools" },
    { id: "api", label: "API Management", icon: Zap, description: "API keys and settings" }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalBusinesses || 0}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground">+23% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalCities || 0}</div>
            <p className="text-xs text-muted-foreground">+2 new cities</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest changes across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">New business registered: Tech Solutions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Review approved for Restaurant ABC</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">SEO settings updated</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("businesses")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Business
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("categories")}
            >
              <Edit className="mr-2 h-4 w-4" />
              Manage Categories
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("reviews")}
            >
              <Eye className="mr-2 h-4 w-4" />
              Review Moderation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFAQSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Website FAQ Management</h2>
          <p className="text-muted-foreground">Manage frequently asked questions for your website</p>
        </div>
        <Button onClick={() => {
          const question = prompt("Enter FAQ question:");
          const answer = prompt("Enter FAQ answer:");
          const category = prompt("Enter category (optional):", "general");
          
          if (question && answer) {
            createFaqMutation.mutate({
              question,
              answer,
              category: category || "general",
              isActive: true,
              order: 0
            });
          }
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQ Items</CardTitle>
          <CardDescription>Manage your website's frequently asked questions</CardDescription>
        </CardHeader>
        <CardContent>
          {faqsLoading ? (
            <div className="text-center py-4">Loading FAQs...</div>
          ) : (
            <div className="space-y-4">
              {faqs?.map((faq: any) => (
                <div key={faq.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary">{faq.category}</Badge>
                        {faq.isActive && <Badge variant="default">Active</Badge>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFaqMutation.mutate(faq.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!faqs || faqs.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No FAQs found. Add your first FAQ to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "faq":
        return renderFAQSection();
      case "seo":
        return <SEOManagement />;
      case "categories":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Category Management</h2>
            <p className="text-muted-foreground">Manage business categories and their settings</p>
          </div>
        );
      case "cities":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">City Management</h2>
            <p className="text-muted-foreground">Manage cities and locations</p>
          </div>
        );
      case "api":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">API Management</h2>
            <p className="text-muted-foreground">Manage API keys and integrations</p>
          </div>
        );
      case "importer":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Data Importer</h2>
            <p className="text-muted-foreground">Import businesses and data from CSV files</p>
          </div>
        );
      case "cms":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Content Management</h2>
            <p className="text-muted-foreground">Manage pages and content</p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{navigationSections.find(s => s.id === activeSection)?.label}</h2>
            <p className="text-muted-foreground">Content for this section is being developed.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Modern Sidebar Navigation */}
        <div className="w-80 bg-card border-r border-border min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Business Directory Management</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navigationSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  aria-pressed={activeSection === section.id}
                  aria-describedby={`section-${section.id}-desc`}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <section.icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{section.label}</div>
                      <div id={`section-${section.id}-desc`} className="text-xs text-muted-foreground">{section.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
}