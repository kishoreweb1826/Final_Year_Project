# Production Deployment Debugging Report
**Date**: May 7, 2026  
**Project**: OrganicFarm Full-Stack Application  
**Environment**: React (Vercel) → Spring Boot (Render) → PostgreSQL (Neon)

---

## EXECUTIVE SUMMARY

The application has **6 critical production issues** stemming from:
1. **CORS misconfiguration** - Wildcard patterns not properly parsed
2. **Email service missing error logging** - OTP failures go silent in production
3. **Frontend timeout issues** - 15-second limit too short for Render cold starts
4. **Admin API N+1 query problem** - Fetches farmer data inefficiently
5. **Missing error handler interceptor** - Backend exceptions return raw stack traces
6. **Render cold start delays** - Free tier sleeps after 50s of inactivity, causing timeouts

---

## DETAILED ROOT CAUSE ANALYSIS

### ISSUE #1: OTP Email Verification Not Working After Deployment

**Root Cause**:
- In `EmailVerificationService.sendVerificationOtp()`, if email sending fails, it throws `OtpSendException`
- The exception is caught by Spring but there's **no proper error response formatter**
- Frontend receives raw exception or 500 error with minimal context
- Database transaction may roll back if email fails, losing OTP record

**Impact**: User can't complete registration because OTP email never arrives or backend returns unclear error.

---

### ISSUE #2: Create/Register Button Keeps Loading Forever

**Root Cause**:
- **Frontend timeout**: API calls have 15-second timeout, but Render cold starts take 30-60 seconds
- **No retry logic**: Failed request just stays in loading state
- **CORS preflight failures**: Browser OPTIONS request fails, main request never sent
- **Network condition handling**: `isNetworkError()` doesn't catch all failure scenarios

**Impact**: User sees infinite loading spinner even though backend is starting up.

---

### ISSUE #3: Admin Dashboard Cannot Fetch Farmer Verification Data

**Root Cause**:
- `AdminController.getPendingFarmers()` has **N+1 query problem**
  - Fetches all FARMER users: 1 query
  - For each farmer, fetches registration: N queries
- With 100+ farmers, this means 100+ database roundtrips
- **Result**: Query times out, admin page shows "Unable to fetch data"
- Additionally, the `findByRoleAndFarmerApproved()` queries might not be indexed

**Impact**: Admin verification page doesn't load, blocking farmer approval workflow.

---

### ISSUE #4: In Admin Verification Page (Unable to Fetch Data)

**Root Cause**:
- No pagination: Fetches ALL farmers on single request
- No error response interceptor: 500 errors don't have proper error message
- Frontend doesn't handle HTTP errors properly

**Impact**: Admin dashboard fails silently without diagnostic information.

---

### ISSUE #5: Email Sending Worked Locally, Fails in Hosted Environment

**Root Cause**:
1. **SMTP Connection Issues**:
   - Render's free tier may have network restrictions
   - SSL/TLS certificate verification might fail
   - Gmail app password might expire or be blocked due to "suspicious login"

2. **Missing Logging**: 
   - Error is caught and logged but information is insufficient
   - No retry mechanism or fallback

3. **Environment Variable Issues**:
   - `MAIL_PASSWORD` might not be set on Render dashboard
   - `MAIL_USERNAME` configuration incorrect

**Impact**: OTP emails never reach users, registration stops.

---

### ISSUE #6: Render Free Tier Cold Start Timeout

**Root Cause**:
- Render free tier automatically spins down after 50 seconds of inactivity
- Spring Boot startup takes 15-45 seconds on cold start
- Frontend timeout is only 15 seconds (fires before server is ready)
- No health check endpoint to warm up the backend

**Impact**: First user request after inactivity takes 60+ seconds and times out.

---

## DEPLOYMENT ISSUES BREAKDOWN

### CORS Configuration Problem
**File**: `SecurityConfig.java` line 56

```java
config.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
```

**Problem**: 
- Takes comma-separated string: `"http://localhost:5173,http://localhost:3000,https://*.vercel.app,https://final-year-project-pi-eight.vercel.app"`
- Splits by comma
- `https://*.vercel.app` is treated as literal string, not wildcard pattern
- Vercel URL doesn't match the pattern regex

**Fix**: Use proper ant-style pattern matching or specific URL.

---

### Missing Global Exception Handler

**Problem**: Backend throws exceptions without proper error formatting
- `OtpSendException` not caught by global handler
- Frontend receives raw 500 errors
- No standardized error response format

**File**: None exists - needs to be created

---

### N+1 Query Problem in Admin Endpoint

**File**: `AdminController.java` line 48

```java
List<User> pending = userRepository.findByRoleAndFarmerApproved(User.UserRole.FARMER, false);
List<Map<String, Object>> result = pending.stream().map(u -> {
    // ... 
    farmerRegistrationRepository.findByEmail(u.getEmail()).ifPresent(reg -> {
        // Database query inside loop! N+1 problem
    });
});
```

**Problem**: Queries database for each farmer sequentially.

**Fix**: Use JOIN query to fetch all data in single database roundtrip.

---

### Frontend Timeout Too Short

**File**: `api.js` line 46

```javascript
const timeout = setTimeout(() => controller.abort(), 15000);
```

**Problem**: 15 seconds is too short for Render cold start (30-60 seconds on first request).

**Fix**: Increase to 60 seconds, add exponential backoff retry logic.

---

### Missing Production Logging

**Problem**: Production errors aren't logged properly for debugging.

**Solution**: Add request/response logging middleware in Spring Boot.

---

## FIXES PROVIDED

### A) FRONTEND FIXES

#### 1. Enhanced API Configuration with Retry Logic
**File**: `react-app/src/services/api.js`

See provided fix below.

#### 2. Better Error Handling and Network Detection
- Add exponential backoff retry
- Proper timeout handling
- Network error detection

---

### B) BACKEND FIXES

#### 1. Global Exception Handler
**File**: Create `exception/GlobalExceptionHandler.java`

Catches all exceptions and returns consistent error format.

#### 2. Fixed CORS Configuration
**File**: `security/SecurityConfig.java`

Use proper pattern matching for Vercel URLs.

#### 3. Admin Endpoint Optimization
**File**: `controller/AdminController.java`

Add pagination and optimize queries with JOIN.

#### 4. Email Service Improvements
**File**: `service/EmailVerificationService.java`

Add detailed error logging and retry mechanism.

#### 5. Health Check Endpoint
**File**: Create `controller/HealthController.java`

Simple endpoint to warm up Render backend on deployment.

---

## EXACT FIXES APPLIED

See the detailed code fixes in the implementation section below.

