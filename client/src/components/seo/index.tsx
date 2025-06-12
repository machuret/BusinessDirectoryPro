// Main SEO component exports
export { default as SEOHead } from '../SEOHead';

// Individual component exports for advanced usage
export { createSiteSettingsManager } from './SiteSettingsManager';
export { ContentGenerator } from './ContentGenerator';
export { SchemaGenerator } from './SchemaGenerator';
export { MetaTagUpdater } from './MetaTagUpdater';
export { extractBusinessRating, extractBusinessImages } from './BusinessUtils';

// Type exports
export type { SiteSettingsManager } from './SiteSettingsManager';
export type { ContentGeneratorOptions } from './ContentGenerator';
export type { SchemaGeneratorOptions } from './SchemaGenerator';
export type { MetaTagContent } from './MetaTagUpdater';