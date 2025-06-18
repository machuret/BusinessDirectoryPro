/**
 * Admin API Wrapper
 * Handles all admin API calls with deployment-specific authentication
 */

import { deploymentAuth } from './deploymentAuth';

export class AdminApi {
  private static instance: AdminApi;

  static getInstance(): AdminApi {
    if (!AdminApi.instance) {
      AdminApi.instance = new AdminApi();
    }
    return AdminApi.instance;
  }

  /**
   * Generic authenticated API request
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await deploymentAuth.authenticatedFetch(endpoint, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Admin API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Admin Business API
  async getBusinesses() {
    return this.request('/api/admin/businesses');
  }

  async createBusiness(data: any) {
    return this.request('/api/admin/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBusiness(id: string, data: any) {
    return this.request(`/api/admin/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBusiness(id: string) {
    return this.request(`/api/admin/businesses/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Users API
  async getUsers() {
    return this.request('/api/admin/users');
  }

  async createUser(data: any) {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any) {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Categories API
  async getCategories() {
    return this.request('/api/admin/categories');
  }

  async createCategory(data: any) {
    return this.request('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Reviews API
  async getReviews() {
    return this.request('/api/admin/reviews');
  }

  async updateReview(id: string, data: any) {
    return this.request(`/api/admin/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReview(id: string) {
    return this.request(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Cities API
  async getCities() {
    return this.request('/api/admin/cities');
  }

  // Admin Social Media API
  async getSocialMedia() {
    return this.request('/api/admin/social-media');
  }

  async createSocialMedia(data: any) {
    return this.request('/api/admin/social-media', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSocialMedia(id: string, data: any) {
    return this.request(`/api/admin/social-media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSocialMedia(id: string) {
    return this.request(`/api/admin/social-media/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Featured Requests API
  async getFeaturedRequests() {
    return this.request('/api/admin/featured-requests');
  }

  async approveFeaturedRequest(id: string) {
    return this.request(`/api/admin/featured-requests/${id}/approve`, {
      method: 'POST',
    });
  }

  async denyFeaturedRequest(id: string) {
    return this.request(`/api/admin/featured-requests/${id}/deny`, {
      method: 'POST',
    });
  }

  // Admin Pages API
  async getPages() {
    return this.request('/api/admin/pages');
  }

  async createPage(data: any) {
    return this.request('/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePage(id: string, data: any) {
    return this.request(`/api/admin/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePage(id: string) {
    return this.request(`/api/admin/pages/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Content Strings API
  async getContentStrings() {
    return this.request('/api/admin/content-strings');
  }

  async updateContentString(key: string, value: string) {
    return this.request('/api/admin/content-strings', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
  }

  // Admin Site Settings API
  async getSiteSettings() {
    return this.request('/api/admin/site-settings');
  }

  async updateSiteSettings(data: any) {
    return this.request('/api/admin/site-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const adminApi = AdminApi.getInstance();