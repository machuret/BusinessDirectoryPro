import { Search, Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { CategoryWithCount } from "@shared/schema";

interface BusinessFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  categories: CategoryWithCount[];
  cities: { city: string; count: number }[];
  cityFromUrl?: string;
  categoryFromUrl?: string;
}

export function BusinessFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  categories,
  cities,
  cityFromUrl,
  categoryFromUrl,
}: BusinessFiltersProps) {
  const hasActiveFilters = searchQuery || selectedCategory || selectedCity;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCity("");
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 h-12"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-sm">
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {(cityFromUrl || categoryFromUrl || hasActiveFilters) && (
        <div className="flex flex-wrap gap-2">
          {cityFromUrl && (
            <Badge variant="secondary" className="flex items-center gap-1">
              City: {decodeURIComponent(cityFromUrl)}
            </Badge>
          )}
          {categoryFromUrl && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {categoryFromUrl}
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: {searchQuery}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearchQuery("")}
              />
            </Badge>
          )}
          {selectedCategory && !categoryFromUrl && (
            <Badge variant="outline" className="flex items-center gap-1">
              Category: {categories.find(c => c.id.toString() === selectedCategory)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSelectedCategory("")}
              />
            </Badge>
          )}
          {selectedCity && !cityFromUrl && (
            <Badge variant="outline" className="flex items-center gap-1">
              City: {selectedCity}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSelectedCity("")}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Filter Controls */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name} ({category.businessCount || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">City</label>
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
            <label className="text-sm font-medium mb-2 block">Sort by</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Name A-Z</SelectItem>
                <SelectItem value="title_desc">Name Z-A</SelectItem>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="featured">Featured first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}