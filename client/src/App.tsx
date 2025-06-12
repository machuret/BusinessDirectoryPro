import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { UIProvider } from "@/contexts/UIContext";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { LoadingState } from "@/components/loading/LoadingState";
import Home from "@/pages/home";
import Categories from "@/pages/categories";
import Cities from "@/pages/cities";
import Featured from "@/pages/featured";
import BusinessDetail from "@/pages/business-detail";
import BusinessListing from "@/pages/business-listing";
import BusinessOwnerPortal from "@/pages/business-owner-portal";
import SearchResults from "@/pages/search-results";
import Dashboard from "@/pages/dashboard";
import AdminLayout from "@/components/admin/AdminLayout";
import MenuEdit from "@/pages/menu-edit";
import PageDisplay from "@/pages/page-display";
import Login from "@/pages/login";
import AddBusiness from "@/pages/add-business";
import BusinessesPage from "@/pages/businesses";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState variant="spinner" size="lg" message="Initializing application..." />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/categories/:slug" component={Categories} />
      <Route path="/cities" component={Cities} />
      <Route path="/cities/:city" component={Cities} />
      <Route path="/featured" component={Featured} />
      <Route path="/businesses" component={BusinessesPage} />
      <Route path="/search" component={SearchResults} />
      <Route path="/business-portal/:businessId" component={BusinessOwnerPortal} />
      <Route path="/pages/:slug" component={PageDisplay} />
      <Route path="/login" component={Login} />
      <Route path="/add-business" component={AddBusiness} />
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin" component={AdminLayout} />
          <Route path="/admin/menu/:id" component={MenuEdit} />
        </>
      )}
      <Route path="/:slug" component={BusinessDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
