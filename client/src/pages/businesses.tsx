import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { BusinessFilters } from "@/components/businesses/BusinessFilters";
import { BusinessViewControls } from "@/components/businesses/BusinessViewControls";
import { BusinessGrid } from "@/components/businesses/BusinessGrid";
import type { BusinessWithCategory, CategoryWithCount } from "@shared/schema";

export default function BusinessesPage() {
  const params = useParams();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("title");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 12;

  // Initialize filters based on URL params
  useEffect(() => {
    if (params.categorySlug) {
      setSelectedCategory(params.categorySlug);
    } else if (params.cityName) {
      setSelectedCity(decodeURIComponent(params.cityName));
    } else if (location.startsWith('/') && location !== '/businesses') {
      const cityFromPath = location.substring(1);
      if (cityFromPath && !cityFromPath.includes('/')) {
        setSelectedCity(decodeURIComponent(cityFromPath));
      }
    }
  }, [params.categorySlug, params.cityName, location]);

  // Fetch categories for filter dropdown
  const { data: categories = [] } = useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch cities for filter dropdown
  const { data: cities = [] } = useQuery<{ city: string; count: number }[]>({
    queryKey: ["/api/cities"],
  });

  // Determine the API endpoint and city from URL
  const getApiEndpointAndCity = () => {
    if (params.categorySlug) {
      return { endpoint: `/api/businesses/category/${params.categorySlug}`, cityFromUrl: null };
    } else if (params.cityName) {
      return { endpoint: `/api/businesses/city/${params.cityName}`, cityFromUrl: params.cityName };
    } else if (location.startsWith('/') && location !== '/businesses' && !location.includes('/')) {
      const cityFromPath = location.substring(1);
      return { endpoint: `/api/businesses/city/${cityFromPath}`, cityFromUrl: cityFromPath };
    } else {
      return { endpoint: '/api/businesses', cityFromUrl: null };
    }
  };

  const { endpoint, cityFromUrl } = getApiEndpointAndCity();
  const cityParam = cityFromUrl || undefined;

  // Fetch businesses with filters
  const { data: businesses = [], isLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: [endpoint, {
      search: searchQuery || undefined,
      categoryId: selectedCategory && !params.categorySlug ? parseInt(selectedCategory) : undefined,
      city: selectedCity && !cityFromUrl ? selectedCity : undefined,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    }],
    queryFn: async ({ queryKey }) => {
      const [apiEndpoint, queryParams] = queryKey as [string, Record<string, any>];
      
      // For category/city specific endpoints, use direct fetch
      if (apiEndpoint.includes('/category/') || apiEndpoint.includes('/city/')) {
        const searchParams = new URLSearchParams();
        if (queryParams.limit) searchParams.append('limit', queryParams.limit.toString());
        if (queryParams.offset) searchParams.append('offset', queryParams.offset.toString());
        
        const response = await fetch(`${apiEndpoint}?${searchParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch businesses');
        }
        const data = await response.json();
        
        // Handle different response formats
        return Array.isArray(data) ? data : data.businesses || [];
      }
      
      // For general businesses endpoint, use existing logic
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${apiEndpoint}?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }
      return response.json();
    },
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCity, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {params.categorySlug ? (
              `${params.categorySlug.charAt(0).toUpperCase() + params.categorySlug.slice(1).replace('-', ' ')} Businesses`
            ) : cityFromUrl ? (
              `Businesses in ${decodeURIComponent(cityFromUrl)}`
            ) : (
              'Business Directory'
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            {params.categorySlug ? (
              `Find the best ${params.categorySlug.replace('-', ' ')} businesses in your area`
            ) : cityFromUrl ? (
              `Discover local businesses in ${decodeURIComponent(cityFromUrl)}`
            ) : (
              'Discover and connect with local businesses in your area'
            )}
          </p>
        </div>

        {/* Filters */}
        <BusinessFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          categories={categories}
          cities={cities}
          cityFromUrl={cityFromUrl}
          categoryFromUrl={params.categorySlug}
        />

        <Separator />

        {/* View Controls */}
        <BusinessViewControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalResults={businesses.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          cityFromUrl={cityFromUrl}
          categoryFromUrl={params.categorySlug}
        />

        {/* Business Grid */}
        <BusinessGrid
          businesses={businesses}
          isLoading={isLoading}
          viewMode={viewMode}
        />

        {/* TODO: Pagination component can be added here */}
      </div>
    </div>
  );
}