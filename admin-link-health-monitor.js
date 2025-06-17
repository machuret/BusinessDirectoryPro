/**
 * Admin Link Health Monitor
 * Continuously validates admin routes and prevents breakage
 */

import https from 'https';
import http from 'http';

const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  BUSINESSES: '/admin/businesses',
  USERS: '/admin/users',
  CATEGORIES: '/admin/categories',
  REVIEWS: '/admin/reviews',
  CITIES: '/admin/cities',
  SOCIAL_MEDIA: '/admin/social-media',
  FEATURED: '/admin/featured',
  PAGES: '/admin/pages',
  CONTENT: '/admin/content',
  SETTINGS: '/admin/settings',
  EXPORT: '/admin/export',
  IMPORT: '/admin/import',
  API: '/admin/api'
};

const API_ENDPOINTS = {
  BUSINESSES: '/api/admin/businesses',
  USERS: '/api/admin/users',
  CATEGORIES: '/api/admin/categories',
  REVIEWS: '/api/admin/reviews',
  CITIES: '/api/admin/cities',
  SOCIAL_MEDIA: '/api/admin/social-media',
  FEATURED: '/api/admin/featured-requests',
  PAGES: '/api/admin/pages',
  CONTENT: '/api/admin/content-strings',
  SETTINGS: '/api/admin/site-settings'
};

async function makeRequest(method, path, data = null, cookies = '') {
  const hostname = 'localhost';
  const port = 5000;
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Link-Monitor/1.0',
        ...(cookies && { 'Cookie': cookies })
      }
    };

    if (data) {
      const payload = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function authenticateAdmin() {
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (response.statusCode === 200 && response.headers['set-cookie']) {
      return response.headers['set-cookie'].join('; ');
    }
    
    return null;
  } catch (error) {
    console.error('Authentication failed:', error.message);
    return null;
  }
}

async function validateRoute(routeName, routePath, cookies = '') {
  try {
    // For admin routes, we need to check if they return proper admin interface
    const response = await makeRequest('GET', routePath, null, cookies);
    
    // Admin routes should either:
    // 1. Return 200 (authenticated access)
    // 2. Return 401 (properly protected)
    // 3. Return 302/redirect (authentication redirect)
    
    const validStatusCodes = [200, 302, 401];
    const isValid = validStatusCodes.includes(response.statusCode);
    
    return {
      route: routeName,
      path: routePath,
      status: response.statusCode,
      valid: isValid,
      issue: isValid ? null : `Invalid status code: ${response.statusCode}`
    };
  } catch (error) {
    return {
      route: routeName,
      path: routePath,
      status: 'ERROR',
      valid: false,
      issue: error.message
    };
  }
}

async function validateAPIEndpoint(endpointName, endpointPath, cookies = '') {
  try {
    const response = await makeRequest('GET', endpointPath, null, cookies);
    
    // API endpoints should return:
    // 1. 200 (successful data)
    // 2. 401 (properly protected)
    
    const validStatusCodes = [200, 401];
    const isValid = validStatusCodes.includes(response.statusCode);
    
    return {
      endpoint: endpointName,
      path: endpointPath,
      status: response.statusCode,
      valid: isValid,
      authenticated: response.statusCode === 200,
      issue: isValid ? null : `Invalid API status: ${response.statusCode}`
    };
  } catch (error) {
    return {
      endpoint: endpointName,
      path: endpointPath,
      status: 'ERROR',
      valid: false,
      authenticated: false,
      issue: error.message
    };
  }
}

