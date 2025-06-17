import BusinessCard from "@/components/business-card-enhanced";
import { Skeleton } from "@/components/ui/skeleton";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessGridProps {
  businesses: BusinessWithCategory[];
  isLoading: boolean;
  viewMode: "grid" | "list";
}

export function BusinessGrid({ businesses, isLoading, viewMode }: BusinessGridProps) {
  if (isLoading) {
    return (
      <div className={`
        ${viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
        }
      `}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">No businesses found</div>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search criteria or browse all businesses.
        </p>
      </div>
    );
  }

  return (
    <div className={`
      ${viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
        : "space-y-4"
      }
    `}>
      {businesses.map((business) => (
        <BusinessCard
          key={business.placeid}
          business={business}
          variant={viewMode === "list" ? "search" : "default"}
        />
      ))}
    </div>
  );
}