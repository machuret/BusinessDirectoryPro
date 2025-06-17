import { Grid, List, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessViewControlsProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  totalResults: number;
  currentPage: number;
  itemsPerPage: number;
  cityFromUrl?: string;
  categoryFromUrl?: string;
}

export function BusinessViewControls({
  viewMode,
  setViewMode,
  totalResults,
  currentPage,
  itemsPerPage,
  cityFromUrl,
  categoryFromUrl,
}: BusinessViewControlsProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalResults);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Results Info */}
        <div className="text-sm text-muted-foreground">
          {totalResults > 0 ? (
            <>
              Showing {startItem}-{endItem} of {totalResults} businesses
              {cityFromUrl && (
                <span className="flex items-center gap-1 ml-2">
                  <MapPin className="h-3 w-3" />
                  in {decodeURIComponent(cityFromUrl)}
                </span>
              )}
              {categoryFromUrl && (
                <span className="ml-2">
                  in {categoryFromUrl.replace('-', ' ')}
                </span>
              )}
            </>
          ) : (
            "No businesses found"
          )}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
        <Button
          variant={viewMode === "grid" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("grid")}
          className="h-8 w-8 p-0"
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}