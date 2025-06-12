import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Eye, Star, Phone, Mail, Globe, MapPin } from "lucide-react";
import type { BusinessTableProps } from "../types/business-types";

export function BusinessTable({
  businesses,
  isLoading,
  selectedBusinesses,
  onSelectBusiness,
  onSelectAll,
  onEdit,
  onView,
  onDelete,
}: BusinessTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading businesses...</p>
        </div>
      </div>
    );
  }

  const allSelected = businesses.length > 0 && selectedBusinesses.length === businesses.length;
  const someSelected = selectedBusinesses.length > 0 && selectedBusinesses.length < businesses.length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((business) => (
            <TableRow key={business.placeid}>
              <TableCell>
                <Checkbox
                  checked={selectedBusinesses.includes(business.placeid)}
                  onCheckedChange={() => onSelectBusiness(business.placeid)}
                />
              </TableCell>
              <TableCell>
                <div className="font-medium">{business.title || business.name || business.businessname}</div>
                <div className="text-sm text-muted-foreground truncate max-w-xs">
                  {business.description}
                </div>
                {business.featured && (
                  <Badge variant="secondary" className="mt-1">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{business.category?.name || "Uncategorized"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm">
                  <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="truncate max-w-xs">{business.city}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate max-w-xs">
                  {business.address}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {business.phone && (
                    <div className="flex items-center text-xs">
                      <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center text-xs">
                      <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="truncate max-w-20">{business.email}</span>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center text-xs">
                      <Globe className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>Website</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    business.status === "active"
                      ? "default"
                      : business.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {business.status || "active"}
                </Badge>
                {business.verified && (
                  <Badge variant="outline" className="ml-1">
                    Verified
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="font-medium">{business.rating.toFixed(1)}</span>
                  {business.reviewCount && (
                    <span className="text-sm text-muted-foreground ml-1">
                      ({business.reviewCount})
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(business)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(business)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(business.placeid)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {businesses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No businesses found</p>
        </div>
      )}
    </div>
  );
}