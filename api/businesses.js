import { storage } from '../server/storage.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const businesses = await storage.getBusinesses({});
    return res.status(200).json(businesses || []);
  } catch (error) {
    console.error('Businesses API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch businesses',
      message: error.message 
    });
  }
}