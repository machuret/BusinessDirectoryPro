import type { BusinessWithCategory, Category } from '@shared/schema';
import type { SiteSettingsManager } from './SiteSettingsManager';

export interface SchemaGeneratorOptions {
  business?: BusinessWithCategory;
  category?: Category;
  siteSettings: SiteSettingsManager;
  pageType?: 'home' | 'business' | 'category' | 'search' | 'contact' | 'about';
}

export class SchemaGenerator {
  private options: SchemaGeneratorOptions;

  constructor(options: SchemaGeneratorOptions) {
    this.options = options;
  }

  generateLocalBusinessSchema() {
    const { business, siteSettings } = this.options;
    const { siteUrl } = siteSettings;
    
    if (!business) return null;

    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": business.title,
      "description": business.description,
      "url": `${siteUrl}/${business.slug}`,
      
      // Address information
      ...(business.address && {
        "address": {
          "@type": "PostalAddress",
          "streetAddress": business.address,
          "addressLocality": business.city,
          "addressRegion": business.state,
          "postalCode": business.postalcode,
          "addressCountry": "AU"
        }
      }),
      
      // Contact information
      ...(business.phone && { "telephone": business.phone }),
      ...((business as any).email && { "email": (business as any).email }),
      ...(business.website && { "url": business.website }),
      
      // Geographic coordinates
      ...((business as any).latitude && (business as any).longitude && {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": (business as any).latitude,
          "longitude": (business as any).longitude
        }
      }),
      
      // Business hours
      ...(business.openinghours ? {
        "openingHours": typeof business.openinghours === 'string' 
          ? business.openinghours 
          : JSON.stringify(business.openinghours)
      } : {}),
      
      // Ratings and reviews
      ...((business as any).averagerating && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": (business as any).averagerating,
          "reviewCount": (business as any).totalreviews || 0,
          "bestRating": 5,
          "worstRating": 1
        }
      }),
      
      // Business category
      ...(business.category && {
        "category": business.category.name
      }),
      
      // Images
      ...((() => {
        try {
          const imageurls = business.imageurls;
          let images: string[] = [];
          
          if (typeof imageurls === 'string') {
            const parsed = JSON.parse(imageurls);
            if (Array.isArray(parsed)) {
              images = parsed.filter(Boolean);
            }
          } else if (Array.isArray(imageurls)) {
            images = imageurls.filter(Boolean);
          }
          
          return images.length > 0 ? { "image": images } : {};
        } catch {
          return {};
        }
      })()),
      
      // Price range
      ...((business as any).pricerange && { "priceRange": (business as any).pricerange }),
      
      // Same as reference
      ...(business.website && { "sameAs": [business.website] })
    };

    return schema;
  }

  generateOrganizationSchema() {
    const { pageType, siteSettings } = this.options;
    const { siteName, siteDescription, siteUrl, getSiteSetting } = siteSettings;
    
    if (pageType !== 'home') return null;

    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": siteName,
      "description": siteDescription,
      "url": siteUrl,
      "logo": getSiteSetting('logo_url', `${siteUrl}/logo.png`),
      "sameAs": [
        getSiteSetting('facebook_url', ''),
        getSiteSetting('twitter_url', ''),
        getSiteSetting('linkedin_url', '')
      ].filter(Boolean)
    };
  }

  generateBreadcrumbSchema() {
    const { business, category, siteSettings } = this.options;
    const { siteUrl } = siteSettings;
    
    const breadcrumbs = [];
    
    // Home
    breadcrumbs.push({
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": siteUrl
    });

    if (category) {
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 2,
        "name": category.name,
        "item": `${siteUrl}/category/${category.slug}`
      });
    }

    if (business) {
      if (business.category) {
        breadcrumbs.push({
          "@type": "ListItem",
          "position": 2,
          "name": business.category.name,
          "item": `${siteUrl}/category/${business.category.slug}`
        });
      }
      
      breadcrumbs.push({
        "@type": "ListItem",
        "position": business.category ? 3 : 2,
        "name": business.title,
        "item": `${siteUrl}/${business.slug}`
      });
    }

    if (breadcrumbs.length <= 1) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs
    };
  }

  generateAllSchemas() {
    return [
      this.generateLocalBusinessSchema(),
      this.generateOrganizationSchema(),
      this.generateBreadcrumbSchema()
    ].filter(Boolean);
  }
}