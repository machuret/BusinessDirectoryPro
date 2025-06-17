import { Button } from "@/components/ui/button";
import { useContent } from "@/contexts/ContentContext";
import { Image, Upload, X } from "lucide-react";

interface BusinessPhotosTabProps {
  businessImages: string[];
  uploadingImages: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (imageUrl: string) => void;
}

export function BusinessPhotosTab({
  businessImages,
  uploadingImages,
  onFileUpload,
  onRemoveImage,
}: BusinessPhotosTabProps) {
  const { t } = useContent();

  return (
    <div className="space-y-4">
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
            onChange={onFileUpload}
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
                onClick={() => onRemoveImage(imageUrl)}
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
    </div>
  );
}