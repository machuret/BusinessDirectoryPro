import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Upload, X } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";

interface BusinessPhotosTabProps {
  businessImages: string[];
  uploadingImages: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveImage: (imageUrl: string) => void;
}

/**
 * BusinessPhotosTab - Component for managing business photo gallery
 * 
 * Provides interface for uploading, displaying, and removing business photos.
 * Handles file upload operations with loading states and error handling.
 * Displays images in a responsive grid with hover controls for removal.
 * 
 * @param businessImages - Array of current business image URLs
 * @param uploadingImages - Loading state during photo upload operations
 * @param onFileUpload - Callback function to handle file upload events
 * @param onRemoveImage - Callback function to remove images from gallery
 * 
 * @returns JSX.Element - Photo management interface with upload and gallery display
 * 
 * @example
 * <BusinessPhotosTab 
 *   businessImages={businessEditor.businessImages}
 *   uploadingImages={businessEditor.uploadingImages}
 *   onFileUpload={businessEditor.handleFileUpload}
 *   onRemoveImage={businessEditor.removeImage}
 * />
 */
export function BusinessPhotosTab({ 
  businessImages, 
  uploadingImages, 
  onFileUpload, 
  onRemoveImage 
}: BusinessPhotosTabProps) {
  const { t } = useContent();

  return (
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
            onChange={onFileUpload}
            className="hidden"
            id="photo-upload"
            disabled={uploadingImages}
          />
          <Label htmlFor="photo-upload" className="cursor-pointer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadingImages}
              asChild
            >
              <span>
                <Upload className="mr-1 h-4 w-4" />
                {uploadingImages ? "Uploading..." : "Upload Photos"}
              </span>
            </Button>
          </Label>
        </div>
      </div>
      
      {businessImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {businessImages.map((imageUrl, index) => (
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
                onClick={() => onRemoveImage(imageUrl)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {businessImages.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("dashboard.businesses.form.photos.empty")}
        </p>
      )}
    </div>
  );
}