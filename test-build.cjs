const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Testing client build with path aliases...');

try {
  // Test if the useAuth hook exists
  const useAuthPath = path.join(__dirname, 'client/src/hooks/useAuth.ts');
  if (fs.existsSync(useAuthPath)) {
    console.log('✓ useAuth hook exists at:', useAuthPath);
  } else {
    console.log('✗ useAuth hook not found');
    process.exit(1);
  }

  // Test a simple Vite build with timeout
  console.log('Testing Vite build...');
  execSync('cd client && timeout 15 npx vite build --logLevel warn', { 
    stdio: 'inherit'
  });
  
  console.log('✓ Build test completed successfully');
  
} catch (error) {
  console.error('Build test failed:', error.message);
  
  // Check if it's a path alias issue
  if (error.message.includes('@/hooks/useAuth') || error.stdout?.includes('@/hooks/useAuth')) {
    console.log('\n🔍 Detected path alias issue with @/hooks/useAuth');
    console.log('The client vite.config.ts should resolve this, but may need adjustments...');
  }
}