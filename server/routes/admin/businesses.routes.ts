import { Router } from "express";
import { storage } from "../../storage";
import { bulkDeleteBusinesses, validateBulkDeleteRequest, generateBulkDeleteSummary } from "../../services/business.service";

const router = Router();

// Business Management Routes
// Get all businesses for admin
router.get('/', async (req, res) => {
  try {
    const businesses = await storage.getBusinesses({});
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching admin businesses:", error);
    res.status(500).json({ message: "Failed to fetch businesses" });
  }
});

// Create new business
router.post('/', async (req, res) => {
  try {
    console.log("Creating business with data:", JSON.stringify(req.body, null, 2));
    const business = await storage.createBusiness(req.body);
    console.log("Business created successfully:", business.placeid);
    res.status(201).json(business);
  } catch (error) {
    console.error("Error creating business:", error);
    console.error("Request body was:", JSON.stringify(req.body, null, 2));
    res.status(500).json({ message: "Failed to create business", error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update business
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const business = await storage.updateBusiness(id, req.body);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(business);
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(500).json({ message: "Failed to update business" });
  }
});

// Delete single business
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteBusiness(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ message: "Failed to delete business" });
  }
});

// Bulk delete businesses
router.post('/bulk-delete', async (req, res) => {
  try {
    // Validate request data using service
    const validation = validateBulkDeleteRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    const { businessIds } = req.body;

    // Use service to perform bulk deletion
    const result = await bulkDeleteBusinesses(businessIds);

    // Generate user-friendly summary message
    const message = generateBulkDeleteSummary(result);

    res.json({
      message,
      deletedCount: result.deletedCount,
      totalRequested: result.totalRequested,
      errors: result.errors.length > 0 ? result.errors : undefined
    });
  } catch (error) {
    console.error("Error bulk deleting businesses:", error);
    res.status(500).json({ message: "Failed to bulk delete businesses" });
  }
});

// Mass update business categories
router.patch('/mass-category', async (req, res) => {
  try {
    const { businessIds, categoryId } = req.body;
    
    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return res.status(400).json({ message: "Business IDs array is required" });
    }

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    for (const businessId of businessIds) {
      await storage.updateBusiness(businessId, { categories: JSON.stringify([{ id: parseInt(categoryId) }]) });
    }

    res.json({ message: `${businessIds.length} businesses updated successfully` });
  } catch (error) {
    console.error("Error updating business categories:", error);
    res.status(500).json({ message: "Failed to update business categories" });
  }
});

// Photo Gallery Management Routes
// Delete single photo from business
router.delete('/:businessId/photos', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { photoUrl } = req.body;
    
    const business = await storage.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const photos = (business as any).images ? JSON.parse((business as any).images as string) : [];
    const updatedPhotos = photos.filter((photo: string) => photo !== photoUrl);
    
    await storage.updateBusiness(businessId, { 
      images: JSON.stringify(updatedPhotos) 
    } as any);

    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ message: "Failed to delete photo" });
  }
});

// Bulk delete photos from business
router.delete('/:businessId/photos/bulk', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { photoUrls } = req.body;
    
    const business = await storage.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const photos = (business as any).images ? JSON.parse((business as any).images as string) : [];
    const updatedPhotos = photos.filter((photo: string) => !photoUrls.includes(photo));
    
    await storage.updateBusiness(businessId, { 
      images: JSON.stringify(updatedPhotos) 
    } as any);

    res.json({ message: `${photoUrls.length} photos deleted successfully` });
  } catch (error) {
    console.error("Error bulk deleting photos:", error);
    res.status(500).json({ message: "Failed to bulk delete photos" });
  }
});

export default router;