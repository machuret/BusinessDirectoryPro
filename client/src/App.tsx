import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Categories from "@/pages/categories";
import Cities from "@/pages/cities";
import Featured from "@/pages/featured";
import BusinessDetail from "@/pages/business-detail";
import BusinessListing from "@/pages/business-listing";
import SearchResults from "@/pages/search-results";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import EnhancedAdmin from "@/pages/enhanced-admin";
import MenuEdit from "@/pages/menu-edit";
import PageDisplay from "@/pages/page-display";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/categories/:slug" component={Categories} />
      <Route path="/cities" component={Cities} />
      <Route path="/cities/:city" component={Cities} />
      <Route path="/featured" component={Featured} />
      <Route path="/business/:identifier" component={BusinessListing} />
      <Route path="/businesses/search" component={SearchResults} />
      <Route path="/pages/:slug" component={PageDisplay} />
      <Route path="/login" component={Login} />
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/menu/:id" component={MenuEdit} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
