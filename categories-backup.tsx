/**
 * BACKUP COPY of categories.tsx - WORKING PERFECTLY
 * Created: 2025-06-17
 * Status: Production Ready
 * 
 * This is a backup copy of the working categories functionality.
 * If the main file gets corrupted, restore from this backup.
 */

/**
 * 🔒 PROTECTED FILE - DO NOT EDIT
 * 
 * This categories functionality is working perfectly and has been bulletproofed.
 * User explicitly requested protection from accidental modifications.
 * 
 * ✅ STATUS: PRODUCTION READY - WORKING PERFECTLY
 * ❌ EDITING: FORBIDDEN WITHOUT USER PERMISSION
 * 
 * If changes are needed, create new files instead of modifying this one.
 */

import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search-bar";
import { CategoryGrid } from "@/components/category-grid";
import { BusinessCard } from "@/components/business-card";
import { BusinessCardSkeleton } from "@/components/business-card-skeleton";
import { SEOHead } from "@/components/seo/seo-head";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import type { BusinessWithCategory, CategoryWithCount, Category } from "@shared/schema";

/**
 * 🔒 PROTECTED FILE - CATEGORY FILTERING WORKING PERFECTLY
 * 
 * This categories functionality is working correctly and has been bulletproofed.
 * User explicitly requested protection from accidental modifications.
 * 
 * ✅ STATUS: PRODUCTION READY - FILTERING WORKS PERFECTLY
 * ❌ EDITING: FORBIDDEN WITHOUT USER PERMISSION
 * 
 * Key working features:
 * - URL parsing with manual pathname extraction (actualSlug)
 * - Category filtering via /categories/restaurants URLs
 * - Proper API integration with backend filtering
 * - Breadcrumb navigation and conditional UI logic
 * 
 * If changes are needed, create new files instead of modifying this one.
 */

export default function Categories() {
  const { slug } = useParams();
  const [location] = useLocation();
  const { t } = useContent();
  
  // Extract category slug from URL path /categories/slug
  const pathSlug = location.split('/').pop();
  const actualSlug = pathSlug && pathSlug !== 'categories' ? pathSlug : slug;
  
  // Extract category from query parameter
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const categoryParam = urlParams.get('category');
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${actualSlug}`],
    enabled: !!actualSlug,
  });

  // Find category by name when using query parameter
  const categoryByName = categoryParam && categories?.find(cat => cat.name === categoryParam);
  const currentCategory = category || (categoryByName || undefined);

  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses", {
      categoryId: currentCategory?.id,
    }],
    enabled: !!currentCategory?.id,
  });

  const { data: allBusinesses, isLoading: allBusinessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/businesses"],
    enabled: !actualSlug,
  });

  const { data: siteSettings } = useQuery<Record<string, any>>({
    queryKey: ["/api/site-settings"],
  });

  // Handle loading state
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentBusinesses = (actualSlug || categoryParam) ? businesses : allBusinesses;
  const isLoadingBusinesses = (actualSlug || categoryParam) ? businessesLoading : allBusinessesLoading;


  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        category={category}
        siteSettings={siteSettings}
        pageType={actualSlug ? "category" : "home"}
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
              {actualSlug && category && (
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
            {actualSlug && category ? (
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
        {!actualSlug && (
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
              {actualSlug && category ? t('categories.businesses.categoryTitle', { categoryName: category.name }) : t('categories.businesses.allTitle')}
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
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <ArrowLeft className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {actualSlug && category ? t('categories.empty.categoryMessage', { categoryName: category.name }) : t('categories.empty.generalMessage')}
                </h3>
                <p className="text-gray-600 mb-6">{t('categories.empty.description')}</p>
                <Button 
                  onClick={() => window.history.back()} 
                  variant="outline"
                  className="inline-flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('categories.empty.backButton')}</span>
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}