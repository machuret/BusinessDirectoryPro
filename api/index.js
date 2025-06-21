// Vercel Serverless Function - Working Configuration
export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  
  try {
    // Health check endpoint
    if (url === '/health' || url === '/api/health') {
      return res.status(200).json({
        status: 'healthy',
        message: 'Business Directory API is running on Vercel',
        timestamp: new Date().toISOString(),
        platform: 'vercel'
      });
    }
    
    // API routes
    if (url.startsWith('/api/')) {
      const endpoint = url.replace('/api/', '');
      
      switch (endpoint) {
        case 'businesses':
          return res.status(200).json([
            {
              id: 1,
              name: "Sample Business",
              category: "Technology",
              description: "A sample business for demonstration",
              status: "active"
            }
          ]);
          
        case 'categories':
          return res.status(200).json([
            { id: 1, name: "Technology", slug: "technology" },
            { id: 2, name: "Healthcare", slug: "healthcare" },
            { id: 3, name: "Retail", slug: "retail" }
          ]);
          
        case 'cities':
          return res.status(200).json([
            { city: "New York", count: 150 },
            { city: "Los Angeles", count: 120 },
            { city: "Chicago", count: 80 }
          ]);
          
        default:
          return res.status(404).json({ 
            error: 'API endpoint not found',
            available: ['/api/businesses', '/api/categories', '/api/cities', '/health']
          });
      }
    }
    
    // Default frontend response for all other routes
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Directory Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
            color: #333;
        }
        .container { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            padding: 20px; 
        }
        .card { 
            background: white; 
            padding: 2rem; 
            border-radius: 12px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
            max-width: 800px; 
            width: 100%; 
            text-align: center; 
        }
        h1 { 
            color: #333; 
            margin-bottom: 1rem; 
            font-size: 2.5rem; 
            font-weight: 700; 
        }
        .subtitle { 
            color: #666; 
            margin-bottom: 2rem; 
            font-size: 1.1rem; 
        }
        .status { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 0.5rem; 
            background: #e8f5e8; 
            color: #2d5a2d; 
            padding: 1rem; 
            border-radius: 8px; 
            margin: 1.5rem 0; 
            border-left: 4px solid #4CAF50; 
        }
        .status-dot { 
            width: 8px; 
            height: 8px; 
            background: #4CAF50; 
            border-radius: 50%; 
            animation: pulse 2s infinite; 
        }
        @keyframes pulse { 
            0%, 100% { opacity: 1; } 
            50% { opacity: 0.5; } 
        }
        .nav-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 1rem; 
            margin: 2rem 0; 
        }
        .nav-item { 
            background: #667eea; 
            color: white; 
            padding: 1rem; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 500; 
            transition: all 0.3s ease; 
            border: none; 
            cursor: pointer; 
            font-size: 1rem;
        }
        .nav-item:hover { 
            background: #5a6fd8; 
            transform: translateY(-2px); 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .api-info { 
            background: #f8f9fa; 
            padding: 1.5rem; 
            border-radius: 8px; 
            margin-top: 2rem; 
            border-left: 4px solid #007bff; 
            text-align: left;
        }
        .endpoint { 
            font-family: monospace; 
            background: #e9ecef; 
            padding: 0.5rem; 
            border-radius: 4px; 
            margin: 0.5rem 0; 
            font-size: 0.9rem;
        }
        .results {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            text-align: left;
            margin-top: 1rem;
            display: none;
        }
        .results pre {
            background: white;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 0.85rem;
            max-height: 300px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Business Directory</h1>
            <p class="subtitle">Your comprehensive business networking platform</p>
            
            <div class="status">
                <div class="status-dot"></div>
                <strong>System Status: Online & Ready (Vercel)</strong>
            </div>
            
            <div class="nav-grid">
                <button class="nav-item" onclick="testAPI('businesses')">Browse Businesses</button>
                <button class="nav-item" onclick="testAPI('categories')">Categories</button>
                <button class="nav-item" onclick="testAPI('cities')">Cities</button>
                <button class="nav-item" onclick="testHealth()">Health Check</button>
            </div>
            
            <div class="api-info">
                <h3>Available API Endpoints</h3>
                <div class="endpoint">GET /api/businesses - List all businesses</div>
                <div class="endpoint">GET /api/categories - Business categories</div>
                <div class="endpoint">GET /api/cities - Available cities</div>
                <div class="endpoint">GET /health - System health check</div>
            </div>
            
            <div id="results" class="results">
                <h3 id="results-title">API Response</h3>
                <pre id="results-content"></pre>
            </div>
        </div>
    </div>
    
    <script>
        async function testAPI(endpoint) {
            const resultsDiv = document.getElementById('results');
            const titleElement = document.getElementById('results-title');
            const contentElement = document.getElementById('results-content');
            
            try {
                titleElement.textContent = 'Loading...';
                contentElement.textContent = 'Fetching data...';
                resultsDiv.style.display = 'block';
                
                const response = await fetch('/api/' + endpoint);
                const data = await response.json();
                
                titleElement.textContent = endpoint.charAt(0).toUpperCase() + endpoint.slice(1) + ' (Status: ' + response.status + ')';
                contentElement.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                titleElement.textContent = 'Error';
                contentElement.textContent = 'Failed to fetch: ' + error.message;
            }
        }
        
        async function testHealth() {
            const resultsDiv = document.getElementById('results');
            const titleElement = document.getElementById('results-title');
            const contentElement = document.getElementById('results-content');
            
            try {
                titleElement.textContent = 'Loading...';
                contentElement.textContent = 'Checking system health...';
                resultsDiv.style.display = 'block';
                
                const response = await fetch('/health');
                const data = await response.json();
                
                titleElement.textContent = 'Health Check (Status: ' + response.status + ')';
                contentElement.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                titleElement.textContent = 'Health Check Error';
                contentElement.textContent = 'Failed to fetch: ' + error.message;
            }
        }
        
        // Initialize with system status
        window.addEventListener('load', () => {
            console.log('Business Directory Platform loaded successfully on Vercel');
        });
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}