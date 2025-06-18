export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    if (req.method === 'GET') {
      return res.status(200).json([
        { id: 1, name: 'Restaurant', slug: 'restaurant' },
        { id: 2, name: 'Retail', slug: 'retail' },
        { id: 3, name: 'Services', slug: 'services' }
      ]);
    }
    
    return res.status(200).json({ message: 'Categories management endpoint active' });
  }