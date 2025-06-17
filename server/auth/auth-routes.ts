import { Express } from "express";
import { storage } from "../storage";
import { hashPassword, comparePasswords } from "./password-utils";
import { SessionManager, performCompleteLogout } from "../session-manager";

export function setupAuthRoutes(app: Express) {
  // Registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      
      // Special case for admin users
      const adminEmails = ['admin@example.com', 'superadmin@platform.com', 'admin@test.com', 'admin@businesshub.com'];
      const isAdminEmail = adminEmails.includes(email) || email.includes('admin');
      const role = isAdminEmail ? 'admin' : 'user';
      
      const newUser = await storage.createUser({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: role,
      });

      // Set session
      (req.session as any).userId = newUser.id;
      (req.session as any).user = newUser;

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Regenerate session for security
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Login failed" });
        }

        // Set session data
        (req.session as any).userId = user.id;
        (req.session as any).user = user;

        // Debug logging for session setting
        console.log('[LOGIN] Session regenerated for user:', user.id, 'role:', user.role);
        console.log('[LOGIN] New session ID:', req.sessionID);
        console.log('[LOGIN] Session user after setting:', JSON.stringify((req.session as any).user, null, 2));

        // Save session to ensure persistence
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ message: "Login failed" });
          }

          // Remove password from response
          const { password: _, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        });
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    console.log('[LOGOUT] Starting comprehensive logout for session:', req.sessionID);
    console.log('[LOGOUT] Current user:', JSON.stringify((req.session as any)?.user, null, 2));
    
    try {
      // Perform complete logout with session manager
      await performCompleteLogout(req, res);
      
      // Clear all sessions from memory to prevent persistence issues
      SessionManager.resetAllUserSessions();
      
      console.log('[LOGOUT] Comprehensive logout completed');
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error('[LOGOUT] Complete logout failed:', error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Legacy logout endpoint for compatibility
  app.post("/api/logout", (req, res) => {
    // Clear session data first
    (req.session as any).userId = null;
    (req.session as any).user = null;
    
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      
      // Clear all possible session cookies
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax'
      });
      
      // Clear any other potential session cookies
      res.clearCookie('session');
      res.clearCookie('sessionId');
      
      res.json({ message: "Logged out successfully" });
    });
  });
}