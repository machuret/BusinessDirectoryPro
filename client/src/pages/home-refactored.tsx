import { useApiQuery } from "@/hooks/useApiQuery";
import { Grid, FlexContainer } from "@/components/layout";
import SearchBar from "@/components/search-bar";
import CategoryGrid from "@/components/category-grid";
import { BusinessCard } from "@/components/business-card-consolidated";
import BusinessCardSkeleton from "@/components/business-card-skeleton";
import WelcomeSection from "@/components/welcome-section";
import SEOHead from "@/components/SEOHead";
import { SectionErrorBoundary } from "@/components/error/SectionErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Users, Star, MapPin, RefreshCw } from "lucide-react";
import type { BusinessWithCategory, CategoryWithCount } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function HomeRefactored() {
  const { data: featuredBusinesses, isLoading: featuredLoading, error: featuredError, refetch: retryFeatured } = useApiQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses/featured"],
  });

  const { data: randomBusinesses, isLoading: randomLoading, error: randomError, refetch: retryRandom } = useApiQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses/random", { limit: 9 }],
  });

  const { data: categories, isLoading: categoriesLoading, error: categoriesError, refetch: retryCategories } = useApiQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  const { data: siteSettings, error: settingsError, refetch: retrySettings } = useApiQuery<Record<string, any>>({
    queryKey: ["/api/site-settings"],
  });

  const stats = {
    businesses: categories?.reduce((sum, cat) => sum + cat.businessCount, 0) || 0,
    reviews: "89,234",
    categories: categories?.length || 0,
    cities: "150+",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        siteSettings={siteSettings}
        pageType="home"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {siteSettings?.homepage_hero_title || "Find Local Businesses"}
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
            {siteSettings?.homepage_hero_subtitle || "Discover and connect with trusted local businesses in your area. From restaurants to services, we've got you covered."}
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-white">
        <div className="container-responsive">
          <SectionErrorBoundary>
            <WelcomeSection
              title={siteSettings?.homepage_welcome_title}
              content={siteSettings?.homepage_welcome_content}
              ctaText={siteSettings?.homepage_welcome_cta_text}
              ctaUrl={siteSettings?.homepage_welcome_cta_url}
            />
          </SectionErrorBoundary>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore businesses across different categories to find exactly what you need
            </p>
          </div>
          
          <SectionErrorBoundary>
            <CategoryGrid 
              categories={categories} 
              isLoading={categoriesLoading} 
              error={categoriesError}
              onRetry={retryCategories}
            />
          </SectionErrorBoundary>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {siteSettings?.homepage_features_title || "Why Choose BusinessHub?"}
            </h2>
          </div>
          
          <Grid cols={3} gap="responsive-lg" colsResponsive={{ sm: 1, md: 2, lg: 3 }}>
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
          </Grid>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-16 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {siteSettings?.homepage_featured_title || "Featured Businesses"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {siteSettings?.homepage_featured_subtitle || "Discover top-rated businesses handpicked for their exceptional service and quality."}
            </p>
          </div>
          
          <SectionErrorBoundary 
            fallbackTitle="Unable to load featured businesses"
            fallbackMessage="We're having trouble loading featured businesses. Please try again."
          >
            {featuredLoading ? (
              <Grid cols={3} gap="responsive-md" colsResponsive={{ sm: 1, md: 2, lg: 3 }}>
                {[...Array(6)].map((_, i) => (
                  <BusinessCardSkeleton key={i} />
                ))}
              </Grid>
            ) : featuredError ? (
              <FlexContainer direction="col" align="center" gap="md" className="py-12">
                <p className="text-gray-600 text-center">
                  Unable to load featured businesses at the moment.
                </p>
                <Button onClick={retryFeatured} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </FlexContainer>
            ) : (
              <Grid cols={3} gap="responsive-md" colsResponsive={{ sm: 1, md: 2, lg: 3 }}>
                {featuredBusinesses?.slice(0, 6).map((business) => (
                  <BusinessCard
                    key={business.placeid}
                    business={business}
                    variant="featured"
                    showFeaturedBadge={true}
                  />
                ))}
              </Grid>
            )}
          </SectionErrorBoundary>
        </div>
      </section>

      {/* Random Businesses */}
      <section className="py-16 bg-gray-50">
        <div className="container-responsive">
          <FlexContainer justify="between" align="center" className="mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {siteSettings?.homepage_random_title || "Discover More Businesses"}
              </h2>
              <p className="text-lg text-gray-600">
                {siteSettings?.homepage_random_subtitle || "Explore a diverse selection of businesses in your area."}
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/businesses">View All</a>
            </Button>
          </FlexContainer>
          
          <SectionErrorBoundary>
            {randomLoading ? (
              <Grid cols={3} gap="responsive-md" colsResponsive={{ sm: 1, md: 2, lg: 3 }}>
                {[...Array(9)].map((_, i) => (
                  <BusinessCardSkeleton key={i} />
                ))}
              </Grid>
            ) : randomError ? (
              <FlexContainer direction="col" align="center" gap="md" className="py-12">
                <p className="text-gray-600 text-center">
                  Unable to load businesses at the moment.
                </p>
                <Button onClick={retryRandom} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </FlexContainer>
            ) : (
              <Grid cols={3} gap="responsive-md" colsResponsive={{ sm: 1, md: 2, lg: 3 }}>
                {randomBusinesses?.map((business) => (
                  <BusinessCard
                    key={business.placeid}
                    business={business}
                    variant="default"
                  />
                ))}
              </Grid>
            )}
          </SectionErrorBoundary>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-blue-100 text-lg">
              Join our growing community of businesses and customers
            </p>
          </div>
          
          <Grid cols={4} gap="responsive-lg" colsResponsive={{ sm: 2, md: 4 }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.businesses.toLocaleString()}</div>
              <div className="text-blue-100">Listed Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.reviews}</div>
              <div className="text-blue-100">Customer Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.categories}</div>
              <div className="text-blue-100">Business Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.cities}</div>
              <div className="text-blue-100">Cities Covered</div>
            </div>
          </Grid>
        </div>
      </section>

      <Footer />
    </div>
  );
}