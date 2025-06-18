export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST' && req.url?.includes('/login')) {
    // Basic auth simulation
    const { email, password } = req.body || {};
    
    if (email === 'admin@businesshub.com' && password === 'Xola2025') {
      return res.status(200).json({
        id: 'admin',
        email: 'admin@businesshub.com',
        role: 'admin'
      });
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  return res.status(200).json({ message: 'Auth endpoint active' });
}