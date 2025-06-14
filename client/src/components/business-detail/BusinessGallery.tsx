import { useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";

interface BusinessGalleryProps {
  images: string[];
  businessTitle: string;
}

interface ImageState {
  loading: boolean;
  error: boolean;
  src: string;
}

export function BusinessGallery({ images, businessTitle }: BusinessGalleryProps) {
  const [imageStates, setImageStates] = useState<ImageState[]>(
    images.map(src => ({ loading: true, error: false, src }))
  );

  if (images.length === 0) return null;

  const handleImageLoad = (index: number) => {
    setImageStates(prev => prev.map((state, i) => 
      i === index ? { ...state, loading: false, error: false } : state
    ));
  };

  const handleImageError = (index: number) => {
    setImageStates(prev => prev.map((state, i) => 
      i === index ? { ...state, loading: false, error: true } : state
    ));
  };

  const validImages = imageStates.filter(state => !state.error);
  
  if (validImages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8 text-gray-500">
          <ImageOff className="w-12 h-12 mx-auto mb-2" />
          <p>No images available for this business</p>
        </div>
      </div>
    );
  }

  // Don't render the gallery here - it will be shown at the end of About Us section
  return null;
}