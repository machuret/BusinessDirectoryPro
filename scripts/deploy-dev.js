import { spawn } from 'child_process';

console.log('🚀 Starting deployment in development mode...');

// Force development mode
process.env.NODE_ENV = 'development';

console.log('🔧 Environment: development');
console.log('✅ This will use Vite dev server (no build required)');

// Start the server in development mode
const server = spawn('tsx', ['server/index.ts'], {
  env: {
    ...process.env,
    NODE_ENV: 'development'
  },
  stdio: 'inherit'
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});