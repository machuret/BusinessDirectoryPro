export default function handler(req, res) {
  return res.status(200).json({
    status: 'healthy',
    message: 'Business Directory API is running',
    timestamp: new Date().toISOString(),
    platform: 'vercel'
  });
}