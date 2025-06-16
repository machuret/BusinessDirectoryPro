import { Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "../storage";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export function setupAdminRoutes(app: Express) {
  // Get all businesses for admin
  app.get('/api/admin/businesses', async (req, res) => {
    try {
      const businesses = await storage.getBusinesses({});
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching admin businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  // Create new business
  app.post('/api/admin/businesses', async (req, res) => {
    try {
      const business = await storage.createBusiness(req.body);
      res.status(201).json(business);
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  // Update business
  app.put('/api/admin/businesses/:id', async (req, res) => {
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

  // Bulk delete businesses
  app.post('/api/admin/businesses/bulk-delete', async (req, res) => {
    try {
      const { businessIds } = req.body;
      
      if (!Array.isArray(businessIds) || businessIds.length === 0) {
        return res.status(400).json({ message: "businessIds array is required" });
      }

      let deletedCount = 0;
      const errors = [];

      for (const businessId of businessIds) {
        try {
          await storage.deleteBusiness(businessId);
          deletedCount++;
        } catch (error) {
          errors.push({ businessId, error: (error as Error).message });
        }
      }

      res.json({
        message: `${deletedCount} business(es) deleted successfully`,
        deletedCount,
        totalRequested: businessIds.length,
        errors
      });
    } catch (error) {
      console.error("Error bulk deleting businesses:", error);
      res.status(500).json({ message: "Failed to bulk delete businesses" });
    }
  });

  // Photo gallery management endpoints
  app.delete('/api/admin/businesses/:businessId/photos', async (req, res) => {
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

  app.delete('/api/admin/businesses/:businessId/photos/bulk', async (req, res) => {
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

  // Review management endpoints
  app.delete('/api/admin/reviews/:reviewId', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      await storage.deleteReview(reviewId);
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  app.delete('/api/admin/reviews/bulk', async (req, res) => {
    try {
      const { reviewIds } = req.body;
      
      if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
        return res.status(400).json({ message: "reviewIds array is required" });
      }

      let deletedCount = 0;
      for (const reviewId of reviewIds) {
        try {
          await storage.deleteReview(reviewId);
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting review ${reviewId}:`, error);
        }
      }

      res.json({ 
        message: `${deletedCount} reviews deleted successfully`,
        deletedCount 
      });
    } catch (error) {
      console.error("Error bulk deleting reviews:", error);
      res.status(500).json({ message: "Failed to bulk delete reviews" });
    }
  });

  // Categories management
  app.post("/api/admin/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.updateCategory(categoryId, req.body);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      await storage.deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // User management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const userData = req.body;
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:userId/password", async (req, res) => {
    try {
      const { userId } = req.params;
      const { password } = req.body;
      
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const hashedPassword = await hashPassword(password);
      await storage.updateUser(userId, { password: hashedPassword });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating user password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Cities management
  app.get("/api/admin/cities", async (req, res) => {
    try {
      const cities = await storage.getUniqueCities();
      
      // Transform the cities data to match the expected frontend format
      const formattedCities = cities.map(city => ({
        id: city.city.toLowerCase().replace(/\s+/g, '-'), // Generate a simple ID
        name: city.city,
        state: "", // Not available in current data
        country: "", // Not available in current data
        pageTitle: "", // Not available in current data
        businessCount: city.count,
        createdAt: new Date().toISOString() // Use current date as placeholder
      }));
      
      res.json(formattedCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  app.post("/api/admin/cities", async (req, res) => {
    try {
      const { name, city, state, country, pageTitle, pageDescription, description } = req.body;
      const cityName = name || city; // Support both field names
      
      if (!cityName) {
        return res.status(400).json({ message: "City name is required" });
      }
      
      // Create city with proper ID generation
      const cityId = cityName.toLowerCase().replace(/\s+/g, '-');
      const newCity = {
        id: cityId,
        name: cityName,
        state: state || "",
        country: country || "",
        pageTitle: pageTitle || "",
        pageDescription: pageDescription || description || "",
        businessCount: 0,
        createdAt: new Date().toISOString()
      };
      
      await storage.updateCityName(cityName, cityName, pageDescription || description);
      res.status(201).json(newCity);
    } catch (error) {
      console.error("Error adding city:", error);
      res.status(500).json({ message: "Failed to add city" });
    }
  });

  // Update city by ID (for frontend compatibility)
  app.put("/api/admin/cities/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, state, country, pageTitle, pageDescription } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "City name is required" });
      }

      // For now, we'll update based on the current name since our storage uses city names as IDs
      await storage.updateCityName(id, name, pageDescription);
      res.json({ message: "City updated successfully" });
    } catch (error) {
      console.error("Error updating city:", error);
      res.status(500).json({ message: "Failed to update city" });
    }
  });

  app.patch("/api/admin/cities/update", async (req, res) => {
    try {
      const { oldName, newName, description } = req.body;
      
      if (!oldName || !newName) {
        return res.status(400).json({ message: "Old name and new name are required" });
      }

      await storage.updateCityName(oldName, newName, description);
      res.json({ message: "City updated successfully" });
    } catch (error) {
      console.error("Error updating city:", error);
      res.status(500).json({ message: "Failed to update city" });
    }
  });

  app.delete("/api/admin/cities/:cityName", async (req, res) => {
    try {
      const { cityName } = req.params;
      const decodedCityName = decodeURIComponent(cityName);
      
      if (!decodedCityName) {
        return res.status(400).json({ message: "City name is required" });
      }

      // Delete all businesses in this city first, then remove the city
      const businesses = await storage.getBusinesses({ city: decodedCityName });
      for (const business of businesses) {
        await storage.deleteBusiness(business.placeid);
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting city:", error);
      res.status(500).json({ message: "Failed to delete city" });
    }
  });

  // Mass operations
  app.patch("/api/admin/businesses/mass-category", async (req, res) => {
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

  app.patch("/api/admin/users/mass-action", async (req, res) => {
    try {
      const { userIds, action } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "User IDs array is required" });
      }

      if (!['suspend', 'activate', 'delete'].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      for (const userId of userIds) {
        if (action === 'delete') {
          await storage.deleteUser(userId);
        } else {
          const role = action === 'suspend' ? 'suspended' : 'user';
          await storage.updateUser(userId, { role });
        }
      }

      res.json({ message: `${userIds.length} users ${action}d successfully` });
    } catch (error) {
      console.error("Error performing mass user action:", error);
      res.status(500).json({ message: "Failed to perform mass user action" });
    }
  });

  app.patch("/api/admin/users/:userId/assign-businesses", async (req, res) => {
    try {
      const { userId } = req.params;
      const { businessIds } = req.body;
      
      if (!Array.isArray(businessIds) || businessIds.length === 0) {
        return res.status(400).json({ message: "Business IDs array is required" });
      }

      for (const businessId of businessIds) {
        await storage.updateBusiness(businessId, { ownerid: userId });
      }

      res.json({ message: `${businessIds.length} businesses assigned successfully` });
    } catch (error) {
      console.error("Error assigning businesses to user:", error);
      res.status(500).json({ message: "Failed to assign businesses" });
    }
  });
}