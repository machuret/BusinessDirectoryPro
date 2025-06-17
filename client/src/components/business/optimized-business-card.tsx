import { useState } from 'react';
import { Link } from 'wouter';
import { Heart, Star, MapPin, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useOptimisticFavorite } from '@/hooks/useOptimisticMutation';
import { useBusinessPrefetch } from '@/hooks/usePrefetch';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { cn } from '@/lib/utils';

interface Business {
  placeid: string;
  title: string;
  slug: string;
  description?: string;
  phone?: string;
  website?: string;
  address?: string;
  rating?: number;
  category?: string;
  images?: string[];
  isFavorited?: boolean;
}

interface OptimizedBusinessCardProps {
  business: Business;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

export function OptimizedBusinessCard({
  business,
  className,
  showActions = true,
  compact = false
}: OptimizedBusinessCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { trackInteraction } = usePerformanceMonitoring();
  const { prefetchBusiness, prefetchBusinessReviews, cancelPrefetch } = useBusinessPrefetch();
  const { mutateOptimistic: toggleFavorite, isOptimistic } = useOptimisticFavorite();

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Prefetch business details and reviews on hover
    prefetchBusiness(business.placeid);
    prefetchBusinessReviews(business.placeid);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    cancelPrefetch();
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startTime = performance.now();
    
    toggleFavorite({
      businessId: business.placeid,
      action: business.isFavorited ? 'remove' : 'add'
    });
    
    trackInteraction('favorite_toggle', startTime);
  };

  const handleCardClick = () => {
    const startTime = performance.now();
    trackInteraction('business_card_click', startTime);
  };

  const primaryImage = business.images?.[0];

  return (
    <div
      className={cn(
        'group relative bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/${business.slug}`}
        onClick={handleCardClick}
        className="block"
      >
        {/* Image Section */}
        <div className={cn('relative overflow-hidden', compact ? 'h-32' : 'h-48')}>
          {primaryImage ? (
            <OptimizedImage
              src={primaryImage}
              alt={business.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          
          {/* Favorite button */}
          {showActions && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'absolute top-2 right-2 w-8 h-8 p-0 bg-white/90 hover:bg-white transition-all duration-200',
                isOptimistic && 'animate-pulse'
              )}
              onClick={handleFavoriteClick}
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-colors',
                  business.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                )}
              />
            </Button>
          )}

          {/* Category badge */}
          {business.category && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-white/90 text-gray-900"
            >
              {business.category}
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <div className={cn('p-4', compact && 'p-3')}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={cn(
              'font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors',
              compact ? 'text-sm' : 'text-base'
            )}>
              {business.title}
            </h3>
            
            {business.rating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{business.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {business.description && !compact && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {business.description}
            </p>
          )}

          {business.address && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="line-clamp-1">{business.address}</span>
            </div>
          )}

          {/* Action buttons */}
          {showActions && !compact && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {business.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `tel:${business.phone}`;
                  }}
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
              )}
              
              {business.website && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(business.website, '_blank');
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Visit
                </Button>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Loading overlay for optimistic updates */}
      {isOptimistic && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] pointer-events-none" />
      )}
    </div>
  );
}