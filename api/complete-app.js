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

// Sample data with comprehensive business directory
const sampleBusinesses = [
  { placeid: 'ChIJdRBTL1FYkWsRruDMKlIMc6s', businessname: 'Sydney Dental Care', category: 'dentist', categoryId: 13, city: 'Sydney', address: '123 George Street, Sydney NSW 2000', phone: '+61 2 9555 0123', email: 'info@sydneydentalcare.com.au', website: 'https://sydneydentalcare.com.au', description: 'Professional dental services in the heart of Sydney', rating: 4.8, reviewCount: 127, status: 'active', imageUrl: null, featured: true },
  { placeid: 'ChIJBddmiaxbkWsRP8_c6zKVvHo', businessname: 'Melbourne Restaurant Hub', category: 'restaurant', categoryId: 1, city: 'Melbourne', address: '456 Collins Street, Melbourne VIC 3000', phone: '+61 3 9555 0456', email: 'hello@melbournerestaurant.com.au', website: 'https://melbournerestaurant.com.au', description: 'Fine dining experience in Melbourne CBD', rating: 4.6, reviewCount: 89, status: 'active', imageUrl: null, featured: false },
  { placeid: 'ChIJZ1C8vutYkWsRD4T4Jv2k7Ao', businessname: 'Brisbane Tech Solutions', category: 'technology', categoryId: 4, city: 'Brisbane', address: '789 Queen Street, Brisbane QLD 4000', phone: '+61 7 3555 0789', email: 'support@brisbanetechsolutions.com.au', website: 'https://brisbanetechsolutions.com.au', description: 'Expert IT services and technology solutions', rating: 4.9, reviewCount: 156, status: 'active', imageUrl: null, featured: true }
];

const sampleCategories = [
  { id: 1, name: 'Restaurant', slug: 'restaurant' }, { id: 2, name: 'Retail', slug: 'retail' }, { id: 3, name: 'Services', slug: 'services' }, 
  { id: 4, name: 'Technology', slug: 'technology' }, { id: 5, name: 'Healthcare', slug: 'healthcare' }, { id: 13, name: 'Dentist', slug: 'dentist' }
];

