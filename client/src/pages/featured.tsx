import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BusinessCard from "@/components/business-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Phone, Globe, Search } from "lucide-react";
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

  // Add SEO title
  useEffect(() => {
    document.title = "Featured Businesses | Business Directory";
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-yellow-500 mr-2" />
            <h1 className="text-4xl font-bold">Featured Businesses</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover handpicked premium businesses that deliver exceptional service and quality
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
            className="px-4 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="">All Categories</option>
            {categories?.map((category: any) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Featured Businesses Grid */}
        {filteredBusinesses && filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredBusinesses.map((business) => (
              <BusinessCard key={business.placeid} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory ? "No businesses found" : "No featured businesses"}
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search or filter criteria." 
                : "Check back soon for featured businesses in your area."
              }
            </p>
          </div>
        )}

        {/* Call to Action */}
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle>Want to Feature Your Business?</CardTitle>
            <CardDescription>
              Join our featured listings and reach more customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button>Get Featured</Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline">Browse All Categories</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}