import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useContent } from "@/contexts/ContentContext";
import { LoadingState } from "@/components/loading/LoadingState";
import { useBusinessEditor } from "@/hooks/useBusinessEditor";
import { useBusinessReviews } from "@/hooks/useBusinessReviews";
import { Building2, Edit, Star, MapPin } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

// Import UI components for the editor
import { BusinessBasicTab } from "./business-editor/BusinessBasicTab";
import { BusinessContactTab } from "./business-editor/BusinessContactTab";
import { BusinessPhotosTab } from "./business-editor/BusinessPhotosTab";
import { BusinessReviewsTab } from "./business-editor/BusinessReviewsTab";
import { BusinessFAQsTab } from "./business-editor/BusinessFAQsTab";
import { BusinessEditorTabs } from "./business-editor/BusinessEditorTabs";

interface BusinessesSectionProps {
  businesses: BusinessWithCategory[];
  isLoading: boolean;
}

export function BusinessesSection({ businesses, isLoading }: BusinessesSectionProps) {
  const { t } = useContent();
  const businessEditor = useBusinessEditor();
  
  // Fetch reviews for the currently editing business
  const { data: reviews = [], isLoading: reviewsLoading } = useBusinessReviews(
    businessEditor.editingBusiness?.placeid || null,
    !!businessEditor.editingBusiness
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            {t("dashboard.businesses.title")}
          </CardTitle>
          <CardDescription>{t("dashboard.businesses.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingState message={t("dashboard.businesses.loading")} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="mr-2 h-5 w-5" />
          {t("dashboard.businesses.title")}
        </CardTitle>
        <CardDescription>{t("dashboard.businesses.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {businesses && businesses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.businesses.table.name")}</TableHead>
                <TableHead>{t("dashboard.businesses.table.location")}</TableHead>
                <TableHead>{t("dashboard.businesses.table.rating")}</TableHead>
                <TableHead>{t("dashboard.businesses.table.status")}</TableHead>
                <TableHead>{t("dashboard.businesses.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => (
                <TableRow key={business.placeid}>
                  <TableCell className="font-medium">{business.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {business.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 text-yellow-500" />
                      {(business as any).averagerating || t("dashboard.businesses.rating.none")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={business.featured ? "default" : "secondary"}>
                      {business.featured ? t("dashboard.businesses.status.featured") : t("dashboard.businesses.status.standard")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={businessEditor.editModal.isOpen} onOpenChange={businessEditor.editModal.setIsOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => businessEditor.openEditor(business)}
                          aria-label={`${t("dashboard.businesses.action.edit")} ${business.title}`}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          {t("dashboard.businesses.action.edit")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {t("dashboard.businesses.edit.title")}: {business.title}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <BusinessEditorTabs
                          editForm={businessEditor.editForm}
                          faqs={businessEditor.faqs}
                          businessImages={businessEditor.businessImages}
                          uploadingImages={businessEditor.uploadingImages}
                          reviews={reviews}
                          reviewsLoading={reviewsLoading}
                          isUpdating={businessEditor.isUpdating}
                          onAddFaq={businessEditor.addFaq}
                          onUpdateFaq={businessEditor.updateFaq}
                          onRemoveFaq={businessEditor.removeFaq}
                          onFileUpload={businessEditor.handleFileUpload}
                          onRemoveImage={businessEditor.removeImage}
                        />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("dashboard.businesses.empty.title")}</h3>
            <p className="text-muted-foreground">{t("dashboard.businesses.empty.description")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}