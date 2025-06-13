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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {imageStates.map((state, index) => {
          if (state.error) return null;
          
          return (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {state.loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}
              <img
                src={state.src}
                alt={`${businessTitle} - Photo ${index + 1}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  state.loading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}