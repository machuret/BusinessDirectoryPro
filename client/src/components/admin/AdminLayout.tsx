import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import { 
  Building2, Users, Star, Settings, FileText, HelpCircle, Mail, MapPin,
  Download, Upload, Key, CheckCircle, Globe, UserCheck, Home, Menu, BookOpen
} from "lucide-react";

export default function AdminLayout() {
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your business directory platform</p>
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
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-gray-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`${section.color} p-4 rounded-full text-white group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Overview of your platform metrics</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Latest reviews and submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Platform health and performance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}