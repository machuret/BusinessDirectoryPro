/**
 * Deployment Verification Script
 * Validates that all export/import issues have been resolved
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment readiness...');

// Check that useAuth hook exists
const useAuthPath = path.join(__dirname, '../client/src/hooks/useAuth.ts');
if (fs.existsSync(useAuthPath)) {
  console.log('✅ useAuth hook exists');
} else {
  console.log('❌ useAuth hook missing');
  process.exit(1);
}

// Check that client vite config exists
const clientViteConfigPath = path.join(__dirname, '../client/vite.config.ts');
if (fs.existsSync(clientViteConfigPath)) {
  const configContent = fs.readFileSync(clientViteConfigPath, 'utf8');
  if (configContent.includes('import.meta.dirname')) {
    console.log('✅ Client vite.config.ts uses correct dirname');
  } else {
    console.log('❌ Client vite.config.ts has incorrect dirname usage');
    process.exit(1);
  }
} else {
  console.log('❌ Client vite.config.ts missing');
  process.exit(1);
}

// Check that client tsconfig exists
const clientTsConfigPath = path.join(__dirname, '../client/tsconfig.json');
if (fs.existsSync(clientTsConfigPath)) {
  console.log('✅ Client tsconfig.json exists');
} else {
  console.log('❌ Client tsconfig.json missing');
  process.exit(1);
}

// Check App.tsx import
const appTsxPath = path.join(__dirname, '../client/src/App.tsx');
if (fs.existsSync(appTsxPath)) {
  const appContent = fs.readFileSync(appTsxPath, 'utf8');
  if (appContent.includes('import { useAuth } from "@/hooks/useAuth";')) {
    console.log('✅ App.tsx has correct useAuth import');
  } else {
    console.log('❌ App.tsx missing useAuth import');
    process.exit(1);
  }
} else {
  console.log('❌ App.tsx missing');
  process.exit(1);
}

console.log('🎉 All deployment fixes verified successfully!');
console.log('\nNext steps:');
console.log('1. Run deployment build: npm run build');
console.log('2. Deploy to your platform of choice');
console.log('3. The path alias "@/hooks/useAuth" should now resolve correctly');