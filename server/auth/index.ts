import { Express } from "express";
import session from "express-session";
import { createSessionConfig } from "./session-config";
import { setupAuthRoutes } from "./auth-routes";
import { setupBusinessRoutes } from "./business-routes";

// Export utilities for external use
export { hashPassword, comparePasswords } from "./password-utils";

// Authentication middleware
export function isAuthenticated(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Admin authorization middleware
export async function isAdmin(req: any, res: any, next: any) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = req.session.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Authorization check failed" });
  }
}

// Main setup function
export function setupAuth(app: Express) {
  // Configure session middleware
  const sessionConfig = createSessionConfig();
  app.use(session(sessionConfig));

  // Setup authentication routes
  setupAuthRoutes(app);
  
  // Setup business-related routes that require auth
  setupBusinessRoutes(app);

  console.log("[AUTH] Authentication system initialized successfully");
}