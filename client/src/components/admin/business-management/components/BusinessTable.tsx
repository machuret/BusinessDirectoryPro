import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Edit, Trash2, Eye, Star, Building2, MapPin, Phone } from "lucide-react";

interface BusinessTableProps {
  businesses: any[];
  isLoading: boolean;
  onEdit: (business: any) => void;
  onView: (business: any) => void;
  onDelete: (businessId: string) => void;
  searchTerm: string;
  filterCategory: string;
  filterStatus: string;
  selectedBusinesses: string[];
  onSelectionChange: (businessId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export default function BusinessTable({
  businesses,
  isLoading,
  onEdit,
  onView,
  onDelete,
  searchTerm,
  filterCategory,
  filterStatus,
  selectedBusinesses,
  onSelectionChange,
  onSelectAll
}: BusinessTableProps) {
  const getBusinessName = (business: any) => {
    return business.title || business.businessname || business.name || "Unnamed Business";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "default";
      case "pending": return "secondary";
      case "inactive": return "destructive";
      default: return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading businesses...</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedBusinesses.length === businesses.length && businesses.length > 0}
                onCheckedChange={onSelectAll}
                aria-label="Select all businesses"
              />
            </TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((business) => (
            <TableRow key={business.placeid}>
              <TableCell>
                <Checkbox
                  checked={selectedBusinesses.includes(business.placeid)}
                  onCheckedChange={(checked) => onSelectionChange(business.placeid, checked as boolean)}
                  aria-label={`Select ${getBusinessName(business)}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {business.imageUrl ? (
                      <img 
                        src={business.imageUrl} 
                        alt={getBusinessName(business)}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {getBusinessName(business)}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {business.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {business.categoryname || "Uncategorized"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {business.city}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {business.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-1" />
                      {business.phone}
                    </div>
                  )}
                  {business.email && (
                    <div className="text-sm text-gray-500">{business.email}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(business.status)}>
                  {business.status || "active"}
                </Badge>
                {business.featured && (
                  <Badge variant="secondary" className="ml-1">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm">{business.totalscore || business.rating || 0}</span>
                  {business.reviewCount && (
                    <span className="ml-1 text-sm text-gray-500">({business.reviewCount})</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
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
          {businesses.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                {searchTerm || filterCategory !== "all" || filterStatus !== "all" 
                  ? "No businesses match your filters." 
                  : "No businesses found. Create your first business to get started."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}