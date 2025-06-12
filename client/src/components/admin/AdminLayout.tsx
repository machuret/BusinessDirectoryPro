import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import { 
  Building2, Users, Star, Settings, FileText, HelpCircle, Mail, MapPin,
  Download, Upload, Key, CheckCircle, Globe, UserCheck, Home, Menu, BookOpen
} from "lucide-react";

export default function AdminLayout() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Check admin access
  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You need administrator privileges to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      title: "Business Management",
      description: "Manage business listings, approvals, and optimization",
      icon: Building2,
      path: "/admin/businesses",
      color: "bg-blue-500"
    },
    {
      title: "User Management", 
      description: "Manage user accounts and permissions",
      icon: Users,
      path: "/admin/users",
      color: "bg-green-500"
    },
    {
      title: "Categories",
      description: "Manage business categories and subcategories",
      icon: BookOpen,
      path: "/admin/categories", 
      color: "bg-purple-500"
    },
    {
      title: "Reviews",
      description: "Moderate and manage customer reviews",
      icon: Star,
      path: "/admin/reviews",
      color: "bg-yellow-500"
    },
    {
      title: "Cities",
      description: "Manage cities and location data", 
      icon: MapPin,
      path: "/admin/cities",
      color: "bg-red-500"
    },
    {
      title: "Menu Management",
      description: "Manage site navigation menus",
      icon: Menu,
      path: "/admin/menus",
      color: "bg-indigo-500"
    },
    {
      title: "Page Management",
      description: "Create and edit website pages",
      icon: FileText,
      path: "/admin/pages",
      color: "bg-orange-500"
    },
    {
      title: "SEO Management",
      description: "Optimize search engine settings",
      icon: Globe,
      path: "/admin/seo", 
      color: "bg-teal-500"
    },
    {
      title: "Inbox & Leads",
      description: "Manage contact forms and leads",
      icon: Mail,
      path: "/admin/inbox",
      color: "bg-pink-500"
    },
    {
      title: "Homepage",
      description: "Customize homepage content and layout",
      icon: Home,
      path: "/admin/homepage",
      color: "bg-cyan-500"
    }
  ];

  const navigationItems = [
    { id: "businesses", label: "Businesses", icon: Building2 },
    { id: "submissions", label: "Submissions", icon: CheckCircle },
    { id: "homepage", label: "Homepage", icon: Home },
    { id: "users", label: "Users", icon: Users },
    { id: "categories", label: "Categories", icon: FileText },
    { id: "cities", label: "Cities", icon: MapPin },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "ownership", label: "Ownership", icon: UserCheck },
    { id: "import", label: "Import", icon: Download },
    { id: "api", label: "API", icon: Key },
    { id: "cms", label: "CMS", icon: Globe },
    { id: "export", label: "Export", icon: Upload },
    { id: "leads", label: "Leads", icon: Mail },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "optimization", label: "Optimization", icon: Star },
    { id: "featured", label: "Featured", icon: CheckCircle },
    { id: "menu", label: "Menu", icon: Settings },
  ];

  const renderActiveSection = () => {
    switch (activeTab) {
      case "businesses":
        return <BusinessManagement />;
      case "submissions":
        return <BusinessSubmissions />;
      case "homepage":
        return <HomepageManagement />;
      case "users":
        return <UserManagement />;
      case "categories":
        return <CategoriesManagement />;
      case "cities":
        return <CitiesManagement />;
      case "reviews":
        return <ReviewsManagement />;
      case "ownership":
        return <OwnershipManagement />;
      case "import":
        return <ImportManagement />;
      case "api":
        return <APIManagement />;
      case "cms":
        return <CMSManagement />;
      case "export":
        return <ExportManagement />;
      case "leads":
        return <LeadsManagement />;
      case "settings":
        return <SettingsManagement />;
      case "faq":
        return <FAQManagement />;
      case "optimization":
        return <OptimizationManagement />;
      case "featured":
        return <FeaturedManagement />;
      case "menu":
        return <MenuManagement />;
      default:
        return <BusinessManagement />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Business Directory Management</p>
        </div>
        
        <nav className="mt-6 px-3 pb-6 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
}