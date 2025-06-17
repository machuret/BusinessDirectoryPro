import { useApiQuery } from "@/hooks/useApiQuery";
import { useContent } from "@/contexts/ContentContext";
import CategoryGrid from "@/components/category-grid";
import { SectionErrorBoundary } from "@/components/error/SectionErrorBoundary";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { CategoryWithCount } from "@shared/schema";

export default function CategoriesSection() {
  const { t } = useContent();
  
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError, 
    refetch: retryCategories 
  } = useApiQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  return (
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
  );
}