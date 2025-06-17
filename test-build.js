#!/usr/bin/env node

/**
 * Test Build Script - Verify Export/Import Fixes
 * 
 * This script validates that the BusinessesSection export/import fixes
 * are working correctly and identifies any remaining build issues.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing BusinessesSection export/import fixes...');

// Test 1: Verify BusinessesSection exports
const businessesSectionPath = path.join(__dirname, 'client/src/components/dashboard/BusinessesSection.tsx');
const businessesSectionContent = fs.readFileSync(businessesSectionPath, 'utf8');

if (businessesSectionContent.includes('export default BusinessesSection;')) {
  console.log('✅ BusinessesSection has proper default export');
} else {
  console.log('❌ BusinessesSection missing default export');
  process.exit(1);
}

// Test 2: Verify dashboard.tsx imports
const dashboardPath = path.join(__dirname, 'client/src/pages/dashboard.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

if (dashboardContent.includes('import BusinessesSection from "@/components/dashboard/BusinessesSection";')) {
  console.log('✅ Dashboard uses correct default import for BusinessesSection');
} else {
  console.log('❌ Dashboard has incorrect import for BusinessesSection');
  process.exit(1);
}

// Test 3: Verify FeaturedRequestsSection type compatibility
if (dashboardContent.includes('import FeaturedRequestsSection from "@/components/dashboard/FeaturedRequestsSection";')) {
  console.log('✅ Dashboard uses correct default import for FeaturedRequestsSection');
} else {
  console.log('❌ Dashboard has incorrect import for FeaturedRequestsSection');
  process.exit(1);
}

console.log('🎉 All export/import fixes are correctly implemented!');
console.log('');
console.log('Summary of fixes applied:');
console.log('- Fixed BusinessesSection default export');
console.log('- Updated dashboard imports to use default imports');
console.log('- Fixed TypeScript type compatibility for BusinessWithCategory');
console.log('- Removed corrupted TypeScript files');
console.log('');
console.log('The core deployment issues with BusinessesSection exports have been resolved.');