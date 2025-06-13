import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import { 
  Building2, Users, Star, Settings, FileText, HelpCircle, Mail, MapPin,
  Download, Upload, Key, CheckCircle, Globe, UserCheck, Home, Menu, BookOpen,
  ChevronLeft, ChevronRight, Search, Inbox, Tag
} from "lucide-react";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      icon: Building2,
      path: "/admin/businesses"
    },
    {
      title: "User Management", 
      icon: Users,
      path: "/admin/users"
    },
    {
      title: "Categories",
      icon: BookOpen,
      path: "/admin/categories"
    },
    {
      title: "Reviews",
      icon: Star,
      path: "/admin/reviews"
    },
    {
      title: "Cities",
      icon: MapPin,
      path: "/admin/cities"
    },
    {
      title: "Services",
      icon: Tag,
      path: "/admin/services"
    },
    {
      title: "Ownership Requests",
      icon: UserCheck,
      path: "/admin/ownership"
    },
    {
      title: "Business Submissions",
      icon: CheckCircle,
      path: "/admin/submissions"
    },
    {
      title: "API Management",
      icon: Key,
      path: "/admin/api"
    },
    {
      title: "Leads Management",
      icon: Inbox,
      path: "/admin/leads"
    },
    {
      title: "Import Tool",
      icon: Upload,
      path: "/admin/import"
    },
    {
      title: "Export Tool",
      icon: Download,
      path: "/admin/export"
    },
    {
      title: "Featured Listings",
      icon: Star,
      path: "/admin/featured"
    },
    {
      title: "Menu Management",
      icon: Menu,
      path: "/admin/menus"
    },
    {
      title: "Page Management",
      icon: FileText,
      path: "/admin/pages"
    },
    {
      title: "SEO Management",
      icon: Search,
      path: "/admin/seo"
    },
    {
      title: "Contact Messages",
      icon: Mail,
      path: "/admin/inbox"
    },
    {
      title: "Homepage",
      icon: Home,
      path: "/admin/homepage"
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/admin/settings"
    }
  ];

  // If children are provided, render the sidebar layout
  if (children) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="flex">
          {/* Sidebar */}
          <div className={cn(
            "bg-card border-r border transition-all duration-300 flex flex-col",
            sidebarCollapsed ? "w-16" : "w-64"
          )}>
            <div className="p-4 border-b border">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1 h-8 w-8"
                >
                  {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {adminSections.map((section, index) => {
                const IconComponent = section.icon;
                const isActive = location === section.path;
                
                return (
                  <Link key={index} href={section.path}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                      isActive 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}>
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="truncate">{section.title}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen">
            <div className="flex-1 p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default dashboard view when no children
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your business directory platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link 
                key={index}
                href={section.path}
                className="group"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="bg-primary p-4 rounded-full text-primary-foreground group-hover:scale-110 transition-transform duration-200">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {section.title}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default AdminLayout;