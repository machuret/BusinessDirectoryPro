import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, MapPin, Filter, AlertTriangle, RefreshCw } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { SectionErrorBoundary } from "@/components/error/SectionErrorBoundary";
import BusinessCard from "@/components/business-card";
import BusinessCardSkeleton from "@/components/business-card-skeleton";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { BusinessWithCategory } from "@shared/schema";

export default function SearchResults() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialQuery = searchParams.get('q') || '';
  const initialLocation = searchParams.get('location') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [locationFilter, setLocationFilter] = useState(initialLocation);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeLocation, setActiveLocation] = useState(initialLocation);

  const { 
    data: businesses, 
    isLoading, 
    isError, 
    isNotFound, 
    error, 
    refetch 
  } = useApiQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses/search", activeQuery, activeLocation],
    enabled: !!(activeQuery || activeLocation),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(query);
    setActiveLocation(locationFilter);
    
    // Update URL
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (locationFilter) params.set('location', locationFilter);
    window.history.pushState({}, '', `/businesses/search?${params.toString()}`);
  };

  useEffect(() => {
    document.title = `Search Results${activeQuery ? ` for "${activeQuery}"` : ''}${activeLocation ? ` in ${activeLocation}` : ''} | Business Directory`;
  }, [activeQuery, activeLocation]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="What are you looking for?"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-12"
                    />
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="City, State"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="pl-12"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Header */}
        {(activeQuery || activeLocation) && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Search Results
                  {activeQuery && <span className="text-primary"> for "{activeQuery}"</span>}
                  {activeLocation && <span className="text-gray-600"> in {activeLocation}</span>}
                </h1>
                {!isLoading && businesses && (
                  <p className="text-gray-600 mt-1">
                    {businesses.length} business{businesses.length !== 1 ? 'es' : ''} found
                  </p>
                )}
              </div>
              
              {(activeQuery || activeLocation) && (
                <div className="flex items-center space-x-2">
                  {activeQuery && (
                    <Badge variant="secondary" className="flex items-center">
                      <Search className="w-3 h-3 mr-1" />
                      {activeQuery}
                    </Badge>
                  )}
                  {activeLocation && (
                    <Badge variant="secondary" className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {activeLocation}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BusinessCardSkeleton count={6} />
          </div>
        )}

        {/* Error States */}
        {isError && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Search Error</h3>
              <p className="text-muted-foreground mb-4">
                {error?.message || "There was an error performing your search. Please try again."}
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => refetch()} variant="default">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={() => {
                  setActiveQuery('');
                  setActiveLocation('');
                  setQuery('');
                  setLocationFilter('');
                }} variant="outline">
                  Clear Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isNotFound && (
          <Alert variant="default" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Search service is temporarily unavailable. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* No Search Terms */}
        {!activeQuery && !activeLocation && !isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Search</h3>
              <p className="text-gray-600">
                Enter a business name, category, or location to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {!isLoading && businesses && businesses.length === 0 && (activeQuery || activeLocation) && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any businesses matching your search criteria.
              </p>
              <div className="text-sm text-gray-500">
                <p>Try:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Checking your spelling</li>
                  <li>Using more general terms</li>
                  <li>Searching in a different location</li>
                  <li>Browsing our categories instead</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Grid */}
        {!isLoading && businesses && businesses.length > 0 && (
          <SectionErrorBoundary>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business: BusinessWithCategory) => (
                <BusinessCard key={business.placeid} business={business} />
              ))}
            </div>
          </SectionErrorBoundary>
        )}
      </main>
      
      <Footer />
    </div>
  );
}