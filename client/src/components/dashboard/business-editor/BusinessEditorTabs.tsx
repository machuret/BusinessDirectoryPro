import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useContent } from "@/contexts/ContentContext";
import { Building2, Phone, Image, MessageSquare, HelpCircle, Loader2 } from "lucide-react";
import { BusinessBasicTab } from "./BusinessBasicTab";
import { BusinessContactTab } from "./BusinessContactTab";
import { BusinessPhotosTab } from "./BusinessPhotosTab";
import { BusinessReviewsTab } from "./BusinessReviewsTab";
import { BusinessFAQsTab } from "./BusinessFAQsTab";
import type { FAQ } from "@/hooks/useBusinessEditor";
import type { Review } from "@/hooks/useBusinessReviews";

interface BusinessEditorTabsProps {
  editForm: any;
  faqs: FAQ[];
  businessImages: string[];
  uploadingImages: boolean;
  reviews: Review[];
  reviewsLoading: boolean;
  isUpdating: boolean;
  onAddFaq: () => void;
  onUpdateFaq: (index: number, field: 'question' | 'answer', value: string) => void;
  onRemoveFaq: (index: number) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (imageUrl: string) => void;
}

export function BusinessEditorTabs({
  editForm,
  faqs,
  businessImages,
  uploadingImages,
  reviews,
  reviewsLoading,
  isUpdating,
  onAddFaq,
  onUpdateFaq,
  onRemoveFaq,
  onFileUpload,
  onRemoveImage,
}: BusinessEditorTabsProps) {
  const { t } = useContent();

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="basic" className="flex items-center gap-1">
          <Building2 className="h-4 w-4" />
          {t("dashboard.businesses.tabs.basic")}
        </TabsTrigger>
        <TabsTrigger value="contact" className="flex items-center gap-1">
          <Phone className="h-4 w-4" />
          {t("dashboard.businesses.tabs.contact")}
        </TabsTrigger>
        <TabsTrigger value="photos" className="flex items-center gap-1">
          <Image className="h-4 w-4" />
          {t("dashboard.businesses.tabs.photos")}
        </TabsTrigger>
        <TabsTrigger value="reviews" className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </TabsTrigger>
        <TabsTrigger value="faqs" className="flex items-center gap-1">
          <HelpCircle className="h-4 w-4" />
          {t("dashboard.businesses.tabs.faqs")}
        </TabsTrigger>
      </TabsList>
      
      <form onSubmit={editForm.handleSubmit}>
        <TabsContent value="basic" className="space-y-4 mt-4">
          <BusinessBasicTab editForm={editForm} />
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 mt-4">
          <BusinessContactTab editForm={editForm} />
        </TabsContent>

        <TabsContent value="photos" className="space-y-4 mt-4">
          <BusinessPhotosTab
            businessImages={businessImages}
            uploadingImages={uploadingImages}
            onFileUpload={onFileUpload}
            onRemoveImage={onRemoveImage}
          />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 mt-4">
          <BusinessReviewsTab
            reviews={reviews}
            reviewsLoading={reviewsLoading}
          />
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4 mt-4">
          <BusinessFAQsTab
            faqs={faqs}
            onAddFaq={onAddFaq}
            onUpdateFaq={onUpdateFaq}
            onRemoveFaq={onRemoveFaq}
          />
        </TabsContent>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => editForm.reset()}
            disabled={isUpdating}
          >
            {t("dashboard.businesses.action.cancel")}
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("dashboard.businesses.action.save")}
          </Button>
        </div>
      </form>
    </Tabs>
  );
}