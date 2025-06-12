import { Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "../storage";
import { isAuthenticated, isAdmin } from "../auth";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export function setupAdminRoutes(app: Express) {
  // Get all businesses for admin
  app.get('/api/admin/businesses', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const businesses = await storage.getBusinesses({});
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching admin businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  // Bulk delete businesses
  app.post('/api/admin/businesses/bulk-delete', isAuthenticated, isAdmin, async (req, res) => {
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

  // Categories management
  app.post("/api/admin/categories", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", isAuthenticated, isAdmin, async (req, res) => {
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

  app.delete("/api/admin/categories/:id", isAuthenticated, isAdmin, async (req, res) => {
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
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
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

  app.put("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
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

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:userId/password", isAuthenticated, isAdmin, async (req, res) => {
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
  app.post("/api/admin/cities", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { city, description } = req.body;
      
      if (!city) {
        return res.status(400).json({ message: "City name is required" });
      }
      
      await storage.updateCityName(city, city, description);
      res.status(201).json({ city, description, message: "City added successfully" });
    } catch (error) {
      console.error("Error adding city:", error);
      res.status(500).json({ message: "Failed to add city" });
    }
  });

  app.patch("/api/admin/cities/update", isAuthenticated, isAdmin, async (req, res) => {
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

  app.delete("/api/admin/cities/:cityName", isAuthenticated, isAdmin, async (req, res) => {
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
  app.patch("/api/admin/businesses/mass-category", isAuthenticated, isAdmin, async (req, res) => {
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

  app.patch("/api/admin/users/mass-action", isAuthenticated, isAdmin, async (req, res) => {
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

  app.patch("/api/admin/users/:userId/assign-businesses", isAuthenticated, isAdmin, async (req, res) => {
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