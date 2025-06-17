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
import { Building2, Edit, Star } from "lucide-react";
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
    
    // Parse existing images from the business data
    try {
      let images: string[] = [];
      
      if (business.imageurls) {
        if (typeof business.imageurls === 'string') {
          images = JSON.parse(business.imageurls);
        } else if (Array.isArray(business.imageurls)) {
          images = business.imageurls as string[];
        }
      } else if (business.imageurl) {
        images = [business.imageurl];
      }
      
      // Add any additional images from business fields
      const additionalImages = [];
      if (business.logo && typeof business.logo === 'string' && business.logo.startsWith('http')) {
        additionalImages.push(business.logo);
      }
      
      const allImages = [...images, ...additionalImages].filter(Boolean);
      const uniqueImages = Array.from(new Set(allImages));
      setBusinessImages(Array.isArray(uniqueImages) ? uniqueImages : []);
    } catch (error) {
      setBusinessImages([]);
    }
    
    editModal.open();
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !editingBusiness) return;

    setUploadingImages(true);
    
    try {
      console.log('Files selected for upload:', files.length, 'files');
      
      // Future Azure integration placeholder
      // import { uploadToAzure } from '@/lib/azure-storage';
      // const uploadResults = await uploadToAzure(files);
      // const newImageUrls = uploadResults.map(result => result.url);
      // setBusinessImages([...businessImages, ...newImageUrls]);
      
      alert(`Ready to upload ${files.length} photos. Azure Blob Storage integration will be configured next.`);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error: ' + (error as Error).message);
    } finally {
      setUploadingImages(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const removeImage = (imageUrl: string) => {
    setBusinessImages(businessImages.filter(url => url !== imageUrl));
  };

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
                    <Dialog open={editModal.isOpen} onOpenChange={editModal.setIsOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBusiness(business)}
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
                          
                          <form onSubmit={editForm.handleSubmit}>
                            <TabsContent value="basic" className="space-y-4 mt-4">
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <Label htmlFor="title" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {t("dashboard.businesses.form.name.label")} *
                                  </Label>
                                  <Input
                                    id="title"
                                    value={editForm.values.title}
                                    onChange={(e) => editForm.updateField("title", e.target.value)}
                                    placeholder={t("dashboard.businesses.form.name.placeholder")}
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="description">{t("dashboard.businesses.form.description.label")}</Label>
                                  <Textarea
                                    id="description"
                                    value={editForm.values.description}
                                    onChange={(e) => editForm.updateField("description", e.target.value)}
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
                                    value={editForm.values.address}
                                    onChange={(e) => editForm.updateField("address", e.target.value)}
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
                                    value={editForm.values.phone}
                                    onChange={(e) => editForm.updateField("phone", e.target.value)}
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
                                    value={editForm.values.website}
                                    onChange={(e) => editForm.updateField("website", e.target.value)}
                                    placeholder={t("dashboard.businesses.form.website.placeholder")}
                                  />
                                </div>
                                
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {t("dashboard.businesses.form.hours.title")}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {t("dashboard.businesses.form.hours.description")}
                                  </p>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="photos" className="space-y-4 mt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Image className="h-5 w-5" />
                                    {t("dashboard.businesses.photos.title")}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">{t("dashboard.businesses.photos.description")}</p>
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="file"
                                    id="photo-upload"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById('photo-upload')?.click()}
                                    disabled={uploadingImages}
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    {uploadingImages ? t("dashboard.businesses.photos.uploading") : t("dashboard.businesses.photos.upload")}
                                  </Button>
                                </div>
                              </div>
                              
                              {businessImages.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                                  <Image className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                  <h4 className="text-lg font-medium mb-2">{t("dashboard.businesses.photos.empty.title")}</h4>
                                  <p className="text-muted-foreground mb-4">{t("dashboard.businesses.photos.empty.description")}</p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('photo-upload')?.click()}
                                    disabled={uploadingImages}
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {t("dashboard.businesses.photos.empty.action")}
                                  </Button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                  {businessImages.map((imageUrl, index) => (
                                    <div key={index} className="relative group">
                                      <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                                        <img
                                          src={imageUrl}
                                          alt={`Business photo ${index + 1}`}
                                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                          onError={(e) => {
                                            e.currentTarget.src = '/placeholder-image.png';
                                          }}
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                        onClick={() => removeImage(imageUrl)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {businessImages.length > 0 && (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    {t("dashboard.businesses.photos.tips.title")}
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>{t("dashboard.businesses.photos.tips.quality")}</li>
                                    <li>{t("dashboard.businesses.photos.tips.variety")}</li>
                                    <li>{t("dashboard.businesses.photos.tips.recent")}</li>
                                    <li>{t("dashboard.businesses.photos.tips.remove")}</li>
                                  </ul>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="reviews" className="space-y-4 mt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-medium flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">Manage customer reviews and ratings</p>
                                </div>
                              </div>
                              
                              {reviewsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="text-center">
                                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2 animate-pulse" />
                                    <p className="text-muted-foreground">Loading reviews...</p>
                                  </div>
                                </div>
                              ) : reviews.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                  <h4 className="text-lg font-medium mb-2">No Reviews Yet</h4>
                                  <p className="text-muted-foreground mb-4">This business hasn't received any customer reviews yet. Reviews will appear here once customers start leaving feedback.</p>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p>• Encourage customers to leave reviews after their visit</p>
                                    <p>• Respond to reviews to build customer relationships</p>
                                    <p>• Use feedback to improve your business services</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {reviews.map((review: any, index: number) => (
                                    <Card key={review.id || index} className="p-4">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className="flex">
                                              {Array.from({ length: 5 }, (_, i) => (
                                                <Star
                                                  key={i}
                                                  className={`w-4 h-4 ${
                                                    i < (review.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                                  }`}
                                                />
                                              ))}
                                            </div>
                                            <span className="text-sm font-medium">{review.user?.firstName || review.customerName || 'Anonymous'}</span>
                                            <span className="text-xs text-muted-foreground">
                                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                                            </span>
                                          </div>
                                          {review.comment && (
                                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                                          )}
                                        </div>
                                        <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                                          {review.status || 'pending'}
                                        </Badge>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="faqs" className="space-y-4 mt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-medium flex items-center gap-2">
                                    <HelpCircle className="h-5 w-5" />
                                    {t("dashboard.businesses.faqs.title")}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">{t("dashboard.businesses.faqs.description")}</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addFaq}>
                                  <Plus className="h-4 w-4 mr-1" />
                                  {t("dashboard.businesses.faqs.add")}
                                </Button>
                              </div>
                              
                              {faqs.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                  <p className="text-muted-foreground">{t("dashboard.businesses.faqs.empty.title")}</p>
                                  <p className="text-sm text-muted-foreground">{t("dashboard.businesses.faqs.empty.description")}</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {faqs.map((faq, index) => (
                                    <Card key={index} className="p-4">
                                      <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                          <Label htmlFor={`question-${index}`} className="text-sm font-medium">
                                            {t("dashboard.businesses.faqs.question")} {index + 1}
                                          </Label>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFaq(index)}
                                            className="text-destructive hover:text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <Input
                                          id={`question-${index}`}
                                          value={faq.question}
                                          onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                          placeholder={t("dashboard.businesses.faqs.question.placeholder")}
                                        />
                                        <div>
                                          <Label htmlFor={`answer-${index}`} className="text-sm font-medium">{t("dashboard.businesses.faqs.answer")}</Label>
                                          <Textarea
                                            id={`answer-${index}`}
                                            value={faq.answer}
                                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                            placeholder={t("dashboard.businesses.faqs.answer.placeholder")}
                                            rows={2}
                                          />
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </TabsContent>

                            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={editModal.close}
                              >
                                {t("dashboard.businesses.form.cancel")}
                              </Button>
                              <Button type="submit" disabled={editForm.isSubmitting}>
                                {editForm.isSubmitting ? t("dashboard.businesses.form.updating") : t("dashboard.businesses.form.update")}
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
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">{t("dashboard.businesses.empty.title")}</h3>
            <p className="text-gray-600">{t("dashboard.businesses.empty.description")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Default export for backward compatibility
export default BusinessesSection;