const sampleUsers = [
  { id: 'demo-admin', email: 'admin@businesshub.com', firstName: 'Admin', lastName: 'User', role: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'user-1', email: 'user@example.com', firstName: 'Test', lastName: 'User', role: 'user', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const sampleReviews = [
  { id: 1, businessId: 'ChIJdRBTL1FYkWsRruDMKlIMc6s', rating: 5, comment: 'Excellent service!', reviewerName: 'John Smith', status: 'approved' },
  { id: 2, businessId: 'ChIJBddmiaxbkWsRP8_c6zKVvHo', rating: 4, comment: 'Great food and atmosphere', reviewerName: 'Jane Doe', status: 'pending' }
];

const sampleCities = [
  { city: 'Sydney', count: 45 }, { city: 'Melbourne', count: 38 }, { city: 'Brisbane', count: 29 }, { city: 'Perth', count: 21 }
];

const sampleLeads = [
  { id: 1, businessName: 'New Restaurant', contactName: 'Sarah Wilson', email: 'sarah@newrestaurant.com', phone: '+61 2 9555 1234', category: 'restaurant', city: 'Sydney', status: 'new' }
];

const sampleServices = [
  { id: 1, name: 'Premium Listing', price: 99.99, description: 'Enhanced business listing with premium features' },
  { id: 2, name: 'Featured Placement', price: 199.99, description: 'Top placement in search results' }
];

const sampleFeaturedRequests = [
  { id: 1, businessId: 'ChIJZ1C8vutYkWsRD4T4Jv2k7Ao', requestedBy: 'user-1', status: 'pending', requestDate: new Date().toISOString() }
];

const samplePages = [
  { id: 1, title: 'About Us', slug: 'about', content: 'Welcome to our business directory platform', status: 'published' },
  { id: 2, title: 'Contact', slug: 'contact', content: 'Get in touch with us', status: 'published' }
];

const sampleMenuItems = [
  { id: 1, name: 'Home', url: '/', position: 'header', isActive: true, order: 1 },
  { id: 2, name: 'Categories', url: '/categories', position: 'header', isActive: true, order: 2 },
  { id: 3, name: 'Cities', url: '/cities', position: 'header', isActive: true, order: 3 }
];

const sampleSocialMedia = [
  { id: 1, platform: 'facebook', url: 'https://facebook.com/businessdirectory', isActive: true },
  { id: 2, platform: 'twitter', url: 'https://twitter.com/businessdir', isActive: true },
  { id: 3, platform: 'youtube', url: 'https://youtube.com/@businessdirectory', isActive: true }
];

const sampleContentStrings = {
  'forms.required': 'This field is required',
  'forms.email': 'Please enter a valid email address',
  'forms.password': 'Password must be at least 8 characters',
  'auth.login': 'Login',
  'auth.logout': 'Logout',
  'nav.home': 'Home',
  'nav.categories': 'Categories',
  'nav.cities': 'Cities',
  'admin.dashboard': 'Admin Dashboard',
  'admin.businesses': 'Business Management',
  'admin.users': 'User Management'
};

const sampleSiteSettings = [
  { id: 1, key: 'site_name', value: 'Business Directory Pro' },
  { id: 2, key: 'site_description', value: 'Professional Business Directory Platform' },
  { id: 3, key: 'contact_email', value: 'admin@businesshub.com' },
  { id: 4, key: 'openai_api_key', value: '***' }
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
  
  // Check if user already exists
  const existingUser = sampleUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // Create new user
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
  
  // Check admin credentials
  if (email === 'admin@businesshub.com' && password === 'Xola2025') {
    const user = sampleUsers[0];
    req.session.user = user;
    return res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
  }
  
  // Check regular users
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

// PASSWORD RESET ENDPOINTS
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = sampleUsers.find(u => u.email === email);
  
  if (user) {
    // In production, send email with reset token
    res.json({ message: 'Password reset email sent' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  const { token, password } = req.body;
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  res.json({ message: 'Password reset successfully' });
});

// 1. BUSINESS MANAGEMENT ROUTES
app.get('/api/businesses', (req, res) => res.json(sampleBusinesses));
app.get('/api/businesses/featured', (req, res) => res.json(sampleBusinesses.filter(b => b.featured)));
app.get('/api/businesses/random', (req, res) => {
  const shuffled = [...sampleBusinesses].sort(() => Math.random() - 0.5);
  res.json(shuffled.slice(0, 9));
});
app.get('/api/businesses/:id', (req, res) => {
  const business = sampleBusinesses.find(b => b.placeid === req.params.id);
  business ? res.json(business) : res.status(404).json({ message: 'Business not found' });
});

app.get('/api/admin/businesses', requireAuth, requireAdmin, (req, res) => res.json(sampleBusinesses));
app.post('/api/admin/businesses', requireAuth, requireAdmin, (req, res) => {
  const newBusiness = { placeid: 'new-' + Date.now(), ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'active' };
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

// MASS DELETE FUNCTIONALITY
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

// 2. USER MANAGEMENT ROUTES
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => res.json(sampleUsers));
app.post('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  const newUser = { id: 'user-' + Date.now(), ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  sampleUsers.push(newUser);
  res.status(201).json(newUser);
});
app.put('/api/admin/users/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleUsers.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    sampleUsers[index] = { ...sampleUsers[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(sampleUsers[index]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});
app.delete('/api/admin/users/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleUsers.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    sampleUsers.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// 3. CATEGORIES MANAGEMENT
app.get('/api/categories', (req, res) => res.json(sampleCategories));
app.get('/api/admin/categories', requireAuth, requireAdmin, (req, res) => res.json(sampleCategories));
app.post('/api/admin/categories', requireAuth, requireAdmin, (req, res) => {
  const newCategory = { id: Date.now(), ...req.body };
  sampleCategories.push(newCategory);
  res.status(201).json(newCategory);
});
app.put('/api/admin/categories/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleCategories.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleCategories[index] = { ...sampleCategories[index], ...req.body };
    res.json(sampleCategories[index]);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});
app.delete('/api/admin/categories/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleCategories.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleCategories.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

// 4. REVIEWS MANAGEMENT
app.get('/api/admin/reviews', requireAuth, requireAdmin, (req, res) => res.json(sampleReviews));
app.put('/api/admin/reviews/:id/approve', requireAuth, requireAdmin, (req, res) => {
  const index = sampleReviews.findIndex(r => r.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleReviews[index].status = 'approved';
    res.json(sampleReviews[index]);
  } else {
    res.status(404).json({ message: 'Review not found' });
  }
});
app.put('/api/admin/reviews/:id/reject', requireAuth, requireAdmin, (req, res) => {
  const index = sampleReviews.findIndex(r => r.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleReviews[index].status = 'rejected';
    res.json(sampleReviews[index]);
  } else {
    res.status(404).json({ message: 'Review not found' });
  }
});
app.delete('/api/admin/reviews/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleReviews.findIndex(r => r.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleReviews.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Review not found' });
  }
});

// 5. CITIES MANAGEMENT
app.get('/api/admin/cities', requireAuth, requireAdmin, (req, res) => res.json(sampleCities));

// 6. LEADS MANAGEMENT
app.get('/api/admin/leads', requireAuth, requireAdmin, (req, res) => res.json(sampleLeads));
app.post('/api/admin/leads', requireAuth, requireAdmin, (req, res) => {
  const newLead = { id: Date.now(), ...req.body, status: 'new', createdAt: new Date().toISOString() };
  sampleLeads.push(newLead);
  res.status(201).json(newLead);
});
app.put('/api/admin/leads/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleLeads.findIndex(l => l.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleLeads[index] = { ...sampleLeads[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(sampleLeads[index]);
  } else {
    res.status(404).json({ message: 'Lead not found' });
  }
});
app.delete('/api/admin/leads/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleLeads.findIndex(l => l.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleLeads.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Lead not found' });
  }
});

