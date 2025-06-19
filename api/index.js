// Vercel serverless function for Business Directory API
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  const path = url.replace('/api', '');

  // Sample data
  const businesses = [
    {
      placeid: 'ChIJdRBTL1FYkWsRruDMKlIMc6s',
      businessname: 'Sydney Dental Care',
      category: 'dentist',
      city: 'Sydney',
      address: '123 George Street, Sydney NSW 2000',
      phone: '+61 2 9555 0123',
      status: 'active',
      featured: true,
      rating: 4.8,
      reviewCount: 127
    },
    {
      placeid: 'ChIJBddmiaxbkWsRP8_c6zKVvHo',
      businessname: 'Melbourne Restaurant Hub',
      category: 'restaurant',
      city: 'Melbourne',
      address: '456 Collins Street, Melbourne VIC 3000',
      phone: '+61 3 9555 0456',
      status: 'active',
      featured: false,
      rating: 4.6,
      reviewCount: 89
    },
    {
      placeid: 'ChIJZ1C8vutYkWsRD4T4Jv2k7Ao',
      businessname: 'Brisbane Tech Solutions',
      category: 'technology',
      city: 'Brisbane',
      address: '789 Queen Street, Brisbane QLD 4000',
      phone: '+61 7 3555 0789',
      status: 'active',
      featured: true,
      rating: 4.9,
      reviewCount: 156
    }
  ];

  const categories = [
    { id: 1, name: 'Restaurant', slug: 'restaurant' },
    { id: 4, name: 'Technology', slug: 'technology' },
    { id: 13, name: 'Dentist', slug: 'dentist' }
  ];

  // Route handling
  if (path === '/health' && method === 'GET') {
    return res.json({
      status: 'healthy',
      message: 'Business Directory API running on Vercel',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/health',
        'GET /api/businesses',
        'GET /api/businesses/featured',
        'GET /api/categories',
        'POST /api/auth/login',
        'GET /api/auth/user',
        'POST /api/admin/businesses/bulk-delete'
      ]
    });
  }

  if (path === '/businesses' && method === 'GET') {
    return res.json(businesses);
  }

  if (path === '/businesses/featured' && method === 'GET') {
    return res.json(businesses.filter(b => b.featured));
  }

  if (path === '/businesses/random' && method === 'GET') {
    const shuffled = [...businesses].sort(() => Math.random() - 0.5);
    return res.json(shuffled.slice(0, 9));
  }

  if (path === '/categories' && method === 'GET') {
    return res.json(categories);
  }

  if (path === '/auth/login' && method === 'POST') {
    const { email, password } = req.body || {};
    
    if (email === 'admin@businesshub.com' && password === 'Xola2025') {
      return res.json({
        id: 'admin-1',
        email: 'admin@businesshub.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (path === '/auth/user' && method === 'GET') {
    // In a real app, check session/token
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (path === '/admin/businesses' && method === 'GET') {
    return res.json(businesses);
  }

  if (path === '/admin/businesses/bulk-delete' && method === 'POST') {
    const { businessIds } = req.body || {};
    
    if (!Array.isArray(businessIds)) {
      return res.status(400).json({ message: 'businessIds must be an array' });
    }
    
    return res.json({
      message: `Would delete ${businessIds.length} businesses`,
      deletedCount: businessIds.length,
      totalRequested: businessIds.length
    });
  }

  // Default response
  if (path === '/' || path === '') {
    return res.json({
      message: 'Business Directory API',
      version: '1.0.0',
      status: 'running',
      available_endpoints: [
        'GET /api/health',
        'GET /api/businesses', 
        'GET /api/businesses/featured',
        'GET /api/categories',
        'POST /api/auth/login'
      ]
    });
  }

  // 404 for unknown routes
  return res.status(404).json({ 
    message: 'Route not found',
    path: path,
    method: method
  });
}