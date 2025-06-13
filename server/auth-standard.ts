import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

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

export function setupStandardAuth(app: Express) {
  // Session configuration
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: 7 * 24 * 60 * 60 // 7 days
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "fallback-secret-key-for-development",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByEmail(username);
        if (!user || !user.password || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const user = await storage.upsertUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "user"
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user;
    res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
  });

  // Create default admin user if none exists
  app.post("/api/setup-admin", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if any admin user exists
      const existingAdmin = await storage.getUserByEmail(email);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const adminId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const admin = await storage.upsertUser({
        id: adminId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "admin"
      });

      res.status(201).json({ message: "Admin user created successfully", id: admin.id });
    } catch (error) {
      console.error("Admin setup error:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Middleware to check if user is admin
export function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
}