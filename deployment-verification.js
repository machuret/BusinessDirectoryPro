/**
 * Deployment Verification Script
 * Validates that all export/import issues have been resolved
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying deployment fixes...\n');

// Test 1: BusinessesSection default export
const businessesSectionPath = path.join(__dirname, 'client/src/components/dashboard/BusinessesSection.tsx');
const businessesContent = fs.readFileSync(businessesSectionPath, 'utf8');

const tests = [
  {
    name: 'BusinessesSection function declaration',
    test: businessesContent.includes('function BusinessesSection('),
    status: businessesContent.includes('function BusinessesSection(') ? '✅' : '❌'
  },
  {
    name: 'BusinessesSection default export',
    test: businessesContent.includes('export default BusinessesSection;'),
    status: businessesContent.includes('export default BusinessesSection;') ? '✅' : '❌'
  }
];

// Test 2: Dashboard imports
const dashboardPath = path.join(__dirname, 'client/src/pages/dashboard.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

tests.push({
  name: 'Dashboard BusinessesSection import',
  test: dashboardContent.includes('import BusinessesSection from "@/components/dashboard/BusinessesSection";'),
  status: dashboardContent.includes('import BusinessesSection from "@/components/dashboard/BusinessesSection";') ? '✅' : '❌'
});

tests.push({
  name: 'Dashboard FeaturedRequestsSection import',
  test: dashboardContent.includes('import FeaturedRequestsSection from "@/components/dashboard/FeaturedRequestsSection";'),
  status: dashboardContent.includes('import FeaturedRequestsSection from "@/components/dashboard/FeaturedRequestsSection";') ? '✅' : '❌'
});

// Test 3: App.tsx useAuth import
const appPath = path.join(__dirname, 'client/src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

tests.push({
  name: 'App.tsx useAuth import',
  test: appContent.includes('import { useAuth } from "@/hooks/useAuth";'),
  status: appContent.includes('import { useAuth } from "@/hooks/useAuth";') ? '✅' : '❌'
});

// Test 4: FeaturedRequestsSection default export
const featuredPath = path.join(__dirname, 'client/src/components/dashboard/FeaturedRequestsSection.tsx');
const featuredContent = fs.readFileSync(featuredPath, 'utf8');

tests.push({
  name: 'FeaturedRequestsSection default export',
  test: featuredContent.includes('export default FeaturedRequestsSection;'),
  status: featuredContent.includes('export default FeaturedRequestsSection;') ? '✅' : '❌'
});

// Print results
tests.forEach(test => {
  console.log(`${test.status} ${test.name}`);
});

const allPassed = tests.every(test => test.test);
console.log('\n' + '='.repeat(50));
console.log(allPassed ? '🎉 All deployment fixes verified successfully!' : '❌ Some issues remain');
console.log('='.repeat(50));

if (allPassed) {
  console.log('\nDeployment should now succeed. The following issues have been resolved:');
  console.log('• Fixed BusinessesSection default export');
  console.log('• Updated dashboard imports to use default imports');
  console.log('• Fixed useAuth import in App.tsx');
  console.log('• Verified component export consistency');
}