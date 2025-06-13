import { useApiQuery } from "@/hooks/useApiQuery";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BusinessCard from "@/components/business-card";
import BusinessCardSkeleton from "@/components/business-card-skeleton";
import { SectionErrorBoundary } from "@/components/error/SectionErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Phone, Globe, Search, RefreshCw, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import type { BusinessWithCategory } from "@shared/schema";

export default function Featured() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: featuredBusinesses, isLoading, error: featuredError, refetch: retryFeatured } = useApiQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses/featured", { limit: 20 }],
  });

  const { data: categories, error: categoriesError, refetch: retryCategories } = useApiQuery({
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
        <SectionErrorBoundary 
          fallbackTitle="Unable to load search filters"
          fallbackMessage="We're having trouble loading the category filters. You can still browse all featured businesses below."
        >
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
            {categoriesError ? (
              <div className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                Categories unavailable
              </div>
            ) : (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">All Categories</option>
                {(categories || []).map((category: any) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </SectionErrorBoundary>

        {/* Featured Businesses Grid */}
        <SectionErrorBoundary 
          fallbackTitle="Unable to load featured businesses"
          fallbackMessage="We're having trouble loading featured businesses. Please try refreshing the page."
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <BusinessCardSkeleton count={6} variant="default" />
            </div>
          ) : featuredError ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load featured businesses</h3>
              <p className="text-gray-600 mb-4">We're having trouble loading the featured businesses.</p>
              <Button onClick={() => retryFeatured()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredBusinesses && filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredBusinesses.map((business: BusinessWithCategory) => (
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
        </SectionErrorBoundary>

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