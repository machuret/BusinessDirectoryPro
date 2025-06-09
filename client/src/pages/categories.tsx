import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BusinessCard from "@/components/business-card";
import CategoryGrid from "@/components/category-grid";
import SearchBar from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import type { BusinessWithCategory, CategoryWithCount, Category } from "@shared/schema";

export default function Categories() {
  const { slug } = useParams();
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${slug}`],
    enabled: !!slug,
  });

  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses", { categoryId: category?.id }],
    enabled: !!category?.id,
  });

  const { data: allBusinesses, isLoading: allBusinessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses"],
    enabled: !slug,
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

  if (slug && !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = "/categories"}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentBusinesses = slug ? businesses : allBusinesses;
  const isLoadingBusinesses = slug ? businessesLoading : allBusinessesLoading;

  return (
    <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-3xl font-bold text-gray-900">Business Directory</h1>
                <p className="text-gray-600 mt-2">Discover local businesses across all categories</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
              {categoriesLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-xl p-6 h-32 animate-pulse" />
                  ))}
                </div>
              ) : (
                <CategoryGrid categories={categories || []} />
              )}
            </section>
          </>
        )}

        {/* Businesses List */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {slug && category ? `${category.name} Businesses` : "All Businesses"}
              {currentBusinesses && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({currentBusinesses.length} {currentBusinesses.length === 1 ? 'business' : 'businesses'})
                </span>
              )}
            </h2>
          </div>

          {isLoadingBusinesses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded mb-4 w-2/3" />
                    <div className="h-3 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded mb-4" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : currentBusinesses && currentBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
              <p className="text-gray-600 mb-8">
                {slug && category 
                  ? `No businesses are currently listed in the ${category.name} category.`
                  : "No businesses are currently listed."
                }
              </p>
              <Button onClick={() => window.location.href = "/api/login"}>
                List Your Business
              </Button>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
