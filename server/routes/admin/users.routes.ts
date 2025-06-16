import { Router } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "../../storage";

const router = Router();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// User Management Routes
// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Create new user
router.post("/", async (req, res) => {
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

// Update user
router.put("/:id", async (req, res) => {
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

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Update user password
router.patch("/:userId/password", async (req, res) => {
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

// Mass user actions
router.patch("/mass-action", async (req, res) => {
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

// Assign businesses to user
router.patch("/:userId/assign-businesses", async (req, res) => {
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

export default router;