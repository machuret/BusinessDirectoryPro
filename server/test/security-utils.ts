import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { User } from '@shared/schema';

/**
 * Security Testing Utilities
 * Provides reusable functions for ongoing security validation
 */

export interface SecurityTestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SecurityTestResult {
  passed: boolean;
  message: string;
  details?: any;
}

/**
 * Creates a test user with secure credentials for security testing
 */
export async function createSecurityTestUser(): Promise<SecurityTestUser> {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(7);
  
  return {
    id: `security-test-${timestamp}-${randomSuffix}`,
    email: `security-test-${timestamp}-${randomSuffix}@example.com`,
    password: 'SecureTestPass123!@#',
    firstName: 'Security',
    lastName: 'Tester'
  };
}

/**
 * Validates password hashing security
 */
export async function validatePasswordSecurity(userId: string, originalPassword: string): Promise<SecurityTestResult> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user || !user.password) {
      return {
        passed: false,
        message: 'User or password not found in database'
      };
    }

    // Check if password is hashed (should contain salt separator)
    if (!user.password.includes('.')) {
      return {
        passed: false,
        message: 'Password does not appear to be properly hashed'
      };
    }

    // Check if password is not stored as plain text
    if (user.password === originalPassword) {
      return {
        passed: false,
        message: 'Password stored as plain text (critical security vulnerability)'
      };
    }

    // Validate hash format (hex.hex)
    const parts = user.password.split('.');
    if (parts.length !== 2) {
      return {
        passed: false,
        message: 'Password hash format is invalid'
      };
    }

    const [hash, salt] = parts;
    const hexRegex = /^[a-f0-9]+$/i;
    
    if (!hexRegex.test(hash) || !hexRegex.test(salt)) {
      return {
        passed: false,
        message: 'Password hash or salt contains non-hexadecimal characters'
      };
    }

    if (hash.length !== 128 || salt.length !== 32) {
      return {
        passed: false,
        message: 'Password hash or salt has unexpected length'
      };
    }

    return {
      passed: true,
      message: 'Password security validation passed',
      details: {
        hashLength: hash.length,
        saltLength: salt.length,
        format: 'scrypt with salt'
      }
    };

  } catch (error) {
    return {
      passed: false,
      message: `Password security validation failed: ${error.message}`
    };
  }
}

/**
 * Tests input sanitization effectiveness
 */
export function validateInputSanitization(input: string, sanitized: string): SecurityTestResult {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /vbscript:/i,
    /data:text\/html/i
  ];

  const containsDangerousContent = dangerousPatterns.some(pattern => pattern.test(sanitized));

  if (containsDangerousContent) {
    return {
      passed: false,
      message: 'Input sanitization failed - dangerous content detected in output',
      details: {
        original: input,
        sanitized: sanitized,
        dangerousPatterns: dangerousPatterns.filter(pattern => pattern.test(sanitized))
      }
    };
  }

  // Check if HTML tags were removed
  const htmlTagPattern = /<[^>]+>/;
  if (htmlTagPattern.test(sanitized)) {
    return {
      passed: false,
      message: 'Input sanitization incomplete - HTML tags still present',
      details: {
        original: input,
        sanitized: sanitized
      }
    };
  }

  return {
    passed: true,
    message: 'Input sanitization validation passed',
    details: {
      original: input,
      sanitized: sanitized,
      removedContent: input.length - sanitized.length
    }
  };
}

/**
 * Validates session security implementation
 */
export interface SessionSecurityTest {
  sessionCreated: boolean;
  sessionDestroyed: boolean;
  unauthorizedAccess: boolean;
  sessionIsolation: boolean;
}

/**
 * Tests for common authentication vulnerabilities
 */
