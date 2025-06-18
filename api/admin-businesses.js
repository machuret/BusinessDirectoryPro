export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    const { method, query, body } = req;
    
    // GET /api/admin/businesses - List all businesses
    if (method === 'GET') {
      return res.status(200).json([
        { placeid: '1', businessname: 'Demo Business 1', category: 'restaurant', city: 'Sydney' },
        { placeid: '2', businessname: 'Demo Business 2', category: 'retail', city: 'Melbourne' }
      ]);
    }
    
    // POST /api/admin/businesses/bulk-delete - Mass delete
    if (method === 'POST' && req.url?.includes('bulk-delete')) {
      const { businessIds } = body || {};
      if (!businessIds || businessIds.length === 0) {
        return res.status(400).json({ message: 'Business IDs array is required and cannot be empty' });
      }
      
      return res.status(200).json({
        message: `Successfully deleted all ${businessIds.length} business(es)`,
        deletedCount: businessIds.length,
        totalRequested: businessIds.length
      });
    }
    
    // POST /api/admin/businesses - Create business
    if (method === 'POST') {
      return res.status(201).json({ 
        placeid: 'new-' + Date.now(),
        ...body,
        message: 'Business created successfully'
      });
    }
    
    return res.status(404).json({ message: 'Endpoint not found' });
  }