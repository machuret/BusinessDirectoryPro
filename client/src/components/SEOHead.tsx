import { useEffect } from 'react';
import type { BusinessWithCategory, Category, SiteSetting } from '@shared/schema';

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
  
  // Get site settings values
  const getSiteSetting = (key: string, defaultValue: string = '') => {
    if (Array.isArray(siteSettings)) {
      const setting = siteSettings.find(s => s.key === key);
      return setting?.value || defaultValue;
    } else if (siteSettings && typeof siteSettings === 'object') {
      return (siteSettings as any)[key] || defaultValue;
    }
    return defaultValue;
  };

  const siteName = getSiteSetting('site_name', 'Business Directory');
  const siteDescription = getSiteSetting('site_description', 'Find local businesses and services in your area');
  const siteUrl = getSiteSetting('site_url', 'https://businessdirectory.com');

  // Generate dynamic title
  const generateTitle = (): string => {
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
  };

  // Generate dynamic description
  const generateDescription = (): string => {
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
      return `Find the best ${category.name.toLowerCase()} businesses in your area. Browse reviews, contact information, and more on ${siteName}.`;
    }
    
    return siteDescription;
  };

  // Generate keywords
  const generateKeywords = (): string => {
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
  };

  // Generate canonical URL
  const generateCanonical = (): string => {
    if (canonical) return canonical;
    
    if (business) {
      return `${siteUrl}/business/${business.slug}`;
    }
    
    if (category) {
      return `${siteUrl}/category/${category.slug}`;
    }
    
    return siteUrl;
  };

  // Generate Open Graph image
  const generateOGImage = (): string => {
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
  };

  // Generate Local Business Schema
  const generateLocalBusinessSchema = () => {
    if (!business) return null;

    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": business.title,
      "description": business.description,
      "url": `${siteUrl}/business/${business.slug}`,
      
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
  };

  // Generate Organization Schema (for home page)
  const generateOrganizationSchema = () => {
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
  };

  // Generate BreadcrumbList Schema
  const generateBreadcrumbSchema = () => {
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
        "item": `${siteUrl}/business/${business.slug}`
      });
    }

    if (breadcrumbs.length <= 1) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs
    };
  };

  // Update document head
  useEffect(() => {
    const finalTitle = generateTitle();
    const finalDescription = generateDescription();
    const finalKeywords = generateKeywords();
    const finalCanonical = generateCanonical();
    const finalOGImage = generateOGImage();

    // Update title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph tags
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:url', finalCanonical, true);
    updateMetaTag('og:image', finalOGImage, true);
    updateMetaTag('og:site_name', siteName, true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalOGImage);

    // Canonical link
    let canonical_link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical_link) {
      canonical_link = document.createElement('link');
      canonical_link.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical_link);
    }
    canonical_link.setAttribute('href', finalCanonical);

    // JSON-LD Schema markup
    const schemas = [
      generateLocalBusinessSchema(),
      generateOrganizationSchema(),
      generateBreadcrumbSchema()
    ].filter(Boolean);

    // Remove existing schema scripts
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    existingSchemas.forEach(script => script.remove());

    // Add new schema scripts
    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema, null, 2);
      script.id = `schema-${index}`;
      document.head.appendChild(script);
    });

    // Cleanup function
    return () => {
      // Optional: cleanup meta tags when component unmounts
    };
  }, [business, category, title, description, siteSettings, pageType]);

  return null; // This component only manages document head, no visual output
}

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