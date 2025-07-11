import { Link } from "wouter";
import type { CategoryWithCount } from "@shared/schema";

interface CategoryGridProps {
  categories: CategoryWithCount[];
  className?: string;
}

export default function CategoryGrid({ categories, className = "" }: CategoryGridProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 ${className}`}>
      {categories.map((category) => (
        <Link key={category.id} href={`/categories/${category.slug}`}>
          <div className="group cursor-pointer">
            <div 
              className="rounded-xl p-6 text-center transition-all duration-200 transform group-hover:scale-105 border bg-card hover:bg-accent/50"
              role="button"
              aria-label={`Browse ${category.name} category with ${category.businessCount} businesses`}
            >
              <i 
                className={`${category.icon} text-3xl mb-4 text-primary`}
                aria-hidden="true"
              ></i>
              <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                {category.businessCount} {category.businessCount === 1 ? 'business' : 'businesses'}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
