import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessEditor } from "@/hooks/useBusinessEditor";
import { useUserBusinesses } from "@/hooks/useUserBusinesses";
import { useContent } from "@/contexts/ContentContext";
import { LoadingState } from "@/components/loading/LoadingState";
import { Building2, Edit, Star, MapPin, Phone, Clock, Globe, Mail, Plus, Trash2, HelpCircle, Image, Upload, X, MessageSquare } from "lucide-react";
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
  
  // Custom hooks for data and business logic
  const businessData = useUserBusinesses(businesses, isLoading);
  const businessEditor = useBusinessEditor();

  if (businessData.isLoading) {
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
        {businessData.hasBusinesses ? (
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
              {businessData.businesses.map((business) => (
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
                      {businessData.getBusinessRating(business) || t("dashboard.businesses.rating.none")}
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
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <Label htmlFor="title" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {t("dashboard.businesses.form.name.label")} *
                                  </Label>
                                  <Input
                                    id="title"
                                    value={businessEditor.editForm.values.title}
                                    onChange={(e) => businessEditor.editForm.updateField("title", e.target.value)}
                                    placeholder={t("dashboard.businesses.form.name.placeholder")}
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="description">{t("dashboard.businesses.form.description.label")}</Label>
                                  <Textarea
                                    id="description"
                                    value={businessEditor.editForm.values.description}
                                    onChange={(e) => businessEditor.editForm.updateField("description", e.target.value)}
                                    placeholder={t("dashboard.businesses.form.description.placeholder")}
                                    rows={4}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="address" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {t("dashboard.businesses.form.address.label")}
                                  </Label>
                                  <Input
                                    id="address"
                                    value={businessEditor.editForm.values.address}
                                    onChange={(e) => businessEditor.editForm.updateField("address", e.target.value)}
                                    placeholder={t("dashboard.businesses.form.address.placeholder")}
                                  />
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="contact" className="space-y-4 mt-4">
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {t("dashboard.businesses.form.phone.label")}
                                  </Label>
                                  <Input
                                    id="phone"
                                    value={businessEditor.editForm.values.phone}
                                    onChange={(e) => businessEditor.editForm.updateField("phone", e.target.value)}
                                    placeholder={t("dashboard.businesses.form.phone.placeholder")}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="website" className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    {t("dashboard.businesses.form.website.label")}
                                  </Label>
                                  <Input
                                    id="website"
                                    type="url"
                                    value={businessEditor.editForm.values.website}
                                    onChange={(e) => businessEditor.editForm.updateField("website", e.target.value)}
                                    placeholder={t("dashboard.businesses.form.website.placeholder")}
                                  />
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="photos" className="space-y-4 mt-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label className="flex items-center gap-2">
                                    <Image className="h-4 w-4" />
                                    {t("dashboard.businesses.form.photos.label")}
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={businessEditor.handleFileUpload}
                                      className="hidden"
                                      id="photo-upload"
                                      disabled={businessEditor.uploadingImages}
                                    />
                                    <Label htmlFor="photo-upload" className="cursor-pointer">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={businessEditor.uploadingImages}
                                        asChild
                                      >
                                        <span>
                                          <Upload className="mr-1 h-4 w-4" />
                                          {businessEditor.uploadingImages ? "Uploading..." : "Upload Photos"}
                                        </span>
                                      </Button>
                                    </Label>
                                  </div>
                                </div>
                                
                                {businessEditor.businessImages.length > 0 && (
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {businessEditor.businessImages.map((imageUrl, index) => (
                                      <div key={index} className="relative group">
                                        <img
                                          src={imageUrl}
                                          alt={`Business photo ${index + 1}`}
                                          className="w-full h-32 object-cover rounded-lg border"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => businessEditor.removeImage(imageUrl)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {businessEditor.businessImages.length === 0 && (
                                  <p className="text-sm text-muted-foreground text-center py-8">
                                    {t("dashboard.businesses.form.photos.empty")}
                                  </p>
                                )}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="reviews" className="space-y-4 mt-4">
                              <div className="space-y-4">
                                <Label className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Customer Reviews
                                </Label>
                                
                                {businessEditor.reviewsLoading ? (
                                  <LoadingState message="Loading reviews..." />
                                ) : businessEditor.reviews.length > 0 ? (
                                  <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {businessEditor.reviews.map((review: any, index: number) => (
                                      <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className={`h-4 w-4 ${
                                                  i < (review.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                                }`}
                                              />
                                            ))}
                                          </div>
                                          <span className="text-sm font-medium">{review.author_name || 'Anonymous'}</span>
                                          <span className="text-sm text-muted-foreground">
                                            {review.relative_time_description || review.time}
                                          </span>
                                        </div>
                                        <p className="text-sm">{review.text || review.review_text}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground text-center py-8">
                                    No reviews available for this business.
                                  </p>
                                )}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="faqs" className="space-y-4 mt-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label className="flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4" />
                                    {t("dashboard.businesses.form.faqs.label")}
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={businessEditor.addFaq}
                                  >
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add FAQ
                                  </Button>
                                </div>
                                
                                {businessEditor.faqs.length > 0 ? (
                                  <div className="space-y-4">
                                    {businessEditor.faqs.map((faq, index) => (
                                      <div key={index} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium">FAQ {index + 1}</span>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => businessEditor.removeFaq(index)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <div>
                                          <Label htmlFor={`faq-question-${index}`}>Question</Label>
                                          <Input
                                            id={`faq-question-${index}`}
                                            value={faq.question}
                                            onChange={(e) => businessEditor.updateFaq(index, 'question', e.target.value)}
                                            placeholder="Enter your question..."
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor={`faq-answer-${index}`}>Answer</Label>
                                          <Textarea
                                            id={`faq-answer-${index}`}
                                            value={faq.answer}
                                            onChange={(e) => businessEditor.updateFaq(index, 'answer', e.target.value)}
                                            placeholder="Enter your answer..."
                                            rows={3}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground text-center py-8">
                                    {t("dashboard.businesses.form.faqs.empty")}
                                  </p>
                                )}
                              </div>
                            </TabsContent>
                            
                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={businessEditor.editModal.close}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={businessEditor.isUpdating}
                              >
                                {businessEditor.isUpdating ? "Updating..." : "Update Business"}
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