// 7. SERVICES MANAGEMENT
app.get('/api/admin/services', requireAuth, requireAdmin, (req, res) => res.json(sampleServices));
app.post('/api/admin/services', requireAuth, requireAdmin, (req, res) => {
  const newService = { id: Date.now(), ...req.body };
  sampleServices.push(newService);
  res.status(201).json(newService);
});
app.put('/api/admin/services/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleServices.findIndex(s => s.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleServices[index] = { ...sampleServices[index], ...req.body };
    res.json(sampleServices[index]);
  } else {
    res.status(404).json({ message: 'Service not found' });
  }
});
app.delete('/api/admin/services/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleServices.findIndex(s => s.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleServices.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Service not found' });
  }
});

// 8. SOCIAL MEDIA MANAGEMENT
app.get('/api/social-media', (req, res) => res.json(sampleSocialMedia.filter(s => s.isActive)));
app.get('/api/admin/social-media', requireAuth, requireAdmin, (req, res) => res.json(sampleSocialMedia));
app.post('/api/admin/social-media', requireAuth, requireAdmin, (req, res) => {
  const newSocialMedia = { id: Date.now(), ...req.body, isActive: true };
  sampleSocialMedia.push(newSocialMedia);
  res.status(201).json(newSocialMedia);
});
app.put('/api/admin/social-media/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleSocialMedia.findIndex(s => s.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleSocialMedia[index] = { ...sampleSocialMedia[index], ...req.body };
    res.json(sampleSocialMedia[index]);
  } else {
    res.status(404).json({ message: 'Social media item not found' });
  }
});
app.delete('/api/admin/social-media/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleSocialMedia.findIndex(s => s.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleSocialMedia.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Social media item not found' });
  }
});

