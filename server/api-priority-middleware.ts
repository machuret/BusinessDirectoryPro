import { Request, Response, NextFunction } from "express";
import { ViteDevServer } from "vite";

/**
 * Creates a middleware wrapper that ensures API routes take priority over Vite's catch-all handler
 * This prevents Vite from intercepting API requests and serving HTML instead of JSON
 */
export function createApiPriorityMiddleware(viteMiddleware: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    // If this is an API request, skip Vite middleware entirely
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // For non-API requests, use Vite middleware
    return viteMiddleware(req, res, next);
  };
}

/**
 * Wraps Vite's development server to exclude API routes
 */
export function wrapViteServer(vite: ViteDevServer) {
  const originalMiddlewares = vite.middlewares;
  
  // Create a new middleware stack that filters out API requests
  const filteredMiddlewares = (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    return originalMiddlewares(req, res, next);
  };
  
  return {
    ...vite,
    middlewares: filteredMiddlewares
  };
}