export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Basic routing
  const { url, method } = req;
  
  // Health check endpoint
  if (url === '/api/health' || url === '/health' || url === '/') {
    return res.status(200).json({
      status: 'healthy',
      message: 'Business Directory API running on Vercel',
      timestamp: new Date().toISOString(),
      platform: 'vercel',
      url: url,
      method: method
    });
  }
  
  // Default response for all other routes
  return res.status(200).json({
    status: 'ok',
    message: 'Business Directory API - Vercel Deployment Active',
    timestamp: new Date().toISOString(),
    url: url,
    method: method,
    note: 'Serverless function is operational'
  });
}