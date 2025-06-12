export interface MetaTagContent {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage: string;
  ogType: string;
  siteName: string;
  noindex: boolean;
}

export class MetaTagUpdater {
  private updateMetaTag(name: string, content: string, property?: boolean) {
    if (!content || content.trim() === '') return; // Skip empty content
    
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
    
    // Only update if content has changed
    if (meta.getAttribute('content') !== content) {
      meta.setAttribute('content', content);
    }
  }

  private updateCanonicalLink(href: string) {
    let canonical_link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical_link) {
      canonical_link = document.createElement('link');
      canonical_link.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical_link);
    }
    canonical_link.setAttribute('href', href);
  }

  private updateSchemas(schemas: any[]) {
    try {
      // Only update schemas if they exist and are valid
      if (schemas.length > 0) {
        // Remove existing schema scripts to prevent duplicates
        const existingSchemas = document.querySelectorAll('script[type="application/ld+json"][id^="schema-"]');
        existingSchemas.forEach(script => script.remove());

        // Add new schema scripts with validation
        schemas.forEach((schema, index) => {
          if (schema && typeof schema === 'object') {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = `schema-${index}`;
            
            try {
              script.textContent = JSON.stringify(schema, null, 0); // Compact JSON to save space
              document.head.appendChild(script);
            } catch (jsonError) {
              console.warn(`SEO: Failed to stringify schema ${index}:`, jsonError);
            }
          }
        });
      }
    } catch (schemaError) {
      console.warn('SEO: Schema generation failed:', schemaError);
    }
  }

  updateAll(content: MetaTagContent, schemas: any[]) {
    // Validate generated content
    if (!content.title || content.title.length < 10) {
      console.warn('SEO: Generated title is too short or empty');
      return;
    }

    if (!content.description || content.description.length < 50) {
      console.warn('SEO: Generated description is too short or empty');
    }

    // Update title
    document.title = content.title;

    // Basic meta tags
    this.updateMetaTag('description', content.description);
    this.updateMetaTag('keywords', content.keywords);
    this.updateMetaTag('robots', content.noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph tags
    this.updateMetaTag('og:title', content.title, true);
    this.updateMetaTag('og:description', content.description, true);
    this.updateMetaTag('og:type', content.ogType, true);
    this.updateMetaTag('og:url', content.canonical, true);
    this.updateMetaTag('og:image', content.ogImage, true);
    this.updateMetaTag('og:site_name', content.siteName, true);

    // Twitter Card tags
    this.updateMetaTag('twitter:card', 'summary_large_image');
    this.updateMetaTag('twitter:title', content.title);
    this.updateMetaTag('twitter:description', content.description);
    this.updateMetaTag('twitter:image', content.ogImage);

    // Canonical link
    this.updateCanonicalLink(content.canonical);

    // JSON-LD Schema markup
    this.updateSchemas(schemas);
  }
}