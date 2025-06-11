import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SearchBar from "@/components/search-bar";
import CategoryGrid from "@/components/category-grid";
import BusinessCard from "@/components/business-card";
import BusinessCardSkeleton from "@/components/business-card-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Users, Star, MapPin } from "lucide-react";
import type { BusinessWithCategory, CategoryWithCount } from "@shared/schema";

export default function Home() {
  const { data: featuredBusinesses, isLoading: featuredLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses/featured"],
  });

  const { data: latestBusinesses, isLoading: latestLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses", { limit: 8 }],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  const { data: siteSettings } = useQuery<Record<string, any>>({
    queryKey: ["/api/site-settings"],
  });

  // Update page title dynamically
  useEffect(() => {
    const title = siteSettings?.website_title || "Business Directory";
    document.title = title;
    
    // Update meta description
    const description = siteSettings?.website_description || "Find and discover local businesses in your area";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
  }, [siteSettings]);

  const stats = {
    businesses: categories?.reduce((sum, cat) => sum + cat.businessCount, 0) || 0,
    reviews: "89,234",
    categories: categories?.length || 0,
    cities: "150+",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {siteSettings?.homepage_hero_title || "Find Local Businesses"}
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
            {siteSettings?.homepage_hero_subtitle || "Discover and connect with trusted local businesses in your area. From restaurants to services, we've got you covered."}
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore businesses across different industries and find exactly what you need.
            </p>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl p-6 h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <CategoryGrid categories={categories?.filter(cat => cat.businessCount > 0) || []} />
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {siteSettings?.homepage_features_title || "Why Choose BusinessHub?"}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  {num === 1 && <Building className="w-8 h-8 text-primary" />}
                  {num === 2 && <Users className="w-8 h-8 text-primary" />}
                  {num === 3 && <Star className="w-8 h-8 text-primary" />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {siteSettings?.[`homepage_feature_${num}_title`] || `Feature ${num}`}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {siteSettings?.[`homepage_feature_${num}_description`] || `Feature ${num} description`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Businesses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Businesses</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover newly added businesses in your area with excellent reviews and service.
            </p>
          </div>
          
          {latestLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <BusinessCardSkeleton count={8} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestBusinesses?.map((business) => (
                <BusinessCard key={business.placeid} business={business} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => window.location.href = "/categories"}
            >
              View All Businesses
            </Button>
          </div>
        </div>
      </section>

      {/* Business Owner CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Are You a Business Owner?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of businesses already listed on BusinessHub. Increase your visibility and connect with more customers today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                size="lg"
                className="bg-accent text-white hover:bg-orange-600"
                onClick={() => window.location.href = "/api/login"}
              >
                <Building className="w-5 h-5 mr-2" />
                List Your Business
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{stats.businesses.toLocaleString()}</div>
              <div className="text-gray-600">Local Businesses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{stats.reviews}</div>
              <div className="text-gray-600">Customer Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{stats.categories}+</div>
              <div className="text-gray-600">Business Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{stats.cities}</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
