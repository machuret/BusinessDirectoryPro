const fs = require('fs');
const path = require('path');

console.log('🚀 Quick deployment fix...');

// Create a proper index.html for production
const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Business Directory</title>
  <script type="module" crossorigin src="/assets/index.js"></script>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

// Create server/public directory if it doesn't exist
const publicDir = path.join(__dirname, '../server/public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write the index.html
fs.writeFileSync(path.join(publicDir, 'index.html'), indexHTML);

console.log('✅ Created production index.html');
console.log('📦 To complete deployment, run: npm run build');
console.log('🔄 Or for immediate fix: restart the workflow');