async function runLinkHealthMonitor() {
  console.log('=== ADMIN LINK HEALTH MONITOR ===\n');
  
  const results = {
    routes: [],
    apis: [],
    summary: {
      totalRoutes: 0,
      validRoutes: 0,
      totalAPIs: 0,
      validAPIs: 0,
      authenticationWorking: false
    }
  };
  
  // Step 1: Test authentication
  console.log('🔐 Testing admin authentication...');
  const cookies = await authenticateAdmin();
  
  if (cookies) {
    console.log('✅ Admin authentication successful');
    results.summary.authenticationWorking = true;
  } else {
    console.log('❌ Admin authentication failed');
    results.summary.authenticationWorking = false;
  }
  
  // Step 2: Validate all admin routes
  console.log('\n📍 Validating admin routes...');
  
  for (const [routeName, routePath] of Object.entries(ADMIN_ROUTES)) {
    const result = await validateRoute(routeName, routePath, cookies);
    results.routes.push(result);
    results.summary.totalRoutes++;
    
    if (result.valid) {
      results.summary.validRoutes++;
      console.log(`✅ ${routeName}: ${routePath} (${result.status})`);
    } else {
      console.log(`❌ ${routeName}: ${routePath} - ${result.issue}`);
    }
  }
  
  // Step 3: Validate API endpoints
  console.log('\n🔌 Validating API endpoints...');
  
  for (const [endpointName, endpointPath] of Object.entries(API_ENDPOINTS)) {
    const result = await validateAPIEndpoint(endpointName, endpointPath, cookies);
    results.apis.push(result);
    results.summary.totalAPIs++;
    
    if (result.valid) {
      results.summary.validAPIs++;
      const authStatus = result.authenticated ? 'authenticated' : 'protected';
      console.log(`✅ ${endpointName}: ${endpointPath} (${result.status} - ${authStatus})`);
    } else {
      console.log(`❌ ${endpointName}: ${endpointPath} - ${result.issue}`);
    }
  }
  
  // Step 4: Generate health report
  console.log('\n================================================================');
  console.log('ADMIN LINK HEALTH REPORT');
  console.log('================================================================');
  
  console.log(`Authentication: ${results.summary.authenticationWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`Admin Routes: ${results.summary.validRoutes}/${results.summary.totalRoutes} healthy`);
  console.log(`API Endpoints: ${results.summary.validAPIs}/${results.summary.totalAPIs} healthy`);
  
  const routeHealthPercentage = Math.round((results.summary.validRoutes / results.summary.totalRoutes) * 100);
  const apiHealthPercentage = Math.round((results.summary.validAPIs / results.summary.totalAPIs) * 100);
  
  console.log(`Route Health: ${routeHealthPercentage}%`);
  console.log(`API Health: ${apiHealthPercentage}%`);
  
  // Step 5: Identify critical issues
  const criticalIssues = [];
  
  if (!results.summary.authenticationWorking) {
    criticalIssues.push('Admin authentication is broken');
  }
  
  const brokenRoutes = results.routes.filter(r => !r.valid);
  if (brokenRoutes.length > 0) {
    criticalIssues.push(`${brokenRoutes.length} admin routes are broken`);
  }
  
  const brokenAPIs = results.apis.filter(a => !a.valid);
  if (brokenAPIs.length > 0) {
    criticalIssues.push(`${brokenAPIs.length} API endpoints are broken`);
  }
  
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES DETECTED:');
    criticalIssues.forEach(issue => console.log(`• ${issue}`));
    
    console.log('\n📋 BROKEN ROUTES:');
    brokenRoutes.forEach(route => {
      console.log(`• ${route.route} (${route.path}): ${route.issue}`);
    });
    
    if (brokenAPIs.length > 0) {
      console.log('\n📋 BROKEN APIs:');
      brokenAPIs.forEach(api => {
        console.log(`• ${api.endpoint} (${api.path}): ${api.issue}`);
      });
    }
  } else {
    console.log('\n🎉 ALL ADMIN LINKS ARE HEALTHY!');
    console.log('No critical issues detected. Admin panel is fully operational.');
  }
  
  console.log('\n================================================================');
  
  return {
    healthy: criticalIssues.length === 0,
    issues: criticalIssues,
    details: results
  };
}

// Run the monitor
runLinkHealthMonitor().catch(console.error);