import { storage } from "../storage";
import type { Page, InsertPage } from "@shared/schema";

/**
 * Page Service Layer
 * Handles business logic for page management including validation and publishing workflow
 */

/**
 * Validates page creation data
 * @param pageData - The page data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validatePageCreation(pageData: any): { isValid: boolean; error?: string } {
  if (!pageData.title || pageData.title.trim().length === 0) {
    return { isValid: false, error: "Page title is required" };
  }

  if (!pageData.slug || pageData.slug.trim().length === 0) {
    return { isValid: false, error: "Page slug is required" };
  }

  // Validate slug format (lowercase letters, numbers, hyphens only)
  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(pageData.slug)) {
    return { isValid: false, error: "Slug must contain only lowercase letters, numbers, and hyphens" };
  }

  if (!pageData.content || pageData.content.trim().length === 0) {
    return { isValid: false, error: "Page content is required" };
  }

  if (!pageData.authorId || pageData.authorId.trim().length === 0) {
    return { isValid: false, error: "Author ID is required" };
  }

  // Validate status
  const validStatuses = ['draft', 'published'];
  if (pageData.status && !validStatuses.includes(pageData.status)) {
    return { isValid: false, error: "Status must be either 'draft' or 'published'" };
  }

  return { isValid: true };
}

/**
 * Validates page update data
 * @param pageData - The page data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validatePageUpdate(pageData: any): { isValid: boolean; error?: string } {
  if (pageData.title !== undefined && pageData.title.trim().length === 0) {
    return { isValid: false, error: "Page title cannot be empty" };
  }

  if (pageData.slug !== undefined) {
    if (pageData.slug.trim().length === 0) {
      return { isValid: false, error: "Page slug cannot be empty" };
    }
    
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(pageData.slug)) {
      return { isValid: false, error: "Slug must contain only lowercase letters, numbers, and hyphens" };
    }
  }

  if (pageData.content !== undefined && pageData.content.trim().length === 0) {
    return { isValid: false, error: "Page content cannot be empty" };
  }

  // Validate status if provided
  if (pageData.status !== undefined) {
    const validStatuses = ['draft', 'published'];
    if (!validStatuses.includes(pageData.status)) {
      return { isValid: false, error: "Status must be either 'draft' or 'published'" };
    }
  }

  return { isValid: true };
}

/**
 * Creates a new page with validation
 * @param pageData - The page data including title, slug, content, and authorId
 * @returns Promise with the created page
 */
export async function createPage(pageData: any): Promise<Page> {
  console.log('[PAGE SERVICE] Creating new page:', { title: pageData.title, slug: pageData.slug, status: pageData.status });

  // Validate page creation data
  const validation = validatePageCreation(pageData);
  if (!validation.isValid) {
    console.log('[PAGE SERVICE] Page creation validation failed:', validation.error);
    throw new Error(validation.error);
  }

  try {
    // Check if slug already exists
    const existingPage = await storage.getPageBySlug(pageData.slug);
    if (existingPage) {
      throw new Error(`A page with slug "${pageData.slug}" already exists`);
    }

    // Create the page with validated data
    const insertData: InsertPage = {
      title: pageData.title.trim(),
      slug: pageData.slug.trim(),
      content: pageData.content.trim(),
      seoTitle: pageData.seoTitle?.trim() || null,
      seoDescription: pageData.seoDescription?.trim() || null,
      status: pageData.status || 'draft',
      authorId: pageData.authorId,
    };

    const page = await storage.createPage(insertData);
    console.log('[PAGE SERVICE] Successfully created page:', { id: page.id, title: page.title, status: page.status });

    return page;
  } catch (error) {
    console.error('[PAGE SERVICE] Error creating page:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to create page');
  }
}

/**
 * Updates an existing page with validation
 * @param pageId - The page ID to update
 * @param pageData - The partial page data to update
 * @returns Promise with the updated page
 */
