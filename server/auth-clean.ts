import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { SessionManager, performCompleteLogout } from "./session-manager";

const scryptAsync = promisify(scrypt);

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

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  
  // Validate required environment variables
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  const sessionConfig: session.SessionOptions = {
    store: new PostgresSessionStore({
      pool: pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    },
    name: 'connect.sid'
  };

  app.use(session(sessionConfig));

  // Registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Generate unique user ID
      const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: "user"
      });

      // Clear any existing sessions and create new one
      SessionManager.resetAllUserSessions();
      
      // Regenerate session to get a new session ID
      req.session.regenerate((err: any) => {
        if (err) {
          console.error('[REGISTER] Session regeneration error:', err);
          return res.status(500).json({ message: "Registration failed" });
        }

        console.log('[REGISTER] Session regenerated successfully. New session ID:', req.sessionID);
        console.log('[REGISTER] Previous sessions cleared to prevent conflicts');
        
        // Set user data in the new session
        (req.session as any).userId = user.id;
        (req.session as any).user = user;

        console.log('[REGISTER] User registered and logged in:', user.email);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
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

      console.log('[LOGIN] Attempting login for:', email);

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        console.log('[LOGIN] User not found or no password:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await comparePasswords(password, user.password);
      if (!validPassword) {
        console.log('[LOGIN] Invalid password for:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log('[LOGIN] Valid credentials for:', email);

      // Clear any existing session data first
      SessionManager.resetAllUserSessions();
      
      // Regenerate session to get a new session ID
      req.session.regenerate((err: any) => {
        if (err) {
          console.error('[LOGIN] Session regeneration error:', err);
          return res.status(500).json({ message: "Login failed" });
        }

        console.log('[LOGIN] Session regenerated successfully. New session ID:', req.sessionID);
        console.log('[LOGIN] Previous sessions cleared to prevent conflicts');
        
        // Set user data in the new session
        (req.session as any).userId = user.id;
        (req.session as any).user = user;

        console.log('[LOGIN] User logged in successfully:', user.email);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
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

  // Get current user endpoint - NO FALLBACK USER
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        // No authenticated user - return 401 instead of fallback
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

  // Legacy endpoints for compatibility
  app.get("/api/user", async (req, res) => {
    // Redirect to new endpoint
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/logout", async (req, res) => {
    // Redirect to new logout endpoint
    try {
      await performCompleteLogout(req, res);
      SessionManager.resetAllUserSessions();
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error('[LEGACY LOGOUT] Failed:', error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  console.log('[AUTH CHECK] Session ID:', req.sessionID);
  console.log('[AUTH CHECK] User ID in session:', (req.session as any)?.userId);
  
  if ((req.session as any)?.userId) {
    console.log('[AUTH CHECK] User authenticated');
    return next();
  }
  
  console.log('[AUTH CHECK] User not authenticated');
  return res.status(401).json({ message: "Authentication required" });
}

export function isAdmin(req: any, res: any, next: any) {
  const user = (req.session as any)?.user;
  console.log('[ADMIN CHECK] User role:', user?.role);
  
  if (user?.role === "admin") {
    console.log('[ADMIN CHECK] Admin access granted');
    return next();
  }
  
  console.log('[ADMIN CHECK] Admin access denied');
  return res.status(403).json({ message: "Admin access required" });
}