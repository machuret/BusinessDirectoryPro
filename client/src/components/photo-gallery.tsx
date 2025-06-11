import { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  businessName: string;
  className?: string;
}

export default function PhotoGallery({ photos, businessName, className = "" }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  // Filter out invalid/empty URLs and ensure we have authentic photos
  const validPhotos = photos.filter(photo => 
    photo && 
    typeof photo === 'string' && 
    photo.trim() !== '' &&
    !photo.includes('unsplash.com') &&
    (photo.startsWith('http') || photo.startsWith('//'))
  );

  if (validPhotos.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedPhoto(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const goToPrevious = () => {
    if (selectedPhoto !== null) {
      setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : validPhotos.length - 1);
    }
  };

  const goToNext = () => {
    if (selectedPhoto !== null) {
      setSelectedPhoto(selectedPhoto < validPhotos.length - 1 ? selectedPhoto + 1 : 0);
    }
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold">Photos ({validPhotos.length})</h3>
        
        {/* Main photo */}
        <div className="relative">
          <img
            src={validPhotos[0]}
            alt={`${businessName} - Main photo`}
            className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openLightbox(0)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {validPhotos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              +{validPhotos.length - 1} more
            </div>
          )}
        </div>

        {/* Thumbnail grid */}
        {validPhotos.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {validPhotos.slice(1, 9).map((photo, index) => (
              <img
                key={index + 1}
                src={photo}
                alt={`${businessName} - Photo ${index + 2}`}
                className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => openLightbox(index + 1)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedPhoto !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl w-full h-full max-h-[90vh] p-0">
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <DialogClose className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
              <X className="h-4 w-4" />
            </DialogClose>
            
            {selectedPhoto !== null && (
              <>
                <img
                  src={validPhotos[selectedPhoto]}
                  alt={`${businessName} - Photo ${selectedPhoto + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = validPhotos[0]; // Fallback to first photo
                  }}
                />
                
                {validPhotos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={goToPrevious}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={goToNext}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded">
                      {selectedPhoto + 1} of {validPhotos.length}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}