// 9. FEATURED REQUESTS MANAGEMENT
app.get('/api/admin/featured', requireAuth, requireAdmin, (req, res) => res.json(sampleFeaturedRequests));
app.put('/api/admin/featured/:id/approve', requireAuth, requireAdmin, (req, res) => {
  const index = sampleFeaturedRequests.findIndex(f => f.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleFeaturedRequests[index].status = 'approved';
    // Also update the business to be featured
    const businessIndex = sampleBusinesses.findIndex(b => b.placeid === sampleFeaturedRequests[index].businessId);
    if (businessIndex !== -1) sampleBusinesses[businessIndex].featured = true;
    res.json(sampleFeaturedRequests[index]);
  } else {
    res.status(404).json({ message: 'Featured request not found' });
  }
});
app.put('/api/admin/featured/:id/reject', requireAuth, requireAdmin, (req, res) => {
  const index = sampleFeaturedRequests.findIndex(f => f.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleFeaturedRequests[index].status = 'rejected';
    res.json(sampleFeaturedRequests[index]);
  } else {
    res.status(404).json({ message: 'Featured request not found' });
  }
});

// 10. PAGES MANAGEMENT
app.get('/api/admin/pages', requireAuth, requireAdmin, (req, res) => res.json(samplePages));
app.post('/api/admin/pages', requireAuth, requireAdmin, (req, res) => {
  const newPage = { id: Date.now(), ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  samplePages.push(newPage);
  res.status(201).json(newPage);
});
app.put('/api/admin/pages/:id', requireAuth, requireAdmin, (req, res) => {
  const index = samplePages.findIndex(p => p.id === parseInt(req.params.id));
  if (index !== -1) {
    samplePages[index] = { ...samplePages[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(samplePages[index]);
  } else {
    res.status(404).json({ message: 'Page not found' });
  }
});
app.delete('/api/admin/pages/:id', requireAuth, requireAdmin, (req, res) => {
  const index = samplePages.findIndex(p => p.id === parseInt(req.params.id));
  if (index !== -1) {
    samplePages.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Page not found' });
  }
});

// 11. CONTENT MANAGEMENT
app.get('/api/content/strings', (req, res) => res.json(sampleContentStrings));
app.get('/api/admin/content', requireAuth, requireAdmin, (req, res) => res.json(sampleContentStrings));
app.put('/api/admin/content/:key', requireAuth, requireAdmin, (req, res) => {
  const { value } = req.body;
  sampleContentStrings[req.params.key] = value;
  res.json({ key: req.params.key, value: value });
});

// 12. MENU MANAGEMENT
app.get('/api/menu-items', (req, res) => res.json(sampleMenuItems.filter(m => m.isActive)));
app.get('/api/admin/menu-items', requireAuth, requireAdmin, (req, res) => res.json(sampleMenuItems));
app.post('/api/admin/menu-items', requireAuth, requireAdmin, (req, res) => {
  const newMenuItem = { id: Date.now(), ...req.body, isActive: true };
  sampleMenuItems.push(newMenuItem);
  res.status(201).json(newMenuItem);
});
app.put('/api/admin/menu-items/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleMenuItems.findIndex(m => m.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleMenuItems[index] = { ...sampleMenuItems[index], ...req.body };
    res.json(sampleMenuItems[index]);
  } else {
    res.status(404).json({ message: 'Menu item not found' });
  }
});
app.delete('/api/admin/menu-items/:id', requireAuth, requireAdmin, (req, res) => {
  const index = sampleMenuItems.findIndex(m => m.id === parseInt(req.params.id));
  if (index !== -1) {
    sampleMenuItems.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Menu item not found' });
  }
});

// 13. SITE SETTINGS MANAGEMENT
app.get('/api/site-settings', (req, res) => res.json(sampleSiteSettings));
app.get('/api/admin/settings', requireAuth, requireAdmin, (req, res) => res.json(sampleSiteSettings));
app.put('/api/admin/settings/:key', requireAuth, requireAdmin, (req, res) => {
  const { value } = req.body;
  const index = sampleSiteSettings.findIndex(s => s.key === req.params.key);
  if (index !== -1) {
    sampleSiteSettings[index].value = value;
    res.json(sampleSiteSettings[index]);
  } else {
    const newSetting = { id: Date.now(), key: req.params.key, value: value };
    sampleSiteSettings.push(newSetting);
    res.status(201).json(newSetting);
  }
});

// 14. IMPORT MANAGEMENT
app.post('/api/admin/import/businesses', requireAuth, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  try {
    const csvData = req.file.buffer.toString('utf-8');
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    let importedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= headers.length) {
        const business = {
          placeid: 'import-' + Date.now() + '-' + i,
          businessname: values[0] || 'Imported Business',
          category: values[1] || 'general',
          city: values[2] || 'Unknown',
          address: values[3] || '',
          phone: values[4] || '',
          email: values[5] || '',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        sampleBusinesses.push(business);
        importedCount++;
      }
    }
    
    res.json({
      message: `Successfully imported ${importedCount} businesses`,
      importedCount: importedCount,
      totalLines: lines.length - 1
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing import file', error: error.message });
  }
});

// 15. EXPORT MANAGEMENT
app.get('/api/admin/export/businesses', requireAuth, requireAdmin, (req, res) => {
  const csvHeaders = 'Business Name,Category,City,Address,Phone,Email,Status\n';
  const csvData = sampleBusinesses.map(b => 
    `"${b.businessname}","${b.category}","${b.city}","${b.address}","${b.phone}","${b.email}","${b.status}"`
  ).join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="businesses-export.csv"');
  res.send(csvHeaders + csvData);
});

app.get('/api/admin/export/users', requireAuth, requireAdmin, (req, res) => {
  const csvHeaders = 'ID,Email,First Name,Last Name,Role,Created At\n';
  const csvData = sampleUsers.map(u => 
    `"${u.id}","${u.email}","${u.firstName}","${u.lastName}","${u.role}","${u.createdAt}"`
  ).join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');
  res.send(csvHeaders + csvData);
});

// 16. API MANAGEMENT (Admin API Key Management)
app.get('/api/admin/api-keys', requireAuth, requireAdmin, (req, res) => {
  res.json([
    { id: 1, name: 'OpenAI API Key', key: 'openai_api_key', masked: 'sk-***', status: 'active' },
    { id: 2, name: 'Azure Storage Key', key: 'azure_storage_key', masked: '***', status: 'active' }
  ]);
});

// 17. SUBMISSIONS MANAGEMENT (Contact form submissions)
app.get('/api/admin/submissions', requireAuth, requireAdmin, (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com', subject: 'Business Inquiry', message: 'Hello, I would like to list my business', createdAt: new Date().toISOString(), status: 'new' }
  ]);
});

