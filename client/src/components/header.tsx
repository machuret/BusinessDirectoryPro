import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building, Menu, User, LogOut, Settings, BarChart3 } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch website logo from database
  const { data: settings } = useQuery({
    queryKey: ["/api/site-settings"],

  });

  // Fetch header menu items from database
  const { data: menuItems } = useQuery({
    queryKey: ["/api/menu-items?location=header"],
  });

  const websiteLogo = settings && Array.isArray(settings) 
    ? settings.find((s: any) => s.key === "website_logo")?.value 
    : null;

  // Use dynamic menu items or fallback to default
  const navItems = menuItems && Array.isArray(menuItems) && menuItems.length > 0 
    ? menuItems.map((item: any) => ({
        href: item.url,
        label: item.name
      }))
    : [
        { href: "/", label: "Home" },
        { href: "/categories", label: "Categories" },
        { href: "/featured", label: "Featured" },
      ];

  const isActiveLink = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const getUserInitials = (user: any) => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSignOut = () => {
    // For now, just redirect to login page
    window.location.href = "/login";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {websiteLogo ? (
                <img
                  src={websiteLogo}
                  alt="Website Logo"
                  className="h-10 w-auto mr-3 object-contain"
                />
              ) : (
                <Building className="text-primary text-2xl mr-3" />
              )}
              <h1 className="text-2xl font-bold text-gray-900">BusinessHub</h1>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item: any) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-1 pb-1 text-sm font-medium transition-colors ${
                    isActiveLink(item.href)
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={(user as any).profileImageUrl} />
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {(user as any).firstName && (user as any).lastName && (
                          <p className="font-medium">{(user as any).firstName} {(user as any).lastName}</p>
                        )}
                        {(user as any).email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {(user as any).email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    {(user as any).role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">
                    Sign In
                  </Button>
                </Link>
                <Link href="/add-business">
                  <Button className="bg-primary text-white hover:bg-blue-700">
                    Add Your Business
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item: any) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-lg font-medium transition-colors ${
                        isActiveLink(item.href)
                          ? "text-primary"
                          : "text-gray-700 hover:text-primary"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="border-t pt-4 mt-4">
                    {isAuthenticated && user ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={(user as any).profileImageUrl} />
                            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            {(user as any).firstName && (user as any).lastName && (
                              <p className="font-medium">{(user as any).firstName} {(user as any).lastName}</p>
                            )}
                            {(user as any).email && (
                              <p className="text-sm text-gray-600">{(user as any).email}</p>
                            )}
                          </div>
                        </div>
                        
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 text-gray-700 hover:text-primary"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        
                        {(user as any).role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center space-x-2 text-gray-700 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleSignOut();
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link href="/login">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/login">
                          <Button 
                            className="w-full bg-primary text-white hover:bg-blue-700"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            List Your Business
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
