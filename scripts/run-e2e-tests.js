/**
 * Comprehensive E2E Test Runner
 * Runs all Cypress E2E tests with comprehensive reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const testConfig = {
  testFiles: [
    'cypress/e2e/user-authentication.cy.ts',
    'cypress/e2e/business-management.cy.ts',
    'cypress/e2e/admin-workflows.cy.ts',
    'cypress/e2e/mobile-responsive.cy.ts',
    'cypress/e2e/public-user-journeys.cy.ts',
    'cypress/e2e/api-integration.cy.ts',
    'cypress/e2e/full-lifecycle.cy.ts'
  ],
  
  browsers: ['chrome', 'firefox', 'edge'],
  
  viewports: [
    { width: 1280, height: 720, name: 'Desktop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' }
  ],
  
  environments: ['development', 'staging', 'production']
};

// Test results storage
let testResults = {
  startTime: new Date().toISOString(),
  endTime: null,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  skippedTests: 0,
  duration: 0,
  coverage: 0,
  browsers: {},
  files: {},
  errors: []
};

// Helper functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logLevel = level.toUpperCase().padEnd(5);
  console.log(`[${timestamp}] [${logLevel}] ${message}`);
}

function executeCommand(command) {
  try {
    log(`Executing: ${command}`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    return { success: true, output };
  } catch (error) {
    log(`Command failed: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

function checkPrerequisites() {
  log('Checking prerequisites...');
  
  // Check if Cypress is installed
  const cypressCheck = executeCommand('npx cypress version');
  if (!cypressCheck.success) {
    log('Cypress not found. Please install Cypress first.', 'error');
    process.exit(1);
  }
  
  // Check if server is running
  try {
    const serverCheck = execSync('curl -s http://localhost:5000/api/health || echo "Server not running"', { encoding: 'utf8' });
    if (serverCheck.includes('Server not running')) {
      log('Server not running. Please start the server first.', 'error');
      log('Run: npm run dev', 'info');
      process.exit(1);
    }
  } catch (error) {
    log('Could not check server status. Please ensure server is running.', 'warn');
  }
  
  log('Prerequisites check completed');
}

function runTestSuite(browser = 'chrome', spec = null) {
  log(`Running test suite with browser: ${browser}`);
  
  const specParam = spec ? `--spec "${spec}"` : '';
  const command = `npx cypress run --browser ${browser} ${specParam} --reporter json --reporter-options "output=cypress/results/${browser}-results.json"`;
  
  const startTime = Date.now();
  const result = executeCommand(command);
  const endTime = Date.now();
  
  const duration = endTime - startTime;
  
  if (result.success) {
    log(`Test suite completed successfully in ${duration}ms`);
    return { success: true, duration };
  } else {
    log(`Test suite failed`, 'error');
    testResults.errors.push({
      browser,
      spec,
      error: result.error,
      timestamp: new Date().toISOString()
    });
    return { success: false, duration };
  }
}

function runMobileTests() {
  log('Running mobile responsive tests...');
  
  testConfig.viewports.forEach(viewport => {
    if (viewport.name === 'Mobile') {
      log(`Testing mobile viewport: ${viewport.width}x${viewport.height}`);
      
      const command = `npx cypress run --spec "cypress/e2e/mobile-responsive.cy.ts" --config "viewportWidth=${viewport.width},viewportHeight=${viewport.height}"`;
      
      const result = executeCommand(command);
      
      if (result.success) {
        log(`Mobile tests passed for ${viewport.name}`);
      } else {
        log(`Mobile tests failed for ${viewport.name}`, 'error');
        testResults.errors.push({
          test: 'Mobile Responsive',
          viewport: viewport.name,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    }
  });
}

function runCrossBrowserTests() {
  log('Running cross-browser tests...');
  
  testConfig.browsers.forEach(browser => {
    log(`Testing with browser: ${browser}`);
    
    const result = runTestSuite(browser);
    
    testResults.browsers[browser] = {
      success: result.success,
      duration: result.duration,
      timestamp: new Date().toISOString()
    };
  });
}

function runAPIIntegrationTests() {
  log('Running API integration tests...');
  
  const result = runTestSuite('chrome', 'cypress/e2e/api-integration.cy.ts');
  
  if (result.success) {
    log('API integration tests passed');
  } else {
    log('API integration tests failed', 'error');
  }
}

function runFullLifecycleTests() {
  log('Running full lifecycle tests...');
  
  const result = runTestSuite('chrome', 'cypress/e2e/full-lifecycle.cy.ts');
  
  if (result.success) {
    log('Full lifecycle tests passed');
  } else {
    log('Full lifecycle tests failed', 'error');
  }
}

function runAccessibilityTests() {
  log('Running accessibility tests...');
  
  // Run accessibility-focused tests
  const accessibilitySpecs = [
    'cypress/e2e/user-authentication.cy.ts',
    'cypress/e2e/public-user-journeys.cy.ts',
    'cypress/e2e/mobile-responsive.cy.ts'
  ];
  
  accessibilitySpecs.forEach(spec => {
    log(`Running accessibility tests for: ${spec}`);
    
    const result = runTestSuite('chrome', spec);
    
    if (result.success) {
      log(`Accessibility tests passed for ${spec}`);
    } else {
      log(`Accessibility tests failed for ${spec}`, 'error');
    }
  });
}

function runPerformanceTests() {
  log('Running performance tests...');
  
  // Run performance-focused tests
  const performanceSpecs = [
    'cypress/e2e/public-user-journeys.cy.ts',
    'cypress/e2e/api-integration.cy.ts'
  ];
  
  performanceSpecs.forEach(spec => {
    log(`Running performance tests for: ${spec}`);
    
    const result = runTestSuite('chrome', spec);
    
    if (result.success) {
      log(`Performance tests passed for ${spec}`);
    } else {
      log(`Performance tests failed for ${spec}`, 'error');
    }
  });
}

function runSecurityTests() {
  log('Running security tests...');
  
  // Run security-focused tests
  const securitySpecs = [
    'cypress/e2e/user-authentication.cy.ts',
    'cypress/e2e/admin-workflows.cy.ts',
    'cypress/e2e/api-integration.cy.ts'
  ];
  
  securitySpecs.forEach(spec => {
    log(`Running security tests for: ${spec}`);
    
    const result = runTestSuite('chrome', spec);
    
    if (result.success) {
      log(`Security tests passed for ${spec}`);
    } else {
      log(`Security tests failed for ${spec}`, 'error');
    }
  });
}

function parseTestResults() {
  log('Parsing test results...');
  
  const resultsDir = 'cypress/results';
  
  if (!fs.existsSync(resultsDir)) {
    log('No results directory found', 'warn');
    return;
  }
  
  const resultFiles = fs.readdirSync(resultsDir).filter(file => file.endsWith('.json'));
  
  resultFiles.forEach(file => {
    try {
      const filePath = path.join(resultsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.stats) {
        testResults.totalTests += data.stats.tests || 0;
        testResults.passedTests += data.stats.passes || 0;
        testResults.failedTests += data.stats.failures || 0;
        testResults.skippedTests += data.stats.skipped || 0;
        testResults.duration += data.stats.duration || 0;
      }
      
      // Store file-specific results
      testResults.files[file] = {
        tests: data.stats?.tests || 0,
        passes: data.stats?.passes || 0,
        failures: data.stats?.failures || 0,
        duration: data.stats?.duration || 0
      };
      
    } catch (error) {
      log(`Error parsing result file ${file}: ${error.message}`, 'error');
    }
  });
  
  // Calculate coverage
  if (testResults.totalTests > 0) {
    testResults.coverage = ((testResults.passedTests / testResults.totalTests) * 100).toFixed(2);
  }
}

function generateReport() {
  log('Generating test report...');
  
  testResults.endTime = new Date().toISOString();
  
  const reportContent = `
# E2E Test Execution Report

## Test Summary
- **Start Time**: ${testResults.startTime}
- **End Time**: ${testResults.endTime}
- **Total Duration**: ${(testResults.duration / 1000).toFixed(2)} seconds
- **Total Tests**: ${testResults.totalTests}
- **Passed**: ${testResults.passedTests}
- **Failed**: ${testResults.failedTests}
- **Skipped**: ${testResults.skippedTests}
- **Success Rate**: ${testResults.coverage}%

## Browser Results
${Object.entries(testResults.browsers).map(([browser, result]) => `
- **${browser}**: ${result.success ? '✅ PASSED' : '❌ FAILED'} (${(result.duration / 1000).toFixed(2)}s)
`).join('')}

## Test Files
${Object.entries(testResults.files).map(([file, result]) => `
- **${file}**: ${result.tests} tests, ${result.passes} passed, ${result.failures} failed
`).join('')}

## Errors
${testResults.errors.length > 0 ? testResults.errors.map(error => `
- **${error.browser || error.test}**: ${error.error}
`).join('') : 'No errors detected'}

## Recommendations
${testResults.failedTests > 0 ? '- Review failed tests and fix issues before deployment' : ''}
${testResults.coverage < 95 ? '- Consider adding more test coverage' : ''}
${testResults.errors.length > 0 ? '- Address reported errors' : ''}

---
Generated on: ${new Date().toISOString()}
`;
  
  fs.writeFileSync('cypress/reports/e2e-test-report.md', reportContent);
  log('Test report generated: cypress/reports/e2e-test-report.md');
}

function cleanupResults() {
  log('Cleaning up old results...');
  
  const resultsDir = 'cypress/results';
  const reportsDir = 'cypress/reports';
  
  // Create directories if they don't exist
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Clean old result files
  if (fs.existsSync(resultsDir)) {
    const files = fs.readdirSync(resultsDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(resultsDir, file));
    });
  }
}

// Main execution function
async function runE2ETests() {
  log('='.repeat(60));
  log('Starting Comprehensive E2E Test Suite');
  log('='.repeat(60));
  
  try {
    // Setup
    cleanupResults();
    checkPrerequisites();
    
    // Run different test categories
    log('Phase 1: Running core functionality tests...');
    runTestSuite('chrome');
    
    log('Phase 2: Running cross-browser tests...');
    runCrossBrowserTests();
    
    log('Phase 3: Running mobile responsive tests...');
    runMobileTests();
    
    log('Phase 4: Running API integration tests...');
    runAPIIntegrationTests();
    
    log('Phase 5: Running full lifecycle tests...');
    runFullLifecycleTests();
    
    log('Phase 6: Running accessibility tests...');
    runAccessibilityTests();
    
    log('Phase 7: Running performance tests...');
    runPerformanceTests();
    
    log('Phase 8: Running security tests...');
    runSecurityTests();
    
    // Parse results and generate report
    parseTestResults();
    generateReport();
    
    log('='.repeat(60));
    log('E2E Test Suite Completed');
    log(`Success Rate: ${testResults.coverage}%`);
    log(`Total Tests: ${testResults.totalTests}`);
    log(`Passed: ${testResults.passedTests}`);
    log(`Failed: ${testResults.failedTests}`);
    log('='.repeat(60));
    
    // Exit with appropriate code
    if (testResults.failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    log(`Fatal error during test execution: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const testType = args[0] || 'all';

switch (testType) {
  case 'quick':
    log('Running quick test suite...');
    runTestSuite('chrome', 'cypress/e2e/user-authentication.cy.ts');
    break;
  case 'mobile':
    log('Running mobile tests only...');
    runMobileTests();
    break;
  case 'api':
    log('Running API tests only...');
    runAPIIntegrationTests();
    break;
  case 'security':
    log('Running security tests only...');
    runSecurityTests();
    break;
  case 'all':
  default:
    runE2ETests();
    break;
}