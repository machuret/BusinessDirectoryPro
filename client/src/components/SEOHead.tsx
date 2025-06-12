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

    // Inject custom head code from site settings
    const customHeadCode = siteSettingsManager.getSiteSetting('custom_head_code');
    const googleAnalytics = siteSettingsManager.getSiteSetting('google_analytics');
    const googleTagManager = siteSettingsManager.getSiteSetting('google_tag_manager');
    const facebookPixel = siteSettingsManager.getSiteSetting('facebook_pixel');

    // Remove existing custom scripts
    const existingCustomScripts = document.querySelectorAll('script[data-seo-custom]');
    existingCustomScripts.forEach(script => script.remove());

    // Inject Google Analytics
    if (googleAnalytics && googleAnalytics.trim()) {
      const gaScript = document.createElement('div');
      gaScript.innerHTML = googleAnalytics;
      gaScript.setAttribute('data-seo-custom', 'google-analytics');
      Array.from(gaScript.children).forEach(child => {
        document.head.appendChild(child);
      });
    }

    // Inject Google Tag Manager
    if (googleTagManager && googleTagManager.trim()) {
      const gtmScript = document.createElement('div');
      gtmScript.innerHTML = googleTagManager;
      gtmScript.setAttribute('data-seo-custom', 'google-tag-manager');
      Array.from(gtmScript.children).forEach(child => {
        document.head.appendChild(child);
      });
    }

    // Inject Facebook Pixel
    if (facebookPixel && facebookPixel.trim()) {
      const fbScript = document.createElement('div');
      fbScript.innerHTML = facebookPixel;
      fbScript.setAttribute('data-seo-custom', 'facebook-pixel');
      Array.from(fbScript.children).forEach(child => {
        document.head.appendChild(child);
      });
    }

    // Inject custom head code
    if (customHeadCode && customHeadCode.trim()) {
      const customScript = document.createElement('div');
      customScript.innerHTML = customHeadCode;
      customScript.setAttribute('data-seo-custom', 'custom-head');
      Array.from(customScript.children).forEach(child => {
        document.head.appendChild(child);
      });
    }

    // Cleanup function
    return () => {
      // Remove custom scripts when component unmounts
      const customScripts = document.querySelectorAll('script[data-seo-custom]');
      customScripts.forEach(script => script.remove());
    };
  }, [business, category, title, description, siteSettings, pageType, canonical, noindex, ogImage, ogType]);

  return null; // This component only manages document head, no visual output
}