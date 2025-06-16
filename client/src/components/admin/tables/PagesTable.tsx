import { useState, useMemo } from "react";
import { Search, Edit, Trash2, Eye, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  metaKeywords?: string;
  status: "draft" | "published";
  type: "page" | "blog" | "help";
  createdAt: string;
  updatedAt: string;
}

interface PagesTableProps {
  pages: Page[];
  isLoading: boolean;
  onEdit: (page: Page) => void;
  onDelete: (pageId: number) => void;
  onPreview: (page: Page) => void;
}

export default function PagesTable({
  pages,
  isLoading,
  onEdit,
  onDelete,
  onPreview
}: PagesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Filter and search pages
  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           page.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || page.status === statusFilter;
      const matchesType = typeFilter === "all" || page.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [pages, searchTerm, statusFilter, typeFilter]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "page":
        return "outline";
      case "blog":
        return "default";
      case "help":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Pages ({filteredPages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="page">Page</SelectItem>
              <SelectItem value="blog">Blog Post</SelectItem>
              <SelectItem value="help">Help Article</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading pages...
                  </TableCell>
                </TableRow>
              ) : filteredPages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {pages.length === 0 ? "No pages found." : "No pages match your filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-xs truncate">{page.title}</div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {page.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(page.type)}>
                        {page.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(page.status)}>
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPreview(page)}
                          title="Preview page"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(page)}
                          title="Edit page"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(page.id)}
                          title="Delete page"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}