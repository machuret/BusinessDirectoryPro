import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting Replit deployment build...');

try {
  // Check if we're in production
  if (process.env.NODE_ENV === 'production' || process.argv.includes('--production')) {
    console.log('📦 Building for production...');
    
    // Check if server/public exists with React files
    const publicPath = path.join(__dirname, '../server/public');
    const indexPath = path.join(publicPath, 'index.html');
    
    if (!fs.existsSync(indexPath) || fs.readFileSync(indexPath, 'utf8').includes('Application is building')) {
      console.log('⚠️  React build not found, building now...');
      
      // Build the React app
      console.log('🔨 Building React app...');
      execSync('cd client && npm run build', { stdio: 'inherit' });
      
      console.log('✅ Build complete!');
    } else {
      console.log('✅ React build already exists');
    }
  }
  
  // Start the server
  console.log('🚀 Starting server...');
  execSync('npm run start', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
}