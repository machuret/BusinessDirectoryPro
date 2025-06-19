const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const multer = require('multer');

const app = express();

// Configure for Vercel serverless
app.set('trust proxy', 1);

// Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ 
  origin: true, 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'] 
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session for Vercel
app.use(session({
  secret: process.env.SESSION_SECRET || 'vercel-session-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.status(401).json({ message: 'Not authenticated' });
}

function requireAdmin(req, res, next) {
  if (req.session?.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
}

// Sample data
const businesses = [
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
    featured: false 
  },
  { 
    placeid: 'ChIJZ1C8vutYkWsRD4T4Jv2k7Ao', 
    businessname: 'Brisbane Tech Solutions', 
    category: 'technology', 
    categoryId: 4, 
    city: 'Brisbane', 
    address: '789 Queen Street, Brisbane QLD 4000', 
    phone: '+61 7 3555 0789', 
    email: 'support@brisbanetechsolutions.com.au', 
    website: 'https://brisbanetechsolutions.com.au', 
    description: 'Expert IT services and technology solutions', 
    rating: 4.9, 
    reviewCount: 156, 
    status: 'active', 
    featured: true 
  }
];

const users = [
  { 
    id: 'admin-1', 
    email: 'admin@businesshub.com', 
    firstName: 'Admin', 
    lastName: 'User', 
    role: 'admin', 
    createdAt: new Date().toISOString() 
  }
];

const categories = [
  { id: 1, name: 'Restaurant', slug: 'restaurant' },
  { id: 4, name: 'Technology', slug: 'technology' },
  { id: 13, name: 'Dentist', slug: 'dentist' }
];

// Authentication routes
app.post('/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  const isAdmin = email.includes('admin') || email === 'admin@businesshub.com';
  const newUser = {
    id: 'user-' + Date.now(),
    email,
    firstName,
    lastName,
    role: isAdmin ? 'admin' : 'user',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  req.session.user = newUser;
  
  res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    role: newUser.role
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  
  // Admin login
  if (email === 'admin@businesshub.com' && password === 'Xola2025') {
    const admin = users[0];
    req.session.user = admin;
    return res.json({
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role
    });
  }
  
  res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/auth/user', (req, res) => {
  if (req.session?.user) {
    const user = req.session.user;
    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  }
  res.status(401).json({ message: 'Not authenticated' });
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Business routes
app.get('/businesses', (req, res) => {
  res.json(businesses);
});

app.get('/businesses/featured', (req, res) => {
  res.json(businesses.filter(b => b.featured));
});

app.get('/businesses/random', (req, res) => {
  const shuffled = [...businesses].sort(() => Math.random() - 0.5);
  res.json(shuffled.slice(0, 9));
});

// Admin business routes
app.get('/admin/businesses', requireAuth, requireAdmin, (req, res) => {
  res.json(businesses);
});

app.post('/admin/businesses/bulk-delete', requireAuth, requireAdmin, (req, res) => {
  const { businessIds } = req.body;
  if (!Array.isArray(businessIds)) {
    return res.status(400).json({ message: 'businessIds must be an array' });
  }
  
  let deleted = 0;
  businessIds.forEach(id => {
    const index = businesses.findIndex(b => b.placeid === id);
    if (index !== -1) {
      businesses.splice(index, 1);
      deleted++;
    }
  });
  
  res.json({
    message: \`Deleted \${deleted} businesses\`,
    deletedCount: deleted,
    totalRequested: businessIds.length
  });
});

// Categories
app.get('/categories', (req, res) => {
  res.json(categories);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Business Directory API running on Vercel',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Business Directory API' });
});

// Export handler for Vercel
module.exports = app;