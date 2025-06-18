export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    return res.status(200).json([
      { id: 1, name: 'Restaurant', slug: 'restaurant' },
      { id: 2, name: 'Retail', slug: 'retail' },
      { id: 3, name: 'Services', slug: 'services' },
      { id: 4, name: 'Healthcare', slug: 'healthcare' },
      { id: 5, name: 'Education', slug: 'education' }
    ]);
  }