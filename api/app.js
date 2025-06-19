const express = require('express');
const session = require('express-session');
const cors = require('cors');

const app = express();

// Configure middleware for Vercel
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple session store for serverless
app.use(session({
  secret: 'vercel-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Sample data
let businesses = [
  {
    placeid: 'demo-1',
    businessname: 'Sydney Dental Care',
    category: 'dentist',
    city: 'Sydney',
    address: '123 George Street, Sydney NSW 2000',
    phone: '+61 2 9555 0123',
    status: 'active',
    featured: true
  },
  {
    placeid: 'demo-2', 
    businessname: 'Melbourne Restaurant',
    category: 'restaurant',
    city: 'Melbourne',
    address: '456 Collins Street, Melbourne VIC 3000',
    phone: '+61 3 9555 0456',
    status: 'active',
    featured: false
  }
];

const users = [{
  id: 'admin-1',
  email: 'admin@businesshub.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin'
}];

// Auth middleware
const requireAuth = (req, res, next) => {
  if (req.session?.user) return next();
  res.status(401).json({ message: 'Not authenticated' });
};

const requireAdmin = (req, res, next) => {
  if (req.session?.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

// Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@businesshub.com' && password === 'Xola2025') {
    req.session.user = users[0];
    res.json(users[0]);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/auth/user', (req, res) => {
  if (req.session?.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

app.get('/api/businesses', (req, res) => {
  res.json(businesses);
});

app.get('/api/businesses/featured', (req, res) => {
  res.json(businesses.filter(b => b.featured));
});

app.get('/api/admin/businesses', requireAuth, requireAdmin, (req, res) => {
  res.json(businesses);
});

app.post('/api/admin/businesses/bulk-delete', requireAuth, requireAdmin, (req, res) => {
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
    message: `Deleted ${deleted} businesses`,
    deletedCount: deleted
  });
});

app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Restaurant', slug: 'restaurant' },
    { id: 13, name: 'Dentist', slug: 'dentist' }
  ]);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'API running on Vercel',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Business Directory API' });
});

// Handle all API routes
app.all('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = (req, res) => {
  return app(req, res);
};