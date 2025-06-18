export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    return res.status(200).json([
      { id: 1, name: 'Home', url: '/', position: 'header', isActive: true },
      { id: 2, name: 'Categories', url: '/categories', position: 'header', isActive: true },
      { id: 3, name: 'Cities', url: '/cities', position: 'header', isActive: true }
    ]);
  }