import { useApiQuery } from "@/hooks/useApiQuery";
import { useContent } from "@/contexts/ContentContext";
import { PageWrapper, Grid } from "@/components/layout";
import SearchBar from "@/components/search-bar";
import WelcomeSection from "@/components/welcome-section";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Building, Users, Star } from "lucide-react";

// Progressive loading components
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedBusinessesList from "@/components/home/FeaturedBusinessesList";
import LatestBusinessesList from "@/components/home/LatestBusinessesList";
import StatsSection from "@/components/home/StatsSection";

export default function Home() {
  const { t } = useContent();
  
  // Only fetch site settings for SEO and CTA buttons - non-blocking for hero
  const { data: siteSettings } = useApiQuery<Record<string, any>>({
    queryKey: ["/api/site-settings"],
  });

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

      {/* Categories Section - Progressive Loading */}
      <CategoriesSection />

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

      {/* Featured Businesses Section - Progressive Loading */}
      <FeaturedBusinessesList />

      {/* Latest Businesses Section - Progressive Loading */}
      <LatestBusinessesList siteSettings={siteSettings} />

      {/* Business Owner CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("homepage.cta.title")}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {t("homepage.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                size="lg"
                className="bg-accent text-white hover:bg-orange-600"
                onClick={() => window.location.href = siteSettings?.homepage_cta_primary_url || "/api/login"}
              >
                <Building className="w-5 h-5 mr-2" />
                {t("homepage.cta.primaryButton")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary"
                onClick={() => window.location.href = siteSettings?.homepage_cta_secondary_url || "/about"}
              >
                {t("homepage.cta.secondaryButton")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Progressive Loading */}
      <StatsSection />

    </PageWrapper>
  );
}
