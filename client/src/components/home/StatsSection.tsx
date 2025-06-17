import { useApiQuery } from "@/hooks/useApiQuery";
import { useContent } from "@/contexts/ContentContext";
import type { CategoryWithCount } from "@shared/schema";

export default function StatsSection() {
  const { t } = useContent();
  
  const { data: categories } = useApiQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  const stats = {
    businesses: categories?.reduce((sum, cat) => sum + cat.businessCount, 0) || 0,
    reviews: t("homepage.stats.reviews.value"),
    categories: categories?.length || 0,
    cities: t("homepage.stats.cities.value"),
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">{stats.businesses.toLocaleString()}</div>
            <div className="text-gray-600">{t("homepage.stats.businesses.label")}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">{stats.reviews}</div>
            <div className="text-gray-600">{t("homepage.stats.reviews.label")}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">{stats.categories}+</div>
            <div className="text-gray-600">{t("homepage.stats.categories.label")}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">{stats.cities}</div>
            <div className="text-gray-600">{t("homepage.stats.cities.label")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}