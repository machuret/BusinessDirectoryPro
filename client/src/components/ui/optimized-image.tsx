import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  sizes = '100vw',
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Generate responsive srcSet for modern formats
  const generateSrcSet = (baseSrc: string) => {
    const extensions = ['webp', 'jpg'];
    const sizes = [400, 800, 1200, 1600];
    
    return extensions.map(ext => {
      const srcSet = sizes.map(size => 
        `${baseSrc.replace(/\.[^.]+$/, '')}_${size}w.${ext} ${size}w`
      ).join(', ');
      return { type: `image/${ext}`, srcSet };
    });
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Set current src when in view
  useEffect(() => {
    if (isInView) {
      setCurrentSrc(src);
    }
  }, [isInView, src]);

  // Fallback placeholder
  const PlaceholderDiv = () => (
    <div
      className={cn(
        'bg-muted animate-pulse flex items-center justify-center',
        className
      )}
      style={{ width, height }}
    >
      <svg
        className="w-8 h-8 text-muted-foreground"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  // Error state
  if (hasError) {
    return <PlaceholderDiv />;
  }

  // Not in view yet
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn('bg-muted', className)}
        style={{ width, height }}
      />
    );
  }

  return (
    <picture className="relative inline-block">
      {/* Modern format sources */}
      {generateSrcSet(src).map((source, index) => (
        <source
          key={index}
          type={source.type}
          srcSet={source.srcSet}
          sizes={sizes}
        />
      ))}
      
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          placeholder === 'blur' && !isLoaded && 'blur-sm',
          className
        )}

        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <div
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            isLoaded && 'hidden'
          )}
        />
      )}
    </picture>
  );
}