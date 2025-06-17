import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBusinessEditor } from "@/hooks/useBusinessEditor";
import { useUserBusinesses } from "@/hooks/useUserBusinesses";
import { useContent } from "@/contexts/ContentContext";
import { LoadingState } from "@/components/loading/LoadingState";
import { BusinessBasicTab } from "./business-editor/BusinessBasicTab";
import { BusinessContactTab } from "./business-editor/BusinessContactTab";
import { BusinessPhotosTab } from "./business-editor/BusinessPhotosTab";
import { BusinessReviewsTab } from "./business-editor/BusinessReviewsTab";
import { BusinessFAQsTab } from "./business-editor/BusinessFAQsTab";
import { Building2, Edit, Star, MapPin } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessesSectionProps {
  businesses: BusinessWithCategory[];
  isLoading: boolean;
}

/**
 * BusinessesSection - Main dashboard component for business owners to manage their business listings
 * 
 * Provides a comprehensive interface for business owners to view and edit their business information,
 * including basic details, contact information, photos, reviews, and FAQs. Utilizes dedicated custom
 * hooks for data management and state handling to maintain clean separation of concerns.
 * 
 * @param businesses - Array of businesses owned by the current user with category information
 * @param isLoading - Loading state indicating whether business data is being fetched
 * 
 * @returns JSX.Element - A responsive card containing business table with edit functionality and modal dialogs
 * 
 * @example
 * // Basic usage in dashboard
 * <BusinessesSection 
 *   businesses={userBusinesses}
 *   isLoading={businessQuery.isLoading}
 * />
 */
export function BusinessesSection({ businesses, isLoading }: BusinessesSectionProps) {
  const { t } = useContent();
  const businessEditor = useBusinessEditor();

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
              {businesses
                .filter((business, index, array) => 
                  array.findIndex(b => b.placeid === business.placeid) === index
                )
                .map((business, index) => (
                <TableRow key={`dashboard-${business.placeid}-${index}`}>
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
                          onClick={() => businessEditor.handleEditBusiness(business)}
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
                        
                        <Tabs defaultValue="basic" className="w-full">
                          <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="basic">{t("dashboard.businesses.tabs.basic")}</TabsTrigger>
                            <TabsTrigger value="contact">{t("dashboard.businesses.tabs.contact")}</TabsTrigger>
                            <TabsTrigger value="photos">{t("dashboard.businesses.tabs.photos")}</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            <TabsTrigger value="faqs">{t("dashboard.businesses.tabs.faqs")}</TabsTrigger>
                          </TabsList>
                          
                          <form onSubmit={businessEditor.editForm.handleSubmit}>
                            <TabsContent value="basic" className="space-y-4 mt-4">
                              <BusinessBasicTab
                                values={{
                                  title: businessEditor.editForm.values.title,
                                  description: businessEditor.editForm.values.description,
                                  address: businessEditor.editForm.values.address,
                                }}
                                onFieldUpdate={businessEditor.editForm.updateField}
                              />
                            </TabsContent>
                            
                            <TabsContent value="contact" className="space-y-4 mt-4">
                              <BusinessContactTab
                                values={{
                                  phone: businessEditor.editForm.values.phone,
                                  website: businessEditor.editForm.values.website,
                                }}
                                onFieldUpdate={businessEditor.editForm.updateField}
                              />
                            </TabsContent>
                            
                            <TabsContent value="photos" className="space-y-4 mt-4">
                              <BusinessPhotosTab
                                businessImages={businessEditor.businessImages}
                                uploadingImages={businessEditor.uploadingImages}
                                onFileUpload={businessEditor.handleFileUpload}
                                onRemoveImage={businessEditor.removeImage}
                              />
                            </TabsContent>
                            
                            <TabsContent value="reviews" className="space-y-4 mt-4">
                              <BusinessReviewsTab
                                reviews={businessEditor.reviews}
                                isLoading={businessEditor.reviewsLoading}
                                error={businessEditor.reviewsError}
                              />
                            </TabsContent>
                            
                            <TabsContent value="faqs" className="space-y-4 mt-4">
                              <BusinessFAQsTab
                                faqs={businessEditor.faqs}
                                onAddFaq={businessEditor.addFaq}
                                onUpdateFaq={businessEditor.updateFaq}
                                onRemoveFaq={businessEditor.removeFaq}
                              />
                            </TabsContent>
                            
                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => businessEditor.editModal.close()}
                              >
                                {t("dashboard.businesses.action.cancel")}
                              </Button>
                              <Button type="submit" disabled={businessEditor.isUpdating}>
                                {businessEditor.isUpdating ? t("dashboard.businesses.action.saving") : t("dashboard.businesses.action.save")}
                              </Button>
                            </div>
                          </form>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("dashboard.businesses.empty.title")}</h3>
            <p className="text-muted-foreground mb-4">{t("dashboard.businesses.empty.description")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}