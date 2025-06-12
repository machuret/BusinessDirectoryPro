import type { BusinessWithCategory, Category } from '@shared/schema';
import type { SiteSettingsManager } from './SiteSettingsManager';

export interface ContentGeneratorOptions {
  title?: string;
  description?: string;
  keywords?: string;
  business?: BusinessWithCategory;
  category?: Category;
  siteSettings: SiteSettingsManager;
}

export class ContentGenerator {
  private options: ContentGeneratorOptions;

  constructor(options: ContentGeneratorOptions) {
    this.options = options;
  }

  generateTitle(): string {
    const { title, business, category, siteSettings } = this.options;
    const { siteName } = siteSettings;
    
    if (title) return `${title} | ${siteName}`;
    
    if (business) {
      // Use custom SEO title if available, otherwise generate from business data
      if (business.seotitle) {
        return `${business.seotitle} | ${siteName}`;
      }
      const locationPart = business.city ? ` in ${business.city}` : '';
      const categoryPart = business.category ? ` - ${business.category.name}` : '';
      return `${business.title}${categoryPart}${locationPart} | ${siteName}`;
    }
    
    if (category) {
      return `${category.name} - Find Local Businesses | ${siteName}`;
    }
    
    return siteName;
  }

  generateDescription(): string {
    const { description, business, category, siteSettings } = this.options;
    const { siteDescription } = siteSettings;
    
    if (description) return description;
    
    if (business) {
      // Use custom SEO description if available
      if (business.seodescription) {
        return business.seodescription;
      }
      
      // Generate from business data
      const baseDesc = business.description || `${business.title} - Professional ${business.category?.name || 'business'} services`;
      const locationPart = business.city ? ` Located in ${business.city}.` : '';
      const contactPart = business.phone ? ` Contact: ${business.phone}` : '';
      return `${baseDesc}${locationPart}${contactPart}`.substring(0, 155);
    }
    
    if (category) {
      return `Find the best ${category.name.toLowerCase()} businesses in your area. Browse reviews, contact information, and more on ${siteSettings.siteName}.`;
    }
    
    return siteDescription;
  }

  generateKeywords(): string {
    const { keywords, business, category } = this.options;
    
    if (keywords) return keywords;
    
    const baseKeywords = ['business directory', 'local businesses', 'services'];
    
    if (business) {
      const businessKeywords = [
        business.title,
        business.category?.name,
        business.city,
        business.categoryname
      ].filter(Boolean);
      return [...businessKeywords, ...baseKeywords].join(', ');
    }
    
    if (category) {
      return [category.name, 'local ' + category.name.toLowerCase(), ...baseKeywords].join(', ');
    }
    
    return baseKeywords.join(', ');
  }

  generateCanonical(canonical?: string): string {
    const { business, category, siteSettings } = this.options;
    const { siteUrl } = siteSettings;
    
    if (canonical) return canonical;
    
    if (business) {
      return `${siteUrl}/business/${business.slug}`;
    }
    
    if (category) {
      return `${siteUrl}/category/${category.slug}`;
    }
    
    return siteUrl;
  }

  generateOGImage(ogImage?: string): string {
    const { business, siteSettings } = this.options;
    const { siteUrl, getSiteSetting } = siteSettings;
    
    if (ogImage) return ogImage;
    
    if (business) {
      // Try to get first business image
      try {
        const imageurls = business.imageurls;
        if (typeof imageurls === 'string') {
          const parsed = JSON.parse(imageurls);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        }
        if (Array.isArray(imageurls) && imageurls.length > 0) {
          return imageurls[0];
        }
      } catch (e) {
        // Fallback to default
      }
    }
    
    return getSiteSetting('default_og_image', `${siteUrl}/og-default.jpg`);
  }
}