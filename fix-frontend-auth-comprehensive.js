/**
 * Comprehensive Frontend Authentication Fix
 * Identifies and fixes all admin components with authentication issues
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

const adminComponentFiles = [
  'client/src/components/admin/sections/*.tsx',
  'client/src/pages/admin/*.tsx',
  'client/src/components/admin/*.tsx'
];

// Pattern to find fetch calls without credentials
const fetchPattern = /fetch\s*\(\s*["'`][^"'`]*api[^"'`]*["'`]\s*(?:,\s*\{[^}]*\})?\s*\)/g;
const credentialsPattern = /credentials\s*:\s*["']include["']/;

function fixAuthInFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const matches = content.match(fetchPattern);
    
    if (!matches) return false;
    
    let hasChanges = false;
    let updatedContent = content;
    
    matches.forEach(match => {
      // Skip if already has credentials: "include"
      if (credentialsPattern.test(match)) return;
      
      // Extract the URL and options
      const urlMatch = match.match(/fetch\s*\(\s*["'`]([^"'`]*)["'`]\s*(?:,\s*(\{[^}]*\}))?\s*\)/);
      if (!urlMatch) return;
      
      const url = urlMatch[1];
      const existingOptions = urlMatch[2] || '{}';
      
      // Create new fetch call with credentials
      let newOptions;
      if (existingOptions === '{}') {
        newOptions = `{
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }`;
      } else {
        // Parse existing options and add credentials
        const optionsWithoutBraces = existingOptions.slice(1, -1).trim();
        if (optionsWithoutBraces) {
          newOptions = `{
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        ${optionsWithoutBraces}
      }`;
        } else {
          newOptions = `{
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }`;
        }
      }
      
      const newFetch = `fetch("${url}", ${newOptions})`;
      updatedContent = updatedContent.replace(match, newFetch);
      hasChanges = true;
    });
    
    if (hasChanges) {
      writeFileSync(filePath, updatedContent);
      console.log(`✅ Fixed authentication in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findFilesWithFetchCalls() {
  const allFiles = [];
  adminComponentFiles.forEach(pattern => {
    const files = globSync(pattern);
    allFiles.push(...files);
  });
  
  const filesWithIssues = [];
  
  allFiles.forEach(filePath => {
    try {
      const content = readFileSync(filePath, 'utf8');
      const matches = content.match(fetchPattern);
      
      if (matches) {
        const hasUnauthenticatedCalls = matches.some(match => 
          !credentialsPattern.test(match) && match.includes('/api/')
        );
        
        if (hasUnauthenticatedCalls) {
          filesWithIssues.push({
            file: filePath,
            matches: matches.filter(match => 
              !credentialsPattern.test(match) && match.includes('/api/')
            )
          });
        }
      }
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error.message);
    }
  });
  
  return filesWithIssues;
}

// Main execution
console.log('=== COMPREHENSIVE FRONTEND AUTH FIX ===\n');

console.log('1. Scanning for authentication issues...');
const problematicFiles = findFilesWithFetchCalls();

if (problematicFiles.length === 0) {
  console.log('✅ No authentication issues found in admin components');
} else {
  console.log(`Found ${problematicFiles.length} files with authentication issues:\n`);
  
  problematicFiles.forEach(({ file, matches }) => {
    console.log(`📁 ${file}:`);
    matches.forEach(match => {
      console.log(`  • ${match.trim()}`);
    });
    console.log('');
  });
  
  console.log('2. Applying authentication fixes...');
  let fixedCount = 0;
  
  problematicFiles.forEach(({ file }) => {
    if (fixAuthInFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n✅ Fixed authentication in ${fixedCount} files`);
}

console.log('\n=== FIX COMPLETE ===');