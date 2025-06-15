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
    throw new Error("SESSION_SECRET environment variable is required for security");
  }
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({ 
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true 
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Enable secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.replit.app' : undefined,
    },
  };

  app.use(session(sessionSettings));

  // Registration endpoint for "Add Your Business" flow
  app.post("/api/register", async (req, res) => {
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
      const newUser = await storage.createUser({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: "user",
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
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = user;

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Add auth aliases for frontend compatibility
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "user"
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

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Force session regeneration to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Login failed" });
        }

        // Set session data after regeneration
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

  function sendLogoutResponse(res: any) {
    // Clear all possible session cookies with multiple configurations
    const cookieOptions = [
      {},
      { path: '/' },
      { path: '/', httpOnly: true, secure: false, sameSite: 'lax' as const },
      { path: '/', httpOnly: true, secure: true, sameSite: 'strict' as const },
      { path: '/', domain: undefined },
    ];
    
    cookieOptions.forEach(options => {
      res.clearCookie('connect.sid', options);
    });
    
    // Clear any other potential session cookies
    ['session', 'sessionId', 'express.sid', 'sess'].forEach(cookieName => {
      res.clearCookie(cookieName);
      res.clearCookie(cookieName, { path: '/' });
    });
      
    // Force session regeneration on next request
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    console.log('[LOGOUT] Logout completed successfully');
    res.json({ message: "Logged out successfully" });
  }

  // Legacy logout endpoint for compatibility
  app.post("/api/logout", (req, res) => {
    // Clear session data first
    req.session.userId = null;
    req.session.user = null;
    
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



  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        // No authenticated user
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

  // Business submission endpoint
  app.post("/api/submit-business", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Must be logged in to submit a business" });
      }

      const { title, description, address, city, phone, email, website, hours, categoryId } = req.body;

      // Basic validation
      if (!title || !description || !address || !city || !categoryId) {
        return res.status(400).json({ 
          message: "Business name, description, address, city, and category are required" 
        });
      }

      // Create business with basic info
      const placeid = `user_submitted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      const businessData = {
        placeid,
        slug,
        title,
        description,
        address,
        city,
        phone: phone || null,
        email: email || null,
        website: website || null,
        openinghours: hours ? { general: hours } : null,
        categoryid: parseInt(categoryId),
        ownerid: userId,
        createdat: new Date(),
        updatedat: new Date(),
      };

      const newBusiness = await storage.createBusiness(businessData);
      
      res.status(201).json({ 
        message: "Business submitted successfully! It will be reviewed by our team.",
        business: newBusiness 
      });

    } catch (error: any) {
      console.error("Business submission error:", error);
      res.status(500).json({ message: "Failed to submit business" });
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
  const session = req.session as any;
  const user = session?.user;
  
  // Debug logging to understand the session state
  console.log('[ADMIN CHECK] Full session:', JSON.stringify(session, null, 2));
  console.log('[ADMIN CHECK] Session ID:', req.sessionID);
  console.log('[ADMIN CHECK] Session user:', JSON.stringify(user, null, 2));
  console.log('[ADMIN CHECK] User role:', user?.role);
  console.log('[ADMIN CHECK] User ID:', user?.id);
  
  // For demo admin user, allow access based on user ID check
  if (user && (user.role === "admin" || user.id === "demo-admin")) {
    console.log('[ADMIN CHECK] Access granted for admin user:', user.id);
    return next();
  }
  
  console.log('[ADMIN CHECK] Access denied - user:', user?.id, 'role:', user?.role);
  return res.status(403).json({ message: "Admin access required" });
}