import { Router } from "express";
import * as userService from "../../services/user.service";

const router = Router();

// User Management Routes
// Get all users
router.get("/", async (req, res) => {
  try {
    const { role } = req.query;
    const users = await userService.getAllUsers(role as string);
    res.json(users);
  } catch (error) {
    console.error("Error in get users route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    res.status(500).json({ message });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in get user by ID route:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    res.status(400).json({ message });
  }
});

// Create new user
router.post("/", async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error in create user route:", error);
    const message = error instanceof Error ? error.message : "Failed to create user";
    res.status(400).json({ message });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    res.json(user);
  } catch (error) {
    console.error("Error in update user route:", error);
    const message = error instanceof Error ? error.message : "Failed to update user";
    const statusCode = message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error in delete user route:", error);
    const message = error instanceof Error ? error.message : "Failed to delete user";
    const statusCode = message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});

// Update user password
router.patch("/:userId/password", async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    await userService.updateUserPassword(userId, password);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in update user password route:", error);
    const message = error instanceof Error ? error.message : "Failed to update password";
    const statusCode = message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});

// Mass user actions
router.patch("/mass-action", async (req, res) => {
  try {
    const { userIds, action } = req.body;
    
    if (!userIds || !action) {
      return res.status(400).json({ message: "User IDs and action are required" });
    }

    const result = await userService.performMassUserAction(userIds, action);
    
    if (result.failed > 0) {
      return res.status(207).json({
        message: `${result.success} users processed successfully, ${result.failed} failed`,
        success: result.success,
        failed: result.failed,
        errors: result.errors
      });
    }

    res.json({ 
      message: `${result.success} users ${action}d successfully`,
      success: result.success
    });
  } catch (error) {
    console.error("Error in mass user action route:", error);
    const message = error instanceof Error ? error.message : "Failed to perform mass user action";
    res.status(400).json({ message });
  }
});

// Assign businesses to user
router.patch("/:userId/assign-businesses", async (req, res) => {
  try {
    const { userId } = req.params;
    const { businessIds } = req.body;
    
    if (!businessIds) {
      return res.status(400).json({ message: "Business IDs are required" });
    }

    const result = await userService.assignBusinessesToUser(userId, businessIds);
    
    if (result.failed > 0) {
      return res.status(207).json({
        message: `${result.success} businesses assigned successfully, ${result.failed} failed`,
        success: result.success,
        failed: result.failed,
        errors: result.errors
      });
    }

    res.json({ 
      message: `${result.success} businesses assigned successfully`,
      success: result.success
    });
  } catch (error) {
    console.error("Error in assign businesses route:", error);
    const message = error instanceof Error ? error.message : "Failed to assign businesses";
    const statusCode = message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
});

export default router;