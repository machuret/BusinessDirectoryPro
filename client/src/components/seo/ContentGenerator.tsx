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
    
    // For homepage, check for specific SEO title first
    const homepageSeoTitle = siteSettings.getSiteSetting('homepage_seo_title') || siteSettings.getSiteSetting('seo_title');
    if (homepageSeoTitle) {
      return homepageSeoTitle;
    }
    
    // Fallback to site title
    const siteTitle = siteSettings.getSiteSetting('site_title');
    if (siteTitle) {
      return siteTitle;
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
      
      // Generate comprehensive description ensuring minimum length
      let description = business.description || '';
      
      // If no custom description, generate one
      if (!description || description.length < 50) {
        const title = business.title || 'Business';
        const category = business.category?.name || 'business';
        const city = business.city || '';
        
        description = `${title} is a trusted ${category.toLowerCase()} ${city ? `in ${city}` : ''} providing professional services with a commitment to quality and customer satisfaction. `;
        
        // Add category-specific content
        if (business.category?.name) {
          description += `Our expert team specializes in ${business.category.name.toLowerCase()} services, ensuring reliable and efficient solutions for all your needs. `;
        }
        
        // Add location and contact details
        if (business.city) {
          description += `Conveniently located in ${business.city}, we serve the local community with dedication. `;
        }
        
        if (business.phone) {
          description += `Contact us at ${business.phone} for more information. `;
        }
        
        // Add rating if available
        if (business.totalscore && parseFloat(business.totalscore) > 0) {
          description += `Highly rated with ${parseFloat(business.totalscore).toFixed(1)} stars from satisfied customers.`;
        }
      }
      
      // Ensure minimum length and trim to maximum
      if (description.length < 50) {
        description += ' Visit us today to experience exceptional service and professional expertise that you can trust.';
      }
      
      return description.length > 155 ? description.substring(0, 152) + '...' : description;
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
      return `${siteUrl}/${business.slug}`;
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