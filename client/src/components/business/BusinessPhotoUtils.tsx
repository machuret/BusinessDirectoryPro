import type { BusinessWithCategory } from "@shared/schema";

// Helper function to get all business photos
export const getAllBusinessPhotos = (business: BusinessWithCategory): string[] => {
  const photos: string[] = [];
  
  // Add main business image
  if (business.imageurl) {
    photos.push(business.imageurl);
  }
  
  // Add images from imageurls array (handle both parsed arrays and JSON strings)
  if (business.imageurls) {
    let imageUrlsArray = business.imageurls;
    if (typeof business.imageurls === 'string') {
      try {
        imageUrlsArray = JSON.parse(business.imageurls);
      } catch (e) {
        console.warn('Failed to parse imageurls:', e);
        imageUrlsArray = [];
      }
    }
    if (Array.isArray(imageUrlsArray)) {
      photos.push(...imageUrlsArray.filter((url: any) => url && typeof url === 'string'));
    }
  }
  
  // Add images from images array (handle both parsed arrays and JSON strings)
  if (business.images) {
    let imagesArray = business.images;
    if (typeof business.images === 'string') {
      try {
        imagesArray = JSON.parse(business.images);
      } catch (e) {
        console.warn('Failed to parse images:', e);
        imagesArray = [];
      }
    }
    if (Array.isArray(imagesArray)) {
      photos.push(...imagesArray.filter((url: any) => url && typeof url === 'string'));
    }
  }
  
  // Remove duplicates and return
  return Array.from(new Set(photos));
};

// Helper function to get the primary business image
export const getBusinessImage = (business: BusinessWithCategory) => {
  const allPhotos = getAllBusinessPhotos(business);
  return allPhotos.length > 0 ? allPhotos[0] : null;
};