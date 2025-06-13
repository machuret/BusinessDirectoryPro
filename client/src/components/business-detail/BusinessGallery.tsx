interface BusinessGalleryProps {
  images: string[];
  businessTitle: string;
}

export function BusinessGallery({ images, businessTitle }: BusinessGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-3 gap-4">
        {images.map((image: string, index: number) => (
          <img
            key={index}
            src={image}
            alt={`${businessTitle} - Photo ${index + 2}`}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ))}
      </div>
    </div>
  );
}