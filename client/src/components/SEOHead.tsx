import { useEffect } from 'react';
import type { BusinessWithCategory, Category, SiteSetting } from '@shared/schema';
import { createSiteSettingsManager } from './seo/SiteSettingsManager';
import { ContentGenerator } from './seo/ContentGenerator';
import { SchemaGenerator } from './seo/SchemaGenerator';
import { MetaTagUpdater } from './seo/MetaTagUpdater';

interface SEOHeadProps {
  // Page-specific SEO data
  title?: string;
  description?: string;
  keywords?: string;
  
  // Business-specific data (for business detail pages)
  business?: BusinessWithCategory;
  
  // Category-specific data (for category pages)
  category?: Category;
  
  // Site settings
  siteSettings?: SiteSetting[] | Record<string, any>;
  
  // Page type for schema markup
  pageType?: 'home' | 'business' | 'category' | 'search' | 'contact' | 'about';
  
  // Additional meta data
  canonical?: string;
  noindex?: boolean;
  
  // Open Graph specific
  ogImage?: string;
  ogType?: string;
}

// Re-export utility functions for backward compatibility
export { extractBusinessRating, extractBusinessImages } from './seo/BusinessUtils';

export default function SEOHead({
  title,
  description,
  keywords,
  business,
  category,
  siteSettings,
  pageType = 'home',
  canonical,
  noindex = false,
  ogImage,
  ogType = 'website'
}: SEOHeadProps) {

  // Update document head
  useEffect(() => {
    // Validate data before processing
    if (!siteSettings && !business && !category) {
      return; // Skip if no data available
    }

    // Initialize focused components
    const siteSettingsManager = createSiteSettingsManager(siteSettings);
    
    const contentGenerator = new ContentGenerator({
      title,
      description,
      keywords,
      business,
      category,
      siteSettings: siteSettingsManager
    });

    const schemaGenerator = new SchemaGenerator({
      business,
      category,
      siteSettings: siteSettingsManager,
      pageType
    });

    const metaTagUpdater = new MetaTagUpdater();

    // Generate all content
    const finalTitle = contentGenerator.generateTitle();
    const finalDescription = contentGenerator.generateDescription();
    const finalKeywords = contentGenerator.generateKeywords();
    const finalCanonical = contentGenerator.generateCanonical(canonical);
    const finalOGImage = contentGenerator.generateOGImage(ogImage);
    const schemas = schemaGenerator.generateAllSchemas();

    // Prepare meta tag content
    const metaContent = {
      title: finalTitle,
      description: finalDescription,
      keywords: finalKeywords,
      canonical: finalCanonical,
      ogImage: finalOGImage,
      ogType,
      siteName: siteSettingsManager.siteName,
      noindex
    };

    // Update all meta tags and schemas
    metaTagUpdater.updateAll(metaContent, schemas);

    // Cleanup function
    return () => {
      // Optional: cleanup meta tags when component unmounts
    };
  }, [business, category, title, description, siteSettings, pageType, canonical, noindex, ogImage, ogType]);

  return null; // This component only manages document head, no visual output
}