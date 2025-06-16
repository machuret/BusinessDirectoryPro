import { Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "../storage";
import { SessionManager, performCompleteLogout } from "../session-manager";

const scryptAsync = promisify(scrypt);

// Input sanitization helper
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and script content
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/&lt;script[^&]*&gt;.*?&lt;\/script&gt;/gi, '') // Remove encoded scripts
    .replace(/script/gi, '') // Remove any remaining 'script' text
    .replace(/[<>"']/g, ''); // Remove dangerous characters
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuthRoutes(app: Express) {
  // Register new user
  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Sanitize and validate inputs
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      const sanitizedFirstName = sanitizeInput(firstName);
      const sanitizedLastName = sanitizeInput(lastName);
      
      // Additional validation
      if (!isValidEmail(sanitizedEmail)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      
      if (sanitizedFirstName.length < 1 || sanitizedLastName.length < 1) {
        return res.status(400).json({ message: "First name and last name are required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(sanitizedEmail);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const hashedPassword = await hashPassword(password);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Check for admin role assignment
      const adminEmails = ['admin@businesshub.com', 'admin@businessdirectory.com', 'admin@test.com'];
      const isAdminEmail = adminEmails.includes(sanitizedEmail) || sanitizedEmail.startsWith('admin@');
      const userRole = isAdminEmail ? 'admin' : 'user';
      
      console.log(`[REGISTRATION] Email: ${sanitizedEmail}, IsAdmin: ${isAdminEmail}, Role: ${userRole}`);
      
      const user = await storage.createUser({
        id: userId,
        email: sanitizedEmail,
        password: hashedPassword,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        role: userRole
      });
      
      // Set session with complete user data
      req.session.userId = user.id;
      req.session.user = user;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login user
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Sanitize email input
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      
      // Validate email format
      if (!isValidEmail(sanitizedEmail)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const user = await storage.getUserByEmail(sanitizedEmail);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set session with complete user data
      req.session.userId = user.id;
      req.session.user = user;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout user
  app.post("/api/auth/logout", async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });


  // Get current user
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        // No authenticated user
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch("/api/auth/user", async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const updates = req.body;
      
      // Don't allow updating role through this endpoint
      delete updates.role;
      
      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Change password
  app.patch("/api/auth/change-password", async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { currentPassword, newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password if provided
      if (currentPassword && user.password) {
        const [hashed, salt] = user.password.split(".");
        const hashedBuf = Buffer.from(hashed, "hex");
        const suppliedBuf = (await scryptAsync(currentPassword, salt, 64)) as Buffer;
        
        if (!timingSafeEqual(hashedBuf, suppliedBuf)) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }
      
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
}