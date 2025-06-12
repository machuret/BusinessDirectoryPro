import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, MapPin, Grid, List, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BusinessCard from "@/components/business-card-enhanced";
import { Skeleton } from "@/components/ui/skeleton";
import type { BusinessWithCategory, CategoryWithCount } from "@shared/schema";

export default function BusinessesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("title");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 12;

  // Fetch categories for filter dropdown
  const { data: categories = [] } = useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch cities for filter dropdown
  const { data: cities = [] } = useQuery<{ city: string; count: number }[]>({
    queryKey: ["/api/cities"],
  });

  // Fetch businesses with filters
  const { data: businesses = [], isLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses", {
      search: searchQuery || undefined,
      categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
      city: selectedCity || undefined,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;
      const searchParams = new URLSearchParams();
      
      Object.entries(params as Record<string, any>).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/businesses?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }
      return response.json();
    },
  });

  // Filter and sort businesses on client side for better UX
  const filteredAndSortedBusinesses = businesses.sort((a, b) => {
    switch (sortBy) {
      case "title":
        return (a.title || "").localeCompare(b.title || "");
      case "city":
        return (a.city || "").localeCompare(b.city || "");
      case "category":
        return (a.categoryname || "").localeCompare(b.categoryname || "");
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(filteredAndSortedBusinesses.length / itemsPerPage);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCity("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedCity;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCity]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Business Directory
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover local businesses with excellent reviews and service. Find exactly what you're looking for with our advanced search and filtering options.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Main Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.city} value={city.city}>
                        {city.city} ({city.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Name (A-Z)</SelectItem>
                    <SelectItem value="city">City (A-Z)</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters and Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: "{searchQuery}"
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSearchQuery("")}
                      />
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Category: {categories.find(c => c.id.toString() === selectedCategory)?.name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSelectedCategory("")}
                      />
                    </Badge>
                  )}
                  {selectedCity && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedCity}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSelectedCity("")}
                      />
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">View:</span>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? (
              "Loading businesses..."
            ) : (
              `Showing ${filteredAndSortedBusinesses.length} businesses`
            )}
          </p>
        </div>

        {/* Business Grid/List */}
        {isLoading ? (
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No businesses found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear all filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredAndSortedBusinesses.map((business) => (
              <div key={business.placeid} className={viewMode === "list" ? "max-w-none" : ""}>
                <BusinessCard 
                  business={business} 
                  className={viewMode === "list" ? "flex flex-row items-center h-auto" : ""}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredAndSortedBusinesses.length > 0 && totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}