export async function updatePage(pageId: number, pageData: any): Promise<Page> {
  console.log('[PAGE SERVICE] Updating page:', { id: pageId, updates: Object.keys(pageData) });

  // Validate page update data
  const validation = validatePageUpdate(pageData);
  if (!validation.isValid) {
    console.log('[PAGE SERVICE] Page update validation failed:', validation.error);
    throw new Error(validation.error);
  }

  try {
    // Check if page exists
    const existingPage = await storage.getPage(pageId);
    if (!existingPage) {
      throw new Error('Page not found');
    }

    // Check if slug already exists (if slug is being updated)
    if (pageData.slug && pageData.slug !== existingPage.slug) {
      const pageWithSlug = await storage.getPageBySlug(pageData.slug);
      if (pageWithSlug && pageWithSlug.id !== pageId) {
        throw new Error(`A page with slug "${pageData.slug}" already exists`);
      }
    }

    // Prepare update data
    const updateData: Partial<InsertPage> = {};
    
    if (pageData.title !== undefined) updateData.title = pageData.title.trim();
    if (pageData.slug !== undefined) updateData.slug = pageData.slug.trim();
    if (pageData.content !== undefined) updateData.content = pageData.content.trim();
    if (pageData.seoTitle !== undefined) updateData.seoTitle = pageData.seoTitle?.trim() || null;
    if (pageData.seoDescription !== undefined) updateData.seoDescription = pageData.seoDescription?.trim() || null;
    if (pageData.status !== undefined) updateData.status = pageData.status;

    const updatedPage = await storage.updatePage(pageId, updateData);
    if (!updatedPage) {
      throw new Error('Failed to update page');
    }

    console.log('[PAGE SERVICE] Successfully updated page:', { id: updatedPage.id, title: updatedPage.title, status: updatedPage.status });

    return updatedPage;
  } catch (error) {
    console.error('[PAGE SERVICE] Error updating page:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to update page');
  }
}

/**
 * Publishes a page by changing its status from 'draft' to 'published'
 * @param pageId - The page ID to publish
 * @param authorId - The author ID performing the publish action (optional, for logging)
 * @returns Promise with the published page
 */
export async function publishPage(pageId: number, authorId?: string): Promise<Page> {
  console.log('[PAGE SERVICE] Publishing page:', { id: pageId, publishedBy: authorId });

  try {
    // Check if page exists
    const existingPage = await storage.getPage(pageId);
    if (!existingPage) {
      throw new Error('Page not found');
    }

    // Check if page is already published
    if (existingPage.status === 'published') {
      console.log('[PAGE SERVICE] Page is already published:', { id: pageId, title: existingPage.title });
      return existingPage;
    }

    // Validate page is ready for publishing
    if (!existingPage.title || existingPage.title.trim().length === 0) {
      throw new Error('Cannot publish page: title is required');
    }

    if (!existingPage.content || existingPage.content.trim().length === 0) {
      throw new Error('Cannot publish page: content is required');
    }

    // Publish the page using storage method
    const publishedPage = await storage.publishPage(pageId, authorId || 'system');
    if (!publishedPage) {
      throw new Error('Failed to publish page');
    }

    console.log('[PAGE SERVICE] Successfully published page:', { 
      id: publishedPage.id, 
      title: publishedPage.title, 
      status: publishedPage.status,
      publishedAt: publishedPage.publishedAt 
    });

    return publishedPage;
  } catch (error) {
    console.error('[PAGE SERVICE] Error publishing page:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to publish page');
  }
}

/**
 * Unpublishes a page by changing its status from 'published' to 'draft'
 * @param pageId - The page ID to unpublish
 * @param authorId - The author ID performing the unpublish action (optional, for logging)
 * @returns Promise with the unpublished page
 */
