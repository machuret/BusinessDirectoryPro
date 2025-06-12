import type { BusinessWithCategory } from '@shared/schema';

// Utility function to extract rating data
export const extractBusinessRating = (business: BusinessWithCategory) => {
  const rating = (business as any).averagerating || (business as any).googlerating || (business as any).rating;
  const reviewCount = (business as any).totalreviews || (business as any).reviewcount || 0;
  
  return {
    rating: rating ? parseFloat(rating.toString()) : null,
    reviewCount: parseInt(reviewCount.toString()) || 0
  };
};

// Utility function to extract business images
export const extractBusinessImages = (business: BusinessWithCategory): string[] => {
  try {
    const imageurls = business.imageurls;
    if (typeof imageurls === 'string') {
      const parsed = JSON.parse(imageurls);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    }
    return Array.isArray(imageurls) ? imageurls.filter(Boolean) : [];
  } catch {
    return [];
  }
};