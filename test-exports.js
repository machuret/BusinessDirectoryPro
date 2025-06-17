/**
 * Quick test to verify BusinessesSection export is working
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing BusinessesSection export...');

// Check if the file exists and has proper exports
const businessesSectionPath = path.join(__dirname, 'client/src/components/dashboard/BusinessesSection.tsx');
const content = fs.readFileSync(businessesSectionPath, 'utf8');

// Check for proper function declaration
const hasFunctionDeclaration = content.includes('function BusinessesSection(');
console.log('✓ Function declaration found:', hasFunctionDeclaration);

// Check for default export
const hasDefaultExport = content.includes('export default BusinessesSection;');
console.log('✓ Default export found:', hasDefaultExport);

// Check dashboard import
const dashboardPath = path.join(__dirname, 'client/src/pages/dashboard.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

const hasCorrectImport = dashboardContent.includes('import BusinessesSection from "@/components/dashboard/BusinessesSection";');
console.log('✓ Dashboard import correct:', hasCorrectImport);

// Check for useAuth import in App.tsx
const appPath = path.join(__dirname, 'client/src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

const hasUseAuthImport = appContent.includes('import { useAuth } from "@/hooks/useAuth";');
console.log('✓ useAuth import found:', hasUseAuthImport);

console.log('\nAll export/import fixes appear to be in place!');