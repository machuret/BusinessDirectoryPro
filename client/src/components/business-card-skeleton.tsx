import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BusinessCardSkeletonProps {
  count?: number;
  variant?: "default" | "compact" | "wide" | "list" | "carousel";
  className?: string;
  showImage?: boolean;
  showButtons?: boolean;
  showRating?: boolean;
}

export function BusinessCardSkeleton({ 
  count = 1, 
  variant = "default",
  className,
  showImage = true,
  showButtons = true,
  showRating = true
}: BusinessCardSkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "compact":
        return {
          imageHeight: "h-24 sm:h-32",
          padding: "p-3 sm:p-4",
          titleHeight: "h-5",
          titleWidth: "w-2/3 sm:w-3/4",
          categoryWidth: "w-1/3 sm:w-1/2",
          showDescription: false,
          showFullRating: false
        };
      case "wide":
        return {
          imageHeight: "h-40 sm:h-48 lg:h-56",
          padding: "p-6 sm:p-8",
          titleHeight: "h-7",
          titleWidth: "w-3/4 sm:w-4/5",
          categoryWidth: "w-1/2 sm:w-2/3",
          showDescription: true,
          showFullRating: true
        };
      case "list":
        return {
          imageHeight: "h-20 sm:h-24 md:h-32",
          padding: "p-4 sm:p-6",
          titleHeight: "h-6",
          titleWidth: "w-3/4",
          categoryWidth: "w-1/2",
          showDescription: true,
          showFullRating: true
        };
      case "carousel":
        return {
          imageHeight: "h-32 sm:h-40",
          padding: "p-4 sm:p-5",
          titleHeight: "h-5 sm:h-6",
          titleWidth: "w-2/3 sm:w-3/4",
          categoryWidth: "w-1/3 sm:w-1/2",
          showDescription: false,
          showFullRating: false
        };
      default:
        return {
          imageHeight: "h-36 sm:h-48",
          padding: "p-4 sm:p-6",
          titleHeight: "h-6",
          titleWidth: "w-3/4",
          categoryWidth: "w-1/2",
          showDescription: true,
          showFullRating: true
        };
    }
  };

  const styles = getVariantStyles();

  const SkeletonCard = ({ index }: { index: number }) => (
    <Card key={index} className={cn(
      "overflow-hidden",
      variant === "list" ? "flex flex-col sm:flex-row" : "",
      className
    )}>
      {/* Image Section */}
      {showImage && (
        <div className={cn(
          "relative",
          variant === "list" ? "sm:w-32 md:w-40 lg:w-48 flex-shrink-0" : ""
        )}>
          <Skeleton className={cn("w-full", styles.imageHeight)} />
          {/* Featured badge skeleton - only show on larger screens for compact variants */}
          <div className={cn(
            "absolute top-2 left-2 sm:top-3 sm:left-3",
            variant === "compact" ? "hidden sm:block" : ""
          )}>
            <Skeleton className="h-5 w-12 sm:h-6 sm:w-16 rounded-full" />
          </div>
        </div>
      )}
      
      <CardContent className={cn(
        styles.padding,
        variant === "list" ? "flex-1" : ""
      )}>
        {/* Header Section */}
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <Skeleton className={cn(styles.titleHeight, styles.titleWidth, "mb-1 sm:mb-2")} />
            <Skeleton className={cn("h-3 sm:h-4", styles.categoryWidth)} />
          </div>
          <Skeleton className="h-6 w-12 sm:h-8 sm:w-16 rounded-full ml-2 sm:ml-3 flex-shrink-0" />
        </div>
        
        {/* Description - only show for non-compact variants */}
        {styles.showDescription && (
          <div className="mb-3 sm:mb-4">
            <Skeleton className="h-3 sm:h-4 w-full mb-1 sm:mb-2" />
            <Skeleton className="h-3 sm:h-4 w-2/3" />
          </div>
        )}
        
        {/* Location and Hours */}
        <div className={cn(
          "flex items-center mb-3 sm:mb-4",
          variant === "compact" ? "flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-between" : "justify-between"
        )}>
          <div className="flex items-center">
            <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <Skeleton className="h-3 w-16 sm:h-4 sm:w-24" />
          </div>
          {(variant === "default" || variant === "wide" || variant === "list") && (
            <div className="flex items-center">
              <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <Skeleton className="h-3 w-12 sm:h-4 sm:w-20" />
            </div>
          )}
        </div>
        
        {/* Rating Section */}
        {showRating && (
          <div className="flex items-center space-x-1 mb-3 sm:mb-4">
            <div className="flex space-x-1">
              {Array.from({ length: styles.showFullRating ? 5 : 3 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
              ))}
            </div>
            <Skeleton className="h-3 w-8 sm:h-4 sm:w-12 ml-2" />
          </div>
        )}
        
        {/* Action Buttons */}
        {showButtons && (
          <div className={cn(
            "flex space-x-2 sm:space-x-3",
            variant === "compact" ? "flex-col space-y-2 sm:flex-row sm:space-y-0" : ""
          )}>
            <Skeleton className={cn(
              "flex-1",
              variant === "wide" ? "h-10 sm:h-12" : "h-8 sm:h-10"
            )} />
            <Skeleton className={cn(
              variant === "wide" ? "h-10 w-10 sm:h-12 sm:w-12" : "h-8 w-8 sm:h-10 sm:w-10"
            )} />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={cn(
      "animate-pulse",
      variant === "list" ? "space-y-4" : ""
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </div>
  );
}

export default BusinessCardSkeleton;