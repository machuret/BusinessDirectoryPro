import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BusinessCard from "@/components/business-card";
import BusinessCardSkeleton from "@/components/business-card-skeleton";
import CategoryGrid from "@/components/category-grid";
import SearchBar from "@/components/search-bar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import type { BusinessWithCategory, CategoryWithCount, Category } from "@shared/schema";

export default function Categories() {
  const { slug } = useParams();
  const [location] = useLocation();
  const { t } = useContent();
  
  // Extract category from query parameter
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const categoryParam = urlParams.get('category');
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${slug}`],
    enabled: !!slug,
  });

  // Find category by name when using query parameter
  const categoryByName = categoryParam && categories?.find(cat => cat.name === categoryParam);
  const currentCategory = category || (categoryByName || undefined);

  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: [`/api/businesses`, { categoryId: currentCategory?.id }],
    queryFn: async () => {
      if (!currentCategory?.id) return [];
      const response = await fetch(`/api/businesses?categoryId=${currentCategory.id}`);
      if (!response.ok) throw new Error('Failed to fetch businesses');
      return response.json();
    },
    enabled: !!currentCategory?.id,
  });

  const { data: allBusinesses, isLoading: allBusinessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses"],
    enabled: !slug,
  });

  const { data: siteSettings } = useQuery<Record<string, any>>({
    queryKey: ["/api/site-settings"],
  });

  if (slug && categoryLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (slug && !categoryLoading && !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('categories.notFound.title')}</h1>
          <p className="text-gray-600 mb-8">{t('categories.notFound.description')}</p>
          <Button onClick={() => window.location.href = "/categories"}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('categories.notFound.backButton')}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentBusinesses = (slug || categoryParam) ? businesses : allBusinesses;
  const isLoadingBusinesses = (slug || categoryParam) ? businessesLoading : allBusinessesLoading;

  // Debug logging
  console.log('Categories Debug:', {
    slug,
    categoryParam,
    currentCategory,
    businesses,
    businessesLoading,
    currentBusinesses,
    isLoadingBusinesses
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        category={category}
        siteSettings={siteSettings}
        pageType={slug ? "category" : "home"}
      />
      <Header />
      
      {/* Breadcrumb and Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
              </BreadcrumbItem>
              {slug && category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{category.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="mt-4">
            {slug && category ? (
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: category.color + '20' }}>
                  <i className={`${category.icon} text-2xl`} style={{ color: category.color }}></i>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                  {category.description && (
                    <p className="text-gray-600 mt-2">{category.description}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('categories.directory.title')}</h1>
                <p className="text-gray-600 mt-2">{t('categories.directory.description')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-primary/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!slug && (
          <>
            {/* All Categories Grid */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('categories.browsing.title')}</h2>
              {categoriesLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-xl p-6 h-32 animate-pulse" />
                  ))}
                </div>
              ) : (
                <CategoryGrid categories={categories?.filter(cat => cat.businessCount > 0) || []} />
              )}
            </section>
          </>
        )}

        {/* Businesses List */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {slug && category ? t('categories.businesses.categoryTitle', { categoryName: category.name }) : t('categories.businesses.allTitle')}
              {currentBusinesses && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({currentBusinesses.length} {currentBusinesses.length === 1 ? t('categories.businesses.businessSingular') : t('categories.businesses.businessPlural')})
                </span>
              )}
            </h2>
          </div>

          {isLoadingBusinesses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <BusinessCardSkeleton 
                count={9} 
                variant="default"
                className="transition-all duration-300"
              />
            </div>
          ) : currentBusinesses && currentBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentBusinesses
                .filter((business, index, array) => 
                  array.findIndex(b => b.placeid === business.placeid) === index
                )
                .map((business, index) => (
                  <BusinessCard key={`category-${business.placeid}-${index}`} business={business} />
                ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('categories.empty.title')}</h3>
              <p className="text-gray-600 mb-8">
                {slug && category 
                  ? t('categories.empty.categoryDescription', { categoryName: category.name })
                  : t('categories.empty.generalDescription')
                }
              </p>
              <Button onClick={() => window.location.href = "/api/login"}>
                {t('categories.empty.listButton')}
              </Button>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
