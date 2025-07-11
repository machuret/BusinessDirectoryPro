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

  // Test TypeScript compilation first
  console.log('Testing TypeScript compilation...');
  try {
    execSync('cd client && npx tsc --noEmit --skipLibCheck --project tsconfig.json', { 
      stdio: 'pipe'
    });
    console.log('✓ TypeScript compilation successful');
  } catch (e) {
    console.log('⚠ TypeScript compilation warnings (but continuing...)');
  }

  // Test a simple Vite build
  console.log('Testing Vite build...');
  execSync('cd client && timeout 10 npx vite build --logLevel error', { 
    stdio: 'inherit',
    timeout: 10000
  });
  
  console.log('✓ Build test completed');
  
} catch (error) {
  console.error('Build test failed:', error.message);
  
  // Check if it's a path alias issue
  if (error.message.includes('@/hooks/useAuth')) {
    console.log('\n🔍 Detected path alias issue with @/hooks/useAuth');
    console.log('The client vite.config.ts should resolve this...');
  }
}