export async function unpublishPage(pageId: number, authorId?: string): Promise<Page> {
  console.log('[PAGE SERVICE] Unpublishing page:', { id: pageId, unpublishedBy: authorId });

  try {
    // Check if page exists
    const existingPage = await storage.getPage(pageId);
    if (!existingPage) {
      throw new Error('Page not found');
    }

    // Check if page is already a draft
    if (existingPage.status === 'draft') {
      console.log('[PAGE SERVICE] Page is already a draft:', { id: pageId, title: existingPage.title });
      return existingPage;
    }

    // Update page status to draft
    const unpublishedPage = await storage.updatePage(pageId, { status: 'draft' });
    if (!unpublishedPage) {
      throw new Error('Failed to unpublish page');
    }

    console.log('[PAGE SERVICE] Successfully unpublished page:', { 
      id: unpublishedPage.id, 
      title: unpublishedPage.title, 
      status: unpublishedPage.status 
    });

    return unpublishedPage;
  } catch (error) {
    console.error('[PAGE SERVICE] Error unpublishing page:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to unpublish page');
  }
}

/**
 * Deletes a page with proper validation
 * @param pageId - The page ID to delete
 * @returns Promise that resolves when page is deleted
 */
export async function deletePage(pageId: number): Promise<void> {
  console.log('[PAGE SERVICE] Deleting page:', { id: pageId });

  try {
    // Check if page exists
    const existingPage = await storage.getPage(pageId);
    if (!existingPage) {
      throw new Error('Page not found');
    }

    // Additional business rules can be added here
    // For example: prevent deletion of certain system pages
    const protectedSlugs = ['home', 'about', 'contact', 'privacy', 'terms'];
    if (protectedSlugs.includes(existingPage.slug)) {
      throw new Error(`Cannot delete protected page: ${existingPage.slug}`);
    }

    await storage.deletePage(pageId);
    console.log('[PAGE SERVICE] Successfully deleted page:', { id: pageId, title: existingPage.title });

  } catch (error) {
    console.error('[PAGE SERVICE] Error deleting page:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to delete page');
  }
}

/**
 * Gets pages with optional filtering and validation
 * @param status - Optional status filter ('draft' or 'published')
 * @returns Promise with array of pages
 */
export async function getPages(status?: string): Promise<Page[]> {
  try {
    // Validate status filter if provided
    if (status && !['draft', 'published'].includes(status)) {
      throw new Error('Invalid status filter: must be "draft" or "published"');
    }

    const pages = await storage.getPages(status);
    console.log('[PAGE SERVICE] Retrieved pages:', { count: pages.length, status: status || 'all' });

    return pages;
  } catch (error) {
    console.error('[PAGE SERVICE] Error retrieving pages:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to retrieve pages');
  }
}

/**
 * Gets a single page by ID with validation
 * @param pageId - The page ID to retrieve
 * @returns Promise with the page or undefined if not found
 */
export async function getPageById(pageId: number): Promise<Page | undefined> {
  try {
    const page = await storage.getPage(pageId);
    
    if (page) {
      console.log('[PAGE SERVICE] Retrieved page by ID:', { id: page.id, title: page.title, status: page.status });
    } else {
      console.log('[PAGE SERVICE] Page not found by ID:', { id: pageId });
    }

    return page;
  } catch (error) {
    console.error('[PAGE SERVICE] Error retrieving page by ID:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to retrieve page');
  }
}

/**
 * Gets a single page by slug with validation
 * @param slug - The page slug to retrieve
 * @returns Promise with the page or undefined if not found
 */
export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  try {
    if (!slug || slug.trim().length === 0) {
      throw new Error('Page slug is required');
    }

    const page = await storage.getPageBySlug(slug.trim());
    
    if (page) {
      console.log('[PAGE SERVICE] Retrieved page by slug:', { slug: page.slug, title: page.title, status: page.status });
    } else {
      console.log('[PAGE SERVICE] Page not found by slug:', { slug });
    }

    return page;
  } catch (error) {
    console.error('[PAGE SERVICE] Error retrieving page by slug:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to retrieve page');
  }
}