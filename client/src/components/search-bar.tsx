import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string, location: string) => void;
  className?: string;
}

export default function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(query, location);
    } else {
      // Default search behavior - navigate to search results
      const searchParams = new URLSearchParams();
      if (query) searchParams.set('q', query);
      if (location) searchParams.set('location', location);
      
      window.location.href = `/businesses/search?${searchParams.toString()}`;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="City, State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>
          
          <Button
            type="submit"
            className="bg-accent text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}
