// Simple serverless function for Vercel deployment
export default function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Health check endpoint
  if (req.url === '/api/health' || req.url === '/health') {
    return res.status(200).json({
      status: 'healthy',
      message: 'Business Directory API is running on Vercel',
      timestamp: new Date().toISOString(),
      platform: 'vercel',
      url: req.url,
      method: req.method
    });
  }
  
  // Default response for all other routes
  return res.status(200).json({
    status: 'ok',
    message: 'Business Directory API - Vercel Deployment',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    note: 'API endpoints temporarily simplified for deployment'
  });
}