import { type InsertBusiness } from "@shared/schema";

export class BusinessValidation {
  /**
   * Filter out undefined values to prevent Drizzle ORM errors
   */
  static sanitizeBusinessData(business: Partial<InsertBusiness>): any {
    const sanitized: any = {};
    Object.keys(business).forEach(key => {
      const value = (business as any)[key];
      if (value !== undefined) {
        // Skip foreign key fields if they're empty/null to avoid constraint violations
        if (key === 'ownerid' && (!value || value === '' || value === null)) {
          return; // Skip this field entirely
        }
        // Convert camelCase to lowercase for database fields
        const dbKey = key === 'createdat' ? 'createdat' : 
                     key === 'updatedat' ? 'updatedat' : key;
        sanitized[dbKey] = value;
      }
    });
    return sanitized;
  }

  /**
   * Generate SEO-friendly slug from business data
   */
  static generateSeoSlug(title: string, city?: string, categoryName?: string): string {
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);

    const cleanCity = city
      ? city.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
      : '';

    const cleanCategory = categoryName
      ? categoryName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)
      : '';

    let slug = cleanTitle;
    if (cleanCity) slug += `-${cleanCity}`;
    if (cleanCategory) slug += `-${cleanCategory}`;

    return slug.replace(/^-+|-+$/g, '');
  }

  /**
   * Generate SEO metadata for business
   */
  static generateSeoMetadata(business: any): { seotitle: string; seodescription: string } {
    const title = business.title || 'Business';
    const city = business.city || '';
    const categoryName = business.categoryname || '';
    const description = business.description || '';
    const address = business.address || '';
    const phone = business.phone || '';

    // Generate SEO title
    let seoTitle = title;
    if (city && categoryName) {
      seoTitle = `${title} - ${categoryName} in ${city}`;
    } else if (city) {
      seoTitle = `${title} - ${city}`;
    } else if (categoryName) {
      seoTitle = `${title} - ${categoryName}`;
    }

    // Ensure title is within reasonable length
    if (seoTitle.length > 60) {
      seoTitle = seoTitle.substring(0, 57) + '...';
    }

    // Generate SEO description
    let seoDescription = '';
    if (description && description.length > 20) {
      seoDescription = description.substring(0, 120);
    } else {
      // Fallback description based on available data
      const parts = [];
      if (title) parts.push(`Visit ${title}`);
      if (address) parts.push(`located at ${address}`);
      if (city) parts.push(`in ${city}`);
      if (phone) parts.push(`Call ${phone} for more information`);
      
      seoDescription = parts.join(' ').substring(0, 150);
    }

    if (seoDescription.length > 150) {
      seoDescription = seoDescription.substring(0, 147) + '...';
    }

    return {
      seotitle: seoTitle,
      seodescription: seoDescription
    };
  }

  /**
   * Validate required business fields
   */
  static validateBusinessData(business: InsertBusiness): string[] {
    const errors: string[] = [];

    if (!business.title || business.title.trim() === '') {
      errors.push('Business title is required');
    }

    if (!business.placeid || business.placeid.trim() === '') {
      errors.push('Place ID is required');
    }

    if (business.email && !this.isValidEmail(business.email)) {
      errors.push('Invalid email format');
    }

    if (business.website && !this.isValidUrl(business.website)) {
      errors.push('Invalid website URL format');
    }

    return errors;
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}