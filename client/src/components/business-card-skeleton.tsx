import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BusinessCardSkeletonProps {
  count?: number;
  variant?: "default" | "compact" | "wide";
  className?: string;
}

export function BusinessCardSkeleton({ 
  count = 1, 
  variant = "default",
  className 
}: BusinessCardSkeletonProps) {
  const getImageHeight = () => {
    switch (variant) {
      case "compact": return "h-32";
      case "wide": return "h-40";
      default: return "h-48";
    }
  };

  const getPadding = () => {
    switch (variant) {
      case "compact": return "p-4";
      case "wide": return "p-8";
      default: return "p-6";
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={cn("overflow-hidden animate-pulse", className)}>
          <div className="relative">
            <Skeleton className={cn("w-full", getImageHeight())} />
            {/* Featured badge skeleton */}
            <div className="absolute top-3 left-3">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
          
          <CardContent className={getPadding()}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Skeleton className={cn("h-6 mb-2", variant === "compact" ? "w-2/3" : "w-3/4")} />
                <Skeleton className={cn("h-4", variant === "compact" ? "w-1/3" : "w-1/2")} />
              </div>
              <Skeleton className="h-8 w-16 rounded-full ml-3 flex-shrink-0" />
            </div>
            
            {variant !== "compact" && (
              <>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
              </>
            )}
            
            <div className={cn("flex items-center mb-4", variant === "compact" ? "justify-between" : "justify-between")}>
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-1" />
                <Skeleton className={cn("h-4", variant === "compact" ? "w-16" : "w-24")} />
              </div>
              {variant !== "compact" && (
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1 mb-4">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-4 rounded" />
                ))}
              </div>
              <Skeleton className={cn("h-4 ml-2", variant === "compact" ? "w-16" : "w-20")} />
            </div>
            
            <div className="flex space-x-3">
              <Skeleton className={cn("h-10 flex-1", variant === "wide" ? "h-12" : "")} />
              <Skeleton className={cn("h-10 w-10", variant === "wide" ? "h-12 w-12" : "")} />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default BusinessCardSkeleton;