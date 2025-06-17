/**
 * Business Cache Module
 * Implements intelligent caching for featured businesses to reduce API response times
 */

import { type BusinessWithCategory } from "@shared/schema";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class BusinessCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  // Cache TTL configurations
  private static readonly CACHE_TTLS = {
    FEATURED_BUSINESSES: 5 * 60 * 1000, // 5 minutes
    RANDOM_BUSINESSES: 2 * 60 * 1000,   // 2 minutes
    CATEGORIES: 10 * 60 * 1000,         // 10 minutes
    BUSINESS_STATS: 15 * 60 * 1000      // 15 minutes
  };

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get cached entry if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if cache has valid entry
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      const isExpired = now - entry.timestamp > entry.ttl;
      if (isExpired) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Cache featured businesses
   */
  setFeaturedBusinesses(businesses: BusinessWithCategory[], limit: number = 10): void {
    const key = `featured_businesses_${limit}`;
    this.set(key, businesses, BusinessCache.CACHE_TTLS.FEATURED_BUSINESSES);
  }

  /**
   * Get cached featured businesses
   */
  getFeaturedBusinesses(limit: number = 10): BusinessWithCategory[] | null {
    const key = `featured_businesses_${limit}`;
    return this.get<BusinessWithCategory[]>(key);
  }

  /**
   * Cache random businesses
   */
  setRandomBusinesses(businesses: BusinessWithCategory[], limit: number = 10): void {
    const key = `random_businesses_${limit}`;
    this.set(key, businesses, BusinessCache.CACHE_TTLS.RANDOM_BUSINESSES);
  }

  /**
   * Get cached random businesses
   */
  getRandomBusinesses(limit: number = 10): BusinessWithCategory[] | null {
    const key = `random_businesses_${limit}`;
    return this.get<BusinessWithCategory[]>(key);
  }

  /**
   * Invalidate business-related caches when data changes
   */
  invalidateBusinessCaches(): void {
    // Clear all business-related caches when businesses are modified
    const businessKeys = Array.from(this.cache.keys()).filter(key => 
      key.startsWith('featured_businesses_') || 
      key.startsWith('random_businesses_')
    );
    
    businessKeys.forEach(key => this.cache.delete(key));
  }
}

// Singleton instance
export const businessCache = new BusinessCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  businessCache.cleanup();
}, 5 * 60 * 1000);

export { BusinessCache };