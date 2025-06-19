// Business Directory API - Complete Serverless Function
const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const { Client } = require('pg');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://business-directory-pro-gmachu.vercel.app', 'https://vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database connection
const getDbClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
};

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session?.userId || req.session?.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = getDbClient();
    await client.connect();
    
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      await client.end();
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user.id;
    req.session.userRole = user.role;
    
    await client.end();
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const client = getDbClient();
    await client.connect();
    
    await client.query(
      'INSERT INTO users (id, email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, email, hashedPassword, firstName, lastName, 'user']
    );
    
    req.session.userId = userId;
    req.session.userRole = 'user';
    
    await client.end();
    res.json({ 
      user: { 
        id: userId, 
        email, 
        role: 'user',
        firstName,
        lastName
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/auth/user', requireAuth, async (req, res) => {
  try {
    const client = getDbClient();
    await client.connect();
    
    const result = await client.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    const user = result.rows[0];
    
    await client.end();
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      } 
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Public business routes
app.get('/api/businesses', async (req, res) => {
  try {
    const { category, city, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    
    const client = getDbClient();
    await client.connect();
    
    let query = 'SELECT * FROM businesses WHERE permanentlyclosed IS NOT TRUE';
    let params = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` AND LOWER(categoryname) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }
    
    if (city) {
      query += ` AND LOWER(city) = LOWER($${paramIndex})`;
      params.push(city);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (LOWER(title) LIKE LOWER($${paramIndex}) OR LOWER(description) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY featured DESC, totalscore DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await client.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM businesses WHERE permanentlyclosed IS NOT TRUE';
    let countParams = [];
    let countParamIndex = 1;
    
    if (category) {
      countQuery += ` AND LOWER(categoryname) = LOWER($${countParamIndex})`;
      countParams.push(category);
      countParamIndex++;
    }
    
    if (city) {
      countQuery += ` AND LOWER(city) = LOWER($${countParamIndex})`;
      countParams.push(city);
      countParamIndex++;
    }
    
    if (search) {
      countQuery += ` AND (LOWER(title) LIKE LOWER($${countParamIndex}) OR LOWER(description) LIKE LOWER($${countParamIndex}))`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await client.query(countQuery, countParams);
    
    await client.end();
    
    res.json({
      businesses: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    });
  } catch (error) {
    console.error('Businesses fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

app.get('/api/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = getDbClient();
    await client.connect();
    
    const result = await client.query('SELECT * FROM businesses WHERE placeid = $1 OR slug = $1', [id]);
    
    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({ error: 'Business not found' });
    }
    
    await client.end();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Business fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const client = getDbClient();
    await client.connect();
    
    const result = await client.query('SELECT * FROM categories ORDER BY name');
    
    await client.end();
    res.json(result.rows);
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/cities', async (req, res) => {
  try {
    const client = getDbClient();
    await client.connect();
    
    const result = await client.query(`
      SELECT city, COUNT(*) as count 
      FROM businesses 
      WHERE city IS NOT NULL AND city != '' 
      GROUP BY city 
      ORDER BY count DESC, city
    `);
    
    await client.end();
    res.json(result.rows);
  } catch (error) {
    console.error('Cities fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// Admin routes
app.get('/api/admin/businesses', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    
    const client = getDbClient();
    await client.connect();
    
    let query = 'SELECT * FROM businesses';
    let params = [];
    
    if (search) {
      query += ' WHERE LOWER(title) LIKE LOWER($1) OR LOWER(city) LIKE LOWER($1)';
      params.push(`%${search}%`);
      query += ` ORDER BY createdat DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY createdat DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }
    
    const result = await client.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM businesses';
    let countParams = [];
    
    if (search) {
      countQuery += ' WHERE LOWER(title) LIKE LOWER($1) OR LOWER(city) LIKE LOWER($1)';
      countParams.push(`%${search}%`);
    }
    
    const countResult = await client.query(countQuery, countParams);
    
    await client.end();
    
    res.json({
      businesses: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    });
  } catch (error) {
    console.error('Admin businesses fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

app.post('/api/admin/businesses', requireAdmin, async (req, res) => {
  try {
    const businessData = req.body;
    const placeid = businessData.placeid || `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const client = getDbClient();
    await client.connect();
    
    const result = await client.query(`
      INSERT INTO businesses (placeid, title, description, categoryname, phone, website, address, city, state, totalscore, slug)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      placeid,
      businessData.title,
      businessData.description,
      businessData.categoryname,
      businessData.phone,
      businessData.website,
      businessData.address,
      businessData.city,
      businessData.state,
      businessData.totalscore || 0,
      businessData.slug || businessData.title?.toLowerCase().replace(/[^a-z0-9]/g, '-')
    ]);
    
    await client.end();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Business create error:', error);
    res.status(500).json({ error: 'Failed to create business' });
  }
});

app.put('/api/admin/businesses/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const businessData = req.body;
    
    const client = getDbClient();
    await client.connect();
    
    const result = await client.query(`
      UPDATE businesses 
      SET title = $1, description = $2, categoryname = $3, phone = $4, website = $5, 
          address = $6, city = $7, state = $8, totalscore = $9, updatedat = NOW()
      WHERE placeid = $10
      RETURNING *
    `, [
      businessData.title,
      businessData.description,
      businessData.categoryname,
      businessData.phone,
      businessData.website,
      businessData.address,
      businessData.city,
      businessData.state,
      businessData.totalscore || 0,
      id
    ]);
    
    await client.end();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Business update error:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

app.delete('/api/admin/businesses/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const client = getDbClient();
    await client.connect();
    
    await client.query('DELETE FROM businesses WHERE placeid = $1', [id]);
    
    await client.end();
    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Business delete error:', error);
    res.status(500).json({ error: 'Failed to delete business' });
  }
});

// Contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const client = getDbClient();
    await client.connect();
    
    await client.query(
      'INSERT INTO contact_messages (name, email, message, created_at) VALUES ($1, $2, $3, NOW())',
      [name, email, message]
    );
    
    await client.end();
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Export for Vercel
module.exports = app;