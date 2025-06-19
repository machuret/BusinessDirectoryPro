import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';

const app = express();

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Session configuration for Vercel
const PgSession = ConnectPgSimple(session);
const sessionStore = new PgSession({
  pool: sql,
  tableName: 'session',
  createTableIfMissing: true
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://business-directory-pro.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Business routes
app.get('/api/businesses', async (req, res) => {
  try {
    const { category, city, search, featured, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT b.*, 
             array_agg(DISTINCT CASE WHEN bp.id IS NOT NULL THEN json_build_object('id', bp.id, 'url', bp.url, 'caption', bp.caption) END) FILTER (WHERE bp.id IS NOT NULL) as photos,
             array_agg(DISTINCT CASE WHEN br.id IS NOT NULL THEN json_build_object('id', br.id, 'rating', br.rating, 'comment', br.comment, 'reviewer_name', br.reviewer_name, 'created_at', br.created_at) END) FILTER (WHERE br.id IS NOT NULL) as reviews,
             array_agg(DISTINCT CASE WHEN bs.id IS NOT NULL THEN json_build_object('id', bs.id, 'service_name', bs.service_name, 'description', bs.description, 'price', bs.price) END) FILTER (WHERE bs.id IS NOT NULL) as services
      FROM businesses b
      LEFT JOIN business_photos bp ON b.id = bp.business_id
      LEFT JOIN business_reviews br ON b.id = br.business_id
      LEFT JOIN business_services bs ON b.id = bs.business_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` AND LOWER(b.category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }
    
    if (city) {
      query += ` AND LOWER(b.city) = LOWER($${paramIndex})`;
      params.push(city);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (LOWER(b.business_name) LIKE LOWER($${paramIndex}) OR LOWER(b.description) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (featured === 'true') {
      query += ` AND b.is_featured = true`;
    }
    
    query += ` GROUP BY b.id ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const businesses = await sql(query, params);
    res.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const users = await sql('SELECT * FROM users WHERE email = $1', [email]);
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user.id;
    req.session.userRole = user.role;
    
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const existingUsers = await sql('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const users = await sql(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, created_at)
      VALUES ($1, $2, $3, $4, 'user', NOW())
      RETURNING id, email, role, first_name, last_name
    `, [email, passwordHash, firstName, lastName]);
    
    const user = users[0];
    
    req.session.userId = user.id;
    req.session.userRole = user.role;
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/auth/user', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  res.json({
    id: req.session.userId,
    role: req.session.userRole
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Categories and cities
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await sql(`
      SELECT category, COUNT(*) as count 
      FROM businesses 
      GROUP BY category 
      ORDER BY count DESC, category ASC
    `);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/cities', async (req, res) => {
  try {
    const cities = await sql(`
      SELECT city, COUNT(*) as count 
      FROM businesses 
      GROUP BY city 
      ORDER BY count DESC, city ASC
    `);
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// Contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, businessId } = req.body;
    
    await sql(`
      INSERT INTO leads (name, email, message, business_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [name, email, message, businessId || null]);
    
    res.json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Analytics
app.post('/api/analytics/performance', (req, res) => {
  res.json({ status: 'received' });
});

// Admin routes (protected)
const requireAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

app.get('/api/admin/businesses', requireAdmin, async (req, res) => {
  try {
    const businesses = await sql('SELECT * FROM businesses ORDER BY created_at DESC');
    res.json(businesses);
  } catch (error) {
    console.error('Error fetching admin businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

app.post('/api/admin/businesses', requireAdmin, async (req, res) => {
  try {
    const business = req.body;
    const result = await sql(`
      INSERT INTO businesses (business_name, description, category, phone, email, website, address, city, state, zip_code, is_featured, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `, [
      business.business_name, business.description, business.category,
      business.phone, business.email, business.website, business.address,
      business.city, business.state, business.zip_code, business.is_featured || false
    ]);
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Failed to create business' });
  }
});

// Export for Vercel serverless
export default app;