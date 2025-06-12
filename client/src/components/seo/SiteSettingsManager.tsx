import type { SiteSetting } from '@shared/schema';

export interface SiteSettingsManager {
  getSiteSetting: (key: string, defaultValue?: string) => string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
}

export function createSiteSettingsManager(siteSettings?: SiteSetting[] | Record<string, any>): SiteSettingsManager {
  const getSiteSetting = (key: string, defaultValue: string = '') => {
    if (Array.isArray(siteSettings)) {
      const setting = siteSettings.find(s => s.key === key);
      return setting?.value || defaultValue;
    } else if (siteSettings && typeof siteSettings === 'object') {
      return (siteSettings as any)[key] || defaultValue;
    }
    return defaultValue;
  };

  return {
    getSiteSetting,
    siteName: getSiteSetting('site_name', 'Business Directory'),
    siteDescription: getSiteSetting('site_description', 'Find local businesses and services in your area'),
    siteUrl: getSiteSetting('site_url', 'https://businessdirectory.com')
  };
}