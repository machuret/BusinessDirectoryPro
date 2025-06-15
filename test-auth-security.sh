#!/bin/bash

# Authentication Security Test Suite
# Tests authentication endpoints against live server
# Validates registration, login, session management, and security

echo "🔒 Authentication Security Test Suite"
echo "====================================="

# Configuration
SERVER_URL="http://localhost:5000"
TIMESTAMP=$(date +%s)
TEST_EMAIL="authtest-${TIMESTAMP}@example.com"
TEST_PASSWORD="securePassword123"
COOKIE_JAR="/tmp/auth-test-cookies-${TIMESTAMP}.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper functions
pass_test() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail_test() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Successful Registration
echo ""
echo "📝 Test 1: User Registration"
echo "----------------------------"

REGISTER_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$SERVER_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -c "$COOKIE_JAR" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"firstName\": \"Test\",
        \"lastName\": \"User\"
    }")

REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
REGISTER_STATUS=$(echo "$REGISTER_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$REGISTER_STATUS" = "201" ]; then
    pass_test "Registration returns 201 status"
    
    # Check if response contains expected fields
    if echo "$REGISTER_BODY" | grep -q "\"email\":\"$TEST_EMAIL\""; then
        pass_test "Registration response contains correct email"
    else
        fail_test "Registration response missing or incorrect email"
    fi
    
    # Check password is not in response
    if echo "$REGISTER_BODY" | grep -q "\"password\""; then
        fail_test "Registration response includes password (security issue)"
    else
        pass_test "Registration response excludes password field"
    fi
    
    # Extract user ID for cleanup
    USER_ID=$(echo "$REGISTER_BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    if [ -n "$USER_ID" ]; then
        pass_test "Registration response includes user ID"
    else
        fail_test "Registration response missing user ID"
    fi
else
    fail_test "Registration failed with status $REGISTER_STATUS"
    echo "Response: $REGISTER_BODY"
fi

# Test 2: Duplicate Registration Prevention
echo ""
echo "🚫 Test 2: Duplicate Registration Prevention"
echo "--------------------------------------------"

DUPLICATE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$SERVER_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"firstName\": \"Test\",
        \"lastName\": \"User\"
    }")

DUPLICATE_STATUS=$(echo "$DUPLICATE_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$DUPLICATE_STATUS" = "400" ]; then
    pass_test "Duplicate registration properly rejected with 400 status"
else
    fail_test "Duplicate registration not properly handled (status: $DUPLICATE_STATUS)"
fi

# Test 3: Successful Login
echo ""
echo "🔑 Test 3: User Login"
echo "---------------------"

LOGIN_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$SERVER_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -c "$COOKIE_JAR" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$LOGIN_STATUS" = "200" ]; then
    pass_test "Login returns 200 status"
    
    # Check session cookie was set
    if [ -f "$COOKIE_JAR" ] && grep -q "connect.sid" "$COOKIE_JAR"; then
        pass_test "Login sets session cookie"
    else
        fail_test "Login does not set session cookie"
    fi
    
    # Check password not in response
    if echo "$LOGIN_BODY" | grep -q "\"password\""; then
        fail_test "Login response includes password (security issue)"
    else
        pass_test "Login response excludes password field"
    fi
else
    fail_test "Login failed with status $LOGIN_STATUS"
    echo "Response: $LOGIN_BODY"
fi

# Test 4: Failed Login with Wrong Password
echo ""
echo "❌ Test 4: Failed Login (Wrong Password)"
echo "----------------------------------------"

WRONG_LOGIN_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$SERVER_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"wrongPassword123\"
    }")

WRONG_LOGIN_STATUS=$(echo "$WRONG_LOGIN_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$WRONG_LOGIN_STATUS" = "401" ]; then
    pass_test "Wrong password properly rejected with 401 status"
else
    fail_test "Wrong password not properly handled (status: $WRONG_LOGIN_STATUS)"
fi

# Test 5: Session Validation (Authenticated Request)
echo ""
echo "👤 Test 5: Session Management"
echo "-----------------------------"

USER_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X GET "$SERVER_URL/api/auth/user" \
    -b "$COOKIE_JAR")

USER_STATUS=$(echo "$USER_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$USER_STATUS" = "200" ]; then
    pass_test "Authenticated user endpoint accessible with session"
else
    fail_test "Session authentication failed (status: $USER_STATUS)"
fi

# Test 6: Unauthenticated Access
echo ""
echo "🚪 Test 6: Unauthenticated Access"
echo "---------------------------------"

UNAUTH_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X GET "$SERVER_URL/api/auth/user")

UNAUTH_STATUS=$(echo "$UNAUTH_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$UNAUTH_STATUS" = "401" ]; then
    pass_test "Unauthenticated access properly rejected with 401"
else
    fail_test "Unauthenticated access not properly handled (status: $UNAUTH_STATUS)"
fi