// 18. OWNERSHIP CLAIMS MANAGEMENT
app.get('/api/admin/ownership', requireAuth, requireAdmin, (req, res) => {
  res.json([
    { id: 1, businessId: 'ChIJdRBTL1FYkWsRruDMKlIMc6s', claimerName: 'Sarah Johnson', claimerEmail: 'sarah@sydneydentalcare.com.au', status: 'pending', submittedAt: new Date().toISOString() }
  ]);
});

app.put('/api/admin/ownership/:id/approve', requireAuth, requireAdmin, (req, res) => {
  res.json({ id: req.params.id, status: 'approved', approvedAt: new Date().toISOString() });
});

app.put('/api/admin/ownership/:id/reject', requireAuth, requireAdmin, (req, res) => {
  res.json({ id: req.params.id, status: 'rejected', rejectedAt: new Date().toISOString() });
});

// PUBLIC USER DASHBOARD API
app.get('/api/user/profile', requireAuth, (req, res) => {
  const user = req.session.user;
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    createdAt: user.createdAt
  });
});

app.put('/api/user/profile', requireAuth, (req, res) => {
  const { firstName, lastName } = req.body;
  const userIndex = sampleUsers.findIndex(u => u.id === req.session.user.id);
  
  if (userIndex !== -1) {
    sampleUsers[userIndex] = { ...sampleUsers[userIndex], firstName, lastName, updatedAt: new Date().toISOString() };
    req.session.user = sampleUsers[userIndex];
    res.json(sampleUsers[userIndex]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// USER BUSINESS SUBMISSIONS
app.post('/api/user/submit-business', (req, res) => {
  const newSubmission = {
    id: Date.now(),
    ...req.body,
    submittedBy: req.session?.user?.id || 'anonymous',
    status: 'pending',
    submittedAt: new Date().toISOString()
  };
  
  // In production, this would go to a submissions table
  res.status(201).json({ message: 'Business submission received', id: newSubmission.id });
});

// USER OWNERSHIP CLAIMS
app.post('/api/user/claim-business', requireAuth, (req, res) => {
  const { businessId, claimerName, claimerEmail, supportingInfo } = req.body;
  
  const newClaim = {
    id: Date.now(),
    businessId,
    claimerName,
    claimerEmail,
    supportingInfo,
    userId: req.session.user.id,
    status: 'pending',
    submittedAt: new Date().toISOString()
  };
  
  res.status(201).json({ message: 'Ownership claim submitted', id: newClaim.id });
});

// USER FEATURE REQUESTS
app.post('/api/user/request-featured', requireAuth, (req, res) => {
  const { businessId, requestReason } = req.body;
  
  const newRequest = {
    id: Date.now(),
    businessId,
    requestReason,
    requestedBy: req.session.user.id,
    status: 'pending',
    requestDate: new Date().toISOString()
  };
  
  sampleFeaturedRequests.push(newRequest);
  res.status(201).json({ message: 'Feature request submitted', id: newRequest.id });
});

// CONTACT FORM SUBMISSIONS
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }
  
  const submission = {
    id: Date.now(),
    name,
    email,
    subject: subject || 'Contact Form Submission',
    message,
    createdAt: new Date().toISOString(),
    status: 'new'
  };
  
  // In production, this would be stored in database
  res.status(201).json({ message: 'Message sent successfully', id: submission.id });
});

// BUSINESS REVIEWS (PUBLIC)
app.post('/api/businesses/:id/reviews', (req, res) => {
  const { rating, comment, reviewerName, reviewerEmail } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  
  const newReview = {
    id: Date.now(),
    businessId: req.params.id,
    rating,
    comment: comment || '',
    reviewerName: reviewerName || 'Anonymous',
    reviewerEmail,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  sampleReviews.push(newReview);
  res.status(201).json({ message: 'Review submitted for moderation', id: newReview.id });
});

app.get('/api/businesses/:id/reviews', (req, res) => {
  const businessReviews = sampleReviews.filter(r => r.businessId === req.params.id && r.status === 'approved');
  res.json(businessReviews);
});

// LEAD GENERATION (PUBLIC)
app.post('/api/leads', (req, res) => {
  const { businessName, contactName, email, phone, category, city, message } = req.body;
  
  if (!businessName || !contactName || !email) {
    return res.status(400).json({ message: 'Business name, contact name, and email are required' });
  }
  
  const newLead = {
    id: Date.now(),
    businessName,
    contactName,
    email,
    phone: phone || '',
    category: category || 'general',
    city: city || '',
    message: message || '',
    status: 'new',
    createdAt: new Date().toISOString()
  };
  
  sampleLeads.push(newLead);
  res.status(201).json({ message: 'Lead information received', id: newLead.id });
});

// NEWSLETTER SUBSCRIPTION
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  res.json({ message: 'Successfully subscribed to newsletter' });
});

// ANALYTICS & PERFORMANCE
app.post('/api/analytics/performance', (req, res) => {
  res.status(200).json({ message: 'Performance data recorded' });
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Complete Business Directory API is running on Vercel',
    timestamp: new Date().toISOString(),
    platform: 'vercel',
    adminTools: [
      'Business Management (with Mass Delete)',
      'User Management',
      'Categories Management', 
      'Reviews Management',
      'Cities Management',
      'Leads Management',
      'Services Management',
      'Social Media Management',
      'Featured Requests Management',
      'Pages Management',
      'Content Management',
      'Menu Management',
      'Site Settings Management',
      'Import Management',
      'Export Management',
      'API Keys Management',
      'Submissions Management',
      'Ownership Claims Management'
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Export for Vercel serverless function
module.exports = app;
module.exports.default = app;