export const authVulnerabilityTests = {
  // SQL Injection patterns
  sqlInjectionPayloads: [
    "admin'; DROP TABLE users; --",
    "admin' OR '1'='1",
    "admin' UNION SELECT * FROM users --",
    "admin'; INSERT INTO users VALUES('hacker', 'password'); --",
    "admin' AND 1=1 --",
    "admin' OR 1=1#"
  ],

  // XSS payloads
  xssPayloads: [
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert('xss')>",
    "javascript:alert('xss')",
    "<svg onload=alert('xss')>",
    "<iframe src='javascript:alert(\"xss\")'></iframe>",
    "<input autofocus onfocus=alert('xss')>",
    "<details open ontoggle=alert('xss')>",
    "'-alert('xss')-'",
    "\"><script>alert('xss')</script>",
    "<script>eval(String.fromCharCode(97,108,101,114,116,40,39,120,115,115,39,41))</script>"
  ],

  // LDAP Injection patterns
  ldapInjectionPayloads: [
    "admin*",
    "admin)(&",
    "admin)(cn=*",
    "*)(uid=*",
    "admin)(|(uid=*))"
  ],

  // Command Injection patterns
  commandInjectionPayloads: [
    "admin; ls -la",
    "admin && cat /etc/passwd",
    "admin | whoami",
    "admin`id`",
    "admin$(id)",
    "admin;cat /etc/shadow"
  ]
};

/**
 * Validates email format security
 */
export function validateEmailSecurity(email: string): SecurityTestResult {
  // Check for dangerous characters that could lead to injection
  const dangerousChars = ['<', '>', '"', "'", '&', '%', '\\', ';', '(', ')', '{', '}'];
  const foundDangerous = dangerousChars.filter(char => email.includes(char));

  if (foundDangerous.length > 0) {
    return {
      passed: false,
      message: 'Email contains dangerous characters',
      details: {
        email: email,
        dangerousChars: foundDangerous
      }
    };
  }

  // Validate proper email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return {
      passed: false,
      message: 'Email format is invalid',
      details: { email: email }
    };
  }

  // Check for excessive length (potential DoS)
  if (email.length > 254) {
    return {
      passed: false,
      message: 'Email length exceeds RFC limits',
      details: {
        email: email,
        length: email.length,
        maxLength: 254
      }
    };
  }

  return {
    passed: true,
    message: 'Email security validation passed',
    details: {
      email: email,
      length: email.length
    }
  };
}

/**
 * Cleanup function for security test data
 */
export async function cleanupSecurityTestData(userIds: string[]): Promise<void> {
  try {
    for (const userId of userIds) {
      await db.delete(users).where(eq(users.id, userId));
    }
  } catch (error) {
    console.error('Security test cleanup error:', error);
  }
}

/**
 * Comprehensive security audit report generator
 */
export interface SecurityAuditReport {
  timestamp: string;
  overallScore: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  tests: {
    name: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    details: string;
  }[];
  recommendations: string[];
}

export function generateSecurityAuditReport(testResults: SecurityTestResult[]): SecurityAuditReport {
  const timestamp = new Date().toISOString();
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const overallScore = Math.round((passedTests / totalTests) * 100);

  const failedTests = testResults.filter(r => !r.passed);
  const vulnerabilities = {
    critical: failedTests.filter(t => t.message.includes('critical')).length,
    high: failedTests.filter(t => 
      t.message.includes('injection') || 
      t.message.includes('plain text') ||
      t.message.includes('unauthorized')
    ).length,
    medium: failedTests.filter(t => 
      t.message.includes('sanitization') || 
      t.message.includes('validation')
    ).length,
    low: failedTests.length - failedTests.filter(t => 
      t.message.includes('critical') ||
      t.message.includes('injection') || 
      t.message.includes('plain text') ||
      t.message.includes('unauthorized') ||
      t.message.includes('sanitization') || 
      t.message.includes('validation')
    ).length
  };

  const tests = testResults.map(result => ({
    name: result.message.split(':')[0] || result.message,
    status: result.passed ? 'PASS' as const : 'FAIL' as const,
    details: result.message
  }));

  const recommendations = [
    ...(!testResults.every(r => r.passed) ? ['Review and fix failed security tests'] : []),
    ...(vulnerabilities.critical > 0 ? ['Address critical vulnerabilities immediately'] : []),
    ...(vulnerabilities.high > 0 ? ['Prioritize high-severity security issues'] : []),
    'Implement automated security testing in CI/CD pipeline',
    'Regular security audits and penetration testing',
    'Keep security dependencies updated',
    'Monitor authentication logs for suspicious activity'
  ];

  return {
    timestamp,
    overallScore,
    vulnerabilities,
    tests,
    recommendations
  };
}