# Test 7: Logout
echo ""
echo "🚪 Test 7: Logout"
echo "-----------------"

LOGOUT_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$SERVER_URL/api/auth/logout" \
    -b "$COOKIE_JAR")

LOGOUT_STATUS=$(echo "$LOGOUT_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$LOGOUT_STATUS" = "200" ]; then
    pass_test "Logout returns 200 status"
else
    fail_test "Logout failed (status: $LOGOUT_STATUS)"
fi

# Test 8: Session Destroyed After Logout
echo ""
echo "🔒 Test 8: Session Destruction"
echo "------------------------------"

POST_LOGOUT_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X GET "$SERVER_URL/api/auth/user" \
    -b "$COOKIE_JAR")

POST_LOGOUT_STATUS=$(echo "$POST_LOGOUT_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$POST_LOGOUT_STATUS" = "401" ]; then
    pass_test "Session properly destroyed after logout"
else
    fail_test "Session not properly destroyed after logout (status: $POST_LOGOUT_STATUS)"
fi

# Test 9: Input Validation - Short Password
echo ""
echo "📋 Test 9: Input Validation"
echo "---------------------------"

SHORT_PASS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$SERVER_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"shortpass-${TIMESTAMP}@example.com\",
        \"password\": \"123\",
        \"firstName\": \"Test\",
        \"lastName\": \"User\"
    }")

SHORT_PASS_STATUS=$(echo "$SHORT_PASS_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$SHORT_PASS_STATUS" = "400" ]; then
    pass_test "Short password properly rejected"
else
    fail_test "Short password validation failed (status: $SHORT_PASS_STATUS)"
fi

# Test 10: Input Validation - Missing Fields
MISSING_FIELDS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$SERVER_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"incomplete-${TIMESTAMP}@example.com\"
    }")

MISSING_FIELDS_STATUS=$(echo "$MISSING_FIELDS_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$MISSING_FIELDS_STATUS" = "400" ]; then
    pass_test "Missing required fields properly rejected"
else
    fail_test "Missing fields validation failed (status: $MISSING_FIELDS_STATUS)"
fi

# Test 11: Non-existent User Login
echo ""
echo "👻 Test 11: Non-existent User Login"
echo "-----------------------------------"

NONEXISTENT_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$SERVER_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"nonexistent-${TIMESTAMP}@example.com\",
        \"password\": \"anyPassword123\"
    }")

NONEXISTENT_STATUS=$(echo "$NONEXISTENT_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$NONEXISTENT_STATUS" = "401" ]; then
    pass_test "Non-existent user login properly rejected"
else
    fail_test "Non-existent user handling failed (status: $NONEXISTENT_STATUS)"
fi

# Security Tests
echo ""
echo "🛡️  Additional Security Tests"
echo "=============================="

# Test 12: SQL Injection Attempt
echo ""
echo "💉 Test 12: SQL Injection Protection"
echo "------------------------------------"

SQL_INJECTION_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$SERVER_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"admin@example.com'; DROP TABLE users; --\",
        \"password\": \"password\"
    }")

SQL_INJECTION_STATUS=$(echo "$SQL_INJECTION_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$SQL_INJECTION_STATUS" = "401" ]; then
    pass_test "SQL injection attempt properly handled"
else
    warn "SQL injection test returned status $SQL_INJECTION_STATUS (review needed)"
fi

# Test 13: XSS Attempt in Name Fields
echo ""
echo "🔗 Test 13: XSS Protection"
echo "--------------------------"

XSS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$SERVER_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"xsstest-${TIMESTAMP}@example.com\",
        \"password\": \"securePassword123\",
        \"firstName\": \"<script>alert('xss')</script>\",
        \"lastName\": \"Test\"
    }")

XSS_STATUS=$(echo "$XSS_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$XSS_STATUS" = "201" ]; then
    # Check if script tags are in response (should be escaped/sanitized)
    XSS_BODY=$(echo "$XSS_RESPONSE" | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
    if echo "$XSS_BODY" | grep -q "<script>"; then
        fail_test "XSS payload not properly sanitized in response"
    else
        pass_test "XSS payload properly handled"
    fi
else
    info "XSS test registration failed with status $XSS_STATUS (input validation may have rejected it)"
fi

# Cleanup
echo ""
echo "🧹 Cleanup"
echo "----------"

# Remove cookie file
if [ -f "$COOKIE_JAR" ]; then
    rm "$COOKIE_JAR"
    info "Cleaned up test cookies"
fi

# Test Results Summary
echo ""
echo "📊 Test Results Summary"
echo "======================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(echo "scale=1; ($PASSED * 100) / $TOTAL" | bc -l)
    echo -e "${BLUE}📈 Success Rate: ${SUCCESS_RATE}%${NC}"
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All authentication tests passed!${NC}"
    echo "The authentication system is secure and functioning correctly."
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed.${NC}"
    echo "Please review the authentication implementation for security issues."
    exit 1
fi