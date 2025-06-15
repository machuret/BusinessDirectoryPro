import { useApiQuery } from "@/hooks/useApiQuery";
import { useContent } from "@/contexts/ContentContext";
import { PageWrapper, Grid, FlexContainer } from "@/components/layout";
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

export default function Home() {
  const { t } = useContent();
  
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
    reviews: t("homepage.stats.reviews.value"),
    categories: categories?.length || 0,
    cities: t("homepage.stats.cities.value"),
  };

  return (
    <PageWrapper 
      title={t("homepage.seo.title")}
      description={t("homepage.seo.description")}
      className="bg-gray-50"
    >
      <SEOHead 
        siteSettings={siteSettings}
        pageType="home"
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("homepage.hero.title")}
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
            {t("homepage.hero.subtitle")}
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Welcome Section */}
      <WelcomeSection />

      {/* Category Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("homepage.categories.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("homepage.categories.subtitle")}
            </p>
          </div>
          
          <SectionErrorBoundary 
            fallbackTitle={t("homepage.categories.error.title")}
            fallbackMessage={t("homepage.categories.error.message")}
          >
            {categoriesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl p-6 h-32 animate-pulse" />
                ))}
              </div>
            ) : categoriesError ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">{t("homepage.categories.error.unable")}</p>
                <Button onClick={retryCategories} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("homepage.categories.error.retry")}
                </Button>
              </div>
            ) : (
              <CategoryGrid categories={categories?.filter(cat => (cat as any).businessCount > 0) || []} />
            )}
          </SectionErrorBoundary>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("homepage.features.title")}
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
                  {t(`homepage.features.feature${num}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(`homepage.features.feature${num}.description`)}
                </p>
              </div>
            ))}
          </Grid>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <BusinessCardSkeleton 
                  count={6} 
                  variant="default"
                  className="transition-all duration-300"
                />
              </div>
            ) : featuredError ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Unable to load featured businesses</p>
                <Button onClick={retryFeatured} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : featuredBusinesses && featuredBusinesses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredBusinesses.map((business) => (
                  <BusinessCard key={business.placeid} business={business} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No featured businesses available</p>
              </div>
            )}
          </SectionErrorBoundary>
        </div>
      </section>

      {/* Latest Businesses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {siteSettings?.homepage_random_title || "Random Businesses"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {siteSettings?.homepage_random_subtitle || "Discover amazing businesses from our directory with excellent reviews and service."}
            </p>
          </div>
          
          {randomLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <BusinessCardSkeleton 
                count={9} 
                variant="carousel"
                className="transition-all duration-300"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {randomBusinesses?.map((business) => (
                <BusinessCard key={business.placeid} business={business} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => window.location.href = siteSettings?.homepage_random_button_url || "/businesses"}
            >
              {siteSettings?.homepage_random_button_text || "View All Businesses"}
            </Button>
          </div>
        </div>
      </section>

      {/* Business Owner CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              {siteSettings?.homepage_cta_title || "Are You a Business Owner?"}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {siteSettings?.homepage_cta_subtitle || "Join thousands of businesses already listed on BusinessHub. Increase your visibility and connect with more customers today."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                size="lg"
                className="bg-accent text-white hover:bg-orange-600"
                onClick={() => window.location.href = siteSettings?.homepage_cta_primary_url || "/api/login"}
              >
                <Building className="w-5 h-5 mr-2" />
                {siteSettings?.homepage_cta_primary_text || "List Your Business"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary"
                onClick={() => window.location.href = siteSettings?.homepage_cta_secondary_url || "/about"}
              >
                {siteSettings?.homepage_cta_secondary_text || "Learn More"}
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

    </PageWrapper>
  );
}
