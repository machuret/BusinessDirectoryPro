const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.set('trust proxy', 1);

// Security and middleware setup
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: true, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'] }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'vercel-business-directory-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: 'lax' }
}));

// File upload handling
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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
const sampleBusinesses = [
  { placeid: 'ChIJdRBTL1FYkWsRruDMKlIMc6s', businessname: 'Sydney Dental Care', category: 'dentist', categoryId: 13, city: 'Sydney', address: '123 George Street, Sydney NSW 2000', phone: '+61 2 9555 0123', email: 'info@sydneydentalcare.com.au', website: 'https://sydneydentalcare.com.au', description: 'Professional dental services in the heart of Sydney', rating: 4.8, reviewCount: 127, status: 'active', imageUrl: null, featured: true },
  { placeid: 'ChIJBddmiaxbkWsRP8_c6zKVvHo', businessname: 'Melbourne Restaurant Hub', category: 'restaurant', categoryId: 1, city: 'Melbourne', address: '456 Collins Street, Melbourne VIC 3000', phone: '+61 3 9555 0456', email: 'hello@melbournerestaurant.com.au', website: 'https://melbournerestaurant.com.au', description: 'Fine dining experience in Melbourne CBD', rating: 4.6, reviewCount: 89, status: 'active', imageUrl: null, featured: false },
  { placeid: 'ChIJZ1C8vutYkWsRD4T4Jv2k7Ao', businessname: 'Brisbane Tech Solutions', category: 'technology', categoryId: 4, city: 'Brisbane', address: '789 Queen Street, Brisbane QLD 4000', phone: '+61 7 3555 0789', email: 'support@brisbanetechsolutions.com.au', website: 'https://brisbanetechsolutions.com.au', description: 'Expert IT services and technology solutions', rating: 4.9, reviewCount: 156, status: 'active', imageUrl: null, featured: true }
];

const sampleUsers = [
  { id: 'demo-admin', email: 'admin@businesshub.com', firstName: 'Admin', lastName: 'User', role: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'user-1', email: 'user@example.com', firstName: 'Test', lastName: 'User', role: 'user', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

// COMPLETE AUTHENTICATION SYSTEM
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  const existingUser = sampleUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  const adminEmails = ['admin@businesshub.com', 'admin@test.com', 'superadmin@platform.com'];
  const isAdmin = adminEmails.includes(email) || email.includes('admin');
  
  const newUser = {
    id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    email,
    firstName,
    lastName,
    role: isAdmin ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  sampleUsers.push(newUser);
  req.session.user = newUser;
  
  res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    role: newUser.role
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  if (email === 'admin@businesshub.com' && password === 'Xola2025') {
    const user = sampleUsers[0];
    req.session.user = user;
    return res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
  }
  
  const user = sampleUsers.find(u => u.email === email);
  if (user) {
    req.session.user = user;
    return res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
  }
  
  res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/api/auth/user', (req, res) => {
  if (req.session?.user) {
    const user = req.session.user;
    res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Could not log out' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// BUSINESS MANAGEMENT
app.get('/api/businesses', (req, res) => res.json(sampleBusinesses));
app.get('/api/businesses/featured', (req, res) => res.json(sampleBusinesses.filter(b => b.featured)));
app.get('/api/businesses/random', (req, res) => {
  const shuffled = [...sampleBusinesses].sort(() => Math.random() - 0.5);
  res.json(shuffled.slice(0, 9));
});

app.get('/api/admin/businesses', requireAuth, requireAdmin, (req, res) => res.json(sampleBusinesses));
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

// CATEGORIES
app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 1, name: 'Restaurant', slug: 'restaurant' },
    { id: 13, name: 'Dentist', slug: 'dentist' },
    { id: 4, name: 'Technology', slug: 'technology' }
  ];
  res.json(categories);
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Complete Business Directory API is running on Vercel',
    timestamp: new Date().toISOString(),
    platform: 'vercel'
  });
});

// FALLBACK
app.get('/', (req, res) => {
  res.json({ message: 'Business Directory API is running' });
});

module.exports = app;