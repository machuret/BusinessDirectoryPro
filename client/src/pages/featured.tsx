import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Phone, Globe, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { BusinessWithCategory } from "@shared/schema";

export default function Featured() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: featuredBusinesses, isLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses/featured", { limit: 20 }],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const filteredBusinesses = featuredBusinesses?.filter(business => {
    const matchesSearch = !searchTerm || 
      business.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.categoryname?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || business.categoryname === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Star className="h-8 w-8 text-yellow-500 mr-2" />
          <h1 className="text-4xl font-bold">Featured Businesses</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover our handpicked selection of outstanding local businesses that provide exceptional service and quality.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search featured businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md"
          >
            <option value="">All Categories</option>
            {categories?.map((category: any) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Business Grid */}
      {filteredBusinesses && filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <Card key={business.placeid} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{business.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {business.categoryname}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-200">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    </div>
                  </div>
                </div>
                {business.description && (
                  <CardDescription className="line-clamp-2">
                    {business.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {business.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {business.address}
                        {business.city && `, ${business.city}`}
                        {business.state && `, ${business.state}`}
                      </span>
                    </div>
                  )}
                  
                  {business.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                  
                  {business.website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{business.website}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <Link to={`/business/${business.slug || business.placeid}`}>
                      <Button className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Featured Businesses Found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory 
              ? "Try adjusting your search filters to find more businesses."
              : "No businesses are currently featured. Check back soon!"
            }
          </p>
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Want to Feature Your Business?</CardTitle>
            <CardDescription>
              Get your business featured to reach more customers and grow your presence in the local community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button>List Your Business</Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline">Browse All Categories</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}