export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    return res.status(200).json([
      { id: 1, key: 'site_name', value: 'Business Directory Pro' },
      { id: 2, key: 'site_description', value: 'Professional Business Directory Platform' }
    ]);
  }