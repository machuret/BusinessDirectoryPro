export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    if (req.method === 'GET') {
      return res.status(200).json([
        { id: '1', email: 'admin@businesshub.com', role: 'admin', firstName: 'Admin', lastName: 'User' },
        { id: '2', email: 'user@example.com', role: 'user', firstName: 'Test', lastName: 'User' }
      ]);
    }
    
    return res.status(200).json({ message: 'Users management endpoint active' });
  }