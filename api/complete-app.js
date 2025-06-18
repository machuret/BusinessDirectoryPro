import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Create Express app instance for serverless function
const app = express();
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session configuration for Vercel
app.use(session({
  secret: process.env.SESSION_SECRET || 'vercel-business-directory-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: 'lax'
  }
}));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ message: 'Not authenticated' });
}

function requireAdmin(req, res, next) {
  if (req.session?.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
}

// Sample data for demonstration
const sampleBusinesses = [
  {
    placeid: 'ChIJdRBTL1FYkWsRruDMKlIMc6s',
    businessname: 'Sydney Dental Care',
    category: 'dentist',
    categoryId: 13,
    city: 'Sydney',
    address: '123 George Street, Sydney NSW 2000',
    phone: '+61 2 9555 0123',
    email: 'info@sydneydentalcare.com.au',
    website: 'https://sydneydentalcare.com.au',
    description: 'Professional dental services in the heart of Sydney',
    rating: 4.8,
    reviewCount: 127,
    status: 'active',
    imageUrl: null,
    featured: true
  },
  {
    placeid: 'ChIJBddmiaxbkWsRP8_c6zKVvHo',
    businessname: 'Melbourne Restaurant Hub',
    category: 'restaurant',
    categoryId: 1,
    city: 'Melbourne',
    address: '456 Collins Street, Melbourne VIC 3000',
    phone: '+61 3 9555 0456',
    email: 'hello@melbournerestaurant.com.au',
    website: 'https://melbournerestaurant.com.au',
    description: 'Fine dining experience in Melbourne CBD',
    rating: 4.6,
    reviewCount: 89,
    status: 'active',
    imageUrl: null,
    featured: false
  }
];

const sampleCategories = [
  { id: 1, name: 'Restaurant', slug: 'restaurant' },
  { id: 2, name: 'Retail', slug: 'retail' },
  { id: 3, name: 'Services', slug: 'services' },
  { id: 4, name: 'Healthcare', slug: 'healthcare' },
  { id: 13, name: 'Dentist', slug: 'dentist' }
];

const sampleUsers = [
  {
    id: 'demo-admin',
    email: 'admin@businesshub.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// AUTHENTICATION ROUTES
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@businesshub.com' && password === 'Xola2025') {
    const user = sampleUsers[0];
    req.session.user = user;
    
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/auth/user', (req, res) => {
  if (req.session?.user) {
    const user = req.session.user;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// PUBLIC BUSINESS ROUTES
app.get('/api/businesses', (req, res) => {
  res.json(sampleBusinesses);
});

app.get('/api/businesses/featured', (req, res) => {
  const featured = sampleBusinesses.filter(b => b.featured);
  res.json(featured);
});

app.get('/api/businesses/random', (req, res) => {
  const shuffled = [...sampleBusinesses].sort(() => Math.random() - 0.5);
  res.json(shuffled.slice(0, 9));
});

app.get('/api/businesses/:id', (req, res) => {
  const business = sampleBusinesses.find(b => b.placeid === req.params.id);
  if (business) {
    res.json(business);
  } else {
    res.status(404).json({ message: 'Business not found' });
  }
});

// ADMIN BUSINESS ROUTES
app.get('/api/admin/businesses', requireAuth, requireAdmin, (req, res) => {
  res.json(sampleBusinesses);
});

app.post('/api/admin/businesses', requireAuth, requireAdmin, (req, res) => {
  const newBusiness = {
    placeid: 'new-' + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  };
  sampleBusinesses.push(newBusiness);
  res.status(201).json(newBusiness);
});

app.put('/api/admin/businesses/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleBusinesses.findIndex(b => b.placeid === req.params.id);
  if (index !== -1) {
    sampleBusinesses[index] = { ...sampleBusinesses[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(sampleBusinesses[index]);
  } else {
    res.status(404).json({ message: 'Business not found' });
  }
});

app.delete('/api/admin/businesses/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleBusinesses.findIndex(b => b.placeid === req.params.id);
  if (index !== -1) {
    sampleBusinesses.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Business not found' });
  }
});

// MASS DELETE ENDPOINT
app.post('/api/admin/businesses/bulk-delete', requireAuth, requireAdmin, (req, res) => {
  const { businessIds } = req.body;
  
  if (!Array.isArray(businessIds) || businessIds.length === 0) {
    return res.status(400).json({ message: 'Business IDs array is required and cannot be empty' });
  }
  
  let deletedCount = 0;
  businessIds.forEach(id => {
    const index = sampleBusinesses.findIndex(b => b.placeid === id);
    if (index !== -1) {
      sampleBusinesses.splice(index, 1);
      deletedCount++;
    }
  });
  
  res.json({
    message: `Successfully deleted ${deletedCount} business(es)`,
    deletedCount: deletedCount,
    totalRequested: businessIds.length,
    errors: deletedCount < businessIds.length ? ['Some businesses not found'] : []
  });
});

// CATEGORIES ROUTES
app.get('/api/categories', (req, res) => {
  res.json(sampleCategories);
});

app.get('/api/admin/categories', requireAuth, requireAdmin, (req, res) => {
  res.json(sampleCategories);
});

// USERS ROUTES
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  res.json(sampleUsers);
});

// SITE SETTINGS
app.get('/api/site-settings', (req, res) => {
  res.json([
    { id: 1, key: 'site_name', value: 'Business Directory Pro' },
    { id: 2, key: 'site_description', value: 'Professional Business Directory Platform' },
    { id: 3, key: 'openai_api_key', value: '***' }
  ]);
});

// MENU ITEMS
app.get('/api/menu-items', (req, res) => {
  res.json([
    { id: 1, name: 'Home', url: '/', position: 'header', isActive: true },
    { id: 2, name: 'Categories', url: '/categories', position: 'header', isActive: true },
    { id: 3, name: 'Cities', url: '/cities', position: 'header', isActive: true }
  ]);
});

// SOCIAL MEDIA
app.get('/api/social-media', (req, res) => {
  res.json([
    { id: 5, platform: 'youtube', url: 'https://youtube.com/@businessdirectory', isActive: true }
  ]);
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Business Directory API is running on Vercel',
    timestamp: new Date().toISOString(),
    platform: 'vercel',
    features: [
      'Authentication System',
      'Business Management',
      'Mass Delete Operations',
      'Admin Panel',
      'Categories Management',
      'User Management'
    ]
  });
});

// CONTENT STRINGS
app.get('/api/content/strings', (req, res) => {
  res.json({
    'forms.required': 'This field is required',
    'forms.email': 'Please enter a valid email address',
    'forms.password': 'Password must be at least 8 characters',
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'nav.home': 'Home',
    'nav.categories': 'Categories',
    'nav.cities': 'Cities'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Export as serverless function
export default app;