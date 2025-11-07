---
title: "Backend Change Request: Auth0 Post-Login Action for JWT Role Claims"
version: "0.1.0"
requestor: "Frontend Team"
target_team: "Backend Team"
priority: "P0 (Critical - Blocking Frontend Optimization)"
created: "2025-11-05"
status: "draft"
related_documents:
  - "docs/requirements/rbac-optimization-jwt-custom-claims.md"
  - "docs/09-Reports-and-History/RBAC_ARCHITECTURE_REVIEW_2025-11-05.md"
estimated_effort: "2 weeks (1 backend engineer + 1 devops engineer)"
---

# Backend Change Request: Auth0 Post-Login Action for JWT Role Claims

**From:** Frontend Team  
**To:** Backend Team  
**Date:** November 5, 2025  
**Priority:** P0 (Critical - Blocking Frontend Optimization)

---

## Executive Summary

The frontend team is implementing a critical performance optimization to reduce page load times by 60-75% (from 800-1200ms to <300ms) by eliminating redundant API calls for user role fetching. This requires backend support to embed user roles in JWT tokens during authentication.

**What We Need from Backend:**
1. Auth0 Post-Login Action to enrich JWT tokens with custom role claims
2. New internal API endpoint for Auth0 Action to fetch user roles
3. Internal API key authentication for secure Action ↔ Backend communication

**Why This Matters:**
- **Frontend Impact:** Eliminates 200-400ms API call on every page load
- **Backend Impact:** Reduces `/users/me/roles` endpoint load by 90%+ (only used as fallback)
- **User Impact:** Instant page rendering, no loading spinners, 60-75% faster experience

**Timeline:**
- Backend implementation: 2 weeks (Sprint 1)
- Frontend implementation: 6 weeks (depends on backend completion)
- Total project: 9 weeks

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Proposed Solution](#proposed-solution)
3. [Backend Requirements](#backend-requirements)
4. [API Specifications](#api-specifications)
5. [Auth0 Action Specification](#auth0-action-specification)
6. [Security Requirements](#security-requirements)
7. [Performance Requirements](#performance-requirements)
8. [Testing Requirements](#testing-requirements)
9. [Deployment Requirements](#deployment-requirements)
10. [Success Criteria](#success-criteria)
11. [Dependencies & Timeline](#dependencies--timeline)
12. [Questions for Backend Team](#questions-for-backend-team)

---

## Problem Statement

### Current Architecture (Inefficient)

**Every page load requires these API calls:**
1. Frontend → Auth0: Validate JWT token (100-200ms)
2. Frontend → Backend: `GET /users/me/roles` (200-400ms)
3. Backend → Database: Query Users + Tenants + ProjectMembers tables
4. Backend → Frontend: Return role data
5. Frontend: Render UI with permissions

**Total delay per page load:** 450-900ms before user can interact

**Backend impact:**
- ~10,000 requests/day to `/users/me/roles` endpoint
- 3 database queries per request (Users, Tenants, ProjectMembers)
- ~30,000 database queries/day for role fetching alone
- Role data rarely changes, yet fetched repeatedly

### Proposed Architecture (Optimized)

**One-time during login:**
1. User → Auth0: Authenticate
2. Auth0 Action → Backend: `GET /internal/users/:auth0UserId/roles` (internal endpoint)
3. Auth0 Action: Embed roles in JWT custom claims
4. Auth0 → Frontend: JWT with roles

**Every page load:**
1. Frontend: Parse roles from JWT token (<5ms, no API call)
2. Frontend: Render UI instantly

**Backend impact:**
- ~100 requests/day to new internal endpoint (only during login/token refresh)
- `/users/me/roles` usage drops 90%+ (only used as fallback)
- Massive reduction in database load

---

## Proposed Solution

### Architecture Diagram

```mermaid
sequenceDiagram
    participant User
    participant Auth0
    participant Auth0Action
    participant Backend
    participant Frontend

    User->>Auth0: Login
    Auth0->>Auth0Action: Trigger Post-Login Action
    
    Note over Auth0Action: New Implementation Needed
    Auth0Action->>Backend: GET /internal/users/{auth0Id}/roles
    Note over Auth0Action,Backend: New Internal API Endpoint
    
    Backend->>Backend: Query Users table
    Backend->>Backend: Query Tenants table
    Backend->>Backend: Query ProjectMembers table
    Backend-->>Auth0Action: Role data (JSON)
    
    Auth0Action->>Auth0Action: Add roles to JWT custom claims
    Auth0Action-->>Auth0: Enhanced JWT token
    Auth0-->>Frontend: JWT with roles embedded
    
    Frontend->>Frontend: Parse JWT claims (<5ms)
    Frontend-->>User: Render UI instantly
    
    Note over Frontend,Backend: No call to /users/me/roles needed
```

### What Changes for Backend

**New Components:**
1. ✅ **Internal API Endpoint:** `GET /internal/users/:auth0UserId/roles`
2. ✅ **Internal API Key Authentication:** Middleware to validate Auth0 Action requests
3. ✅ **Auth0 Post-Login Action:** JavaScript function (runs on Auth0 servers)
4. ✅ **Monitoring:** Metrics for Auth0 Action performance

**Existing Components (No Changes):**
- ❌ `/users/me/roles` endpoint remains unchanged (used as fallback)
- ❌ Database schema unchanged
- ❌ Role assignment logic unchanged

---

## Backend Requirements

### BR-1: Internal API Endpoint for Role Fetching

**Priority:** P0 (Critical)  
**Effort:** 3 days

#### BR-1.1: Create Internal API Endpoint

**Endpoint:** `GET /internal/users/:auth0UserId/roles`

**Purpose:** Allow Auth0 Post-Login Action to fetch user roles during token creation.

**Requirements:**
- **Authentication:** Internal API key only (NOT JWT-based)
- **Authorization:** No user context (system-to-system call)
- **Response Time:** <100ms (p95) - Critical for login performance
- **Rate Limiting:** 1000 requests/minute (Auth0 tenant-level)
- **Scope:** Internal only - NOT exposed publicly

**Request:**
```http
GET /internal/users/auth0|1234567890abcdef/roles
Authorization: Bearer {INTERNAL_API_KEY}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "userId": "auth0|1234567890abcdef",
  "isSuperAdmin": false,
  "isTenantOwner": true,
  "tenantId": "6543210abcdef1234567890",
  "projectRoles": [
    {
      "projectId": "proj-001",
      "role": "OWNER"
    },
    {
      "projectId": "proj-002",
      "role": "DEPUTY"
    }
  ]
}
```

**Response (404 Not Found):**
```json
{
  "error": "user_not_found",
  "message": "User with auth0UserId not found in database"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "internal_error",
  "message": "Database query failed"
}
```

**Implementation Notes:**
- Reuse existing role aggregation logic from `/users/me/roles`
- Optimize database queries (see BR-1.3)
- Return empty arrays for users with no roles (not 404)
- Limit `projectRoles` array to 10 items max (JWT size constraint)

---

#### BR-1.2: Implement Internal API Key Authentication

**Purpose:** Secure internal endpoint so only Auth0 Action can call it.

**Requirements:**
- Middleware to validate `Authorization: Bearer {INTERNAL_API_KEY}` header
- Reject requests without valid API key (401 Unauthorized)
- API key stored in environment variable (not hardcoded)
- API key rotatable without code changes

**Implementation:**
```javascript
// Middleware pseudocode
function validateInternalApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  const expectedKey = process.env.INTERNAL_API_KEY;
  
  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return res.status(401).json({ 
      error: 'unauthorized',
      message: 'Invalid or missing API key'
    });
  }
  
  next();
}

// Apply to internal routes
router.get('/internal/users/:auth0UserId/roles', 
  validateInternalApiKey, 
  getRolesHandler
);
```

**Configuration:**
```bash
# .env
INTERNAL_API_KEY=<generate-secure-random-key>  # 256-bit minimum
```

**Security Notes:**
- API key should be 256-bit random string (use `crypto.randomBytes(32).toString('hex')`)
- Store in AWS Secrets Manager / Vault (not plain .env in production)
- Rotate quarterly
- Log all requests to internal endpoints for audit trail

---

#### BR-1.3: Optimize Database Queries for Performance

**Purpose:** Ensure endpoint responds in <100ms (p95) to not slow down logins.

**Current `/users/me/roles` Performance:**
- Average: 200-400ms
- p95: 500ms
- Bottleneck: 3 sequential queries without indexing

**Target Performance:**
- Average: <50ms
- p95: <100ms

**Required Optimizations:**

1. **Database Indexing:**
   ```sql
   -- Ensure these indexes exist:
   CREATE INDEX idx_users_auth0_user_id ON users(auth0_user_id);
   CREATE INDEX idx_tenants_owner_id ON tenants(owner_id);
   CREATE INDEX idx_project_members_user_id ON project_members(user_id);
   ```

2. **Query Optimization:**
   - Use parallel queries instead of sequential
   - Use connection pooling
   - Consider caching for superadmin check

3. **Implementation Pattern:**
   ```javascript
   async function getUserRoles(auth0UserId) {
     // Parallel queries (not sequential)
     const [user, tenant, projectMemberships] = await Promise.all([
       User.findOne({ auth0UserId }),
       Tenant.findOne({ ownerId: auth0UserId }),
       ProjectMember.find({ userId: auth0UserId }).limit(10)  // JWT size limit
     ]);
     
     return {
       userId: auth0UserId,
       isSuperAdmin: user?.roles?.includes('SUPERADMIN') || false,
       isTenantOwner: !!tenant,
       tenantId: tenant?._id.toString() || null,
       projectRoles: projectMemberships.map(pm => ({
         projectId: pm.projectId.toString(),
         role: pm.role
       }))
     };
   }
   ```

**Testing:**
- Load test with 1000 requests/minute
- Validate p95 <100ms
- Monitor database query times

---

#### BR-1.4: Limit Project Roles to Prevent Token Bloat

**Purpose:** JWT tokens have size limits (~4-8KB depending on browser). Large role arrays cause tokens to exceed limits.

**Requirement:**
- Return maximum 10 project roles in response
- Sort by most recent or most important (project owner > deputy > member)
- Frontend will fall back to API for users with >10 projects

**Implementation:**
```javascript
// Limit project roles to 10
const projectMemberships = await ProjectMember
  .find({ userId: auth0UserId })
  .sort({ role: -1, createdAt: -1 })  // OWNER first, then most recent
  .limit(10);
```

**Edge Case Handling:**
- User has >10 projects → Return first 10, frontend uses API fallback
- User has 0 projects → Return empty array `[]`
- User doesn't exist → Return 404 (Auth0 Action will handle gracefully)

---

### BR-2: Auth0 Post-Login Action

**Priority:** P0 (Critical)  
**Effort:** 3 days (includes Auth0 setup)

#### BR-2.1: Implement Auth0 Post-Login Action

**What is it?**  
A JavaScript function that runs on Auth0 servers during the authentication flow, allowing us to modify the JWT token before it's issued.

**Where it runs:**  
Auth0 cloud infrastructure (not our backend servers)

**Implementation:**

```javascript
/**
 * Auth0 Post-Login Action: Enrich JWT with User Roles
 * 
 * This Action fetches user roles from the backend and embeds them
 * in the JWT token as custom claims, eliminating the need for a
 * separate API call on every page load.
 * 
 * Environment Variables (configured in Auth0 Dashboard):
 * - API_BASE_URL: Backend API base URL (e.g., https://api.mwap.dev)
 * - INTERNAL_API_KEY: Secret key for internal API authentication
 */

const axios = require('axios');

exports.onExecutePostLogin = async (event, api) => {
  const { user } = event;
  const namespace = 'https://mwap.dev/';
  
  console.log(`[Auth0 Action] Fetching roles for user: ${user.user_id}`);
  
  try {
    // Call backend internal API to fetch user roles
    const response = await axios.get(
      `${event.secrets.API_BASE_URL}/internal/users/${user.user_id}/roles`,
      {
        headers: {
          'Authorization': `Bearer ${event.secrets.INTERNAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 2000  // 2-second timeout (fail fast)
      }
    );
    
    const roles = response.data;
    
    console.log(`[Auth0 Action] Roles fetched successfully: ${JSON.stringify(roles)}`);
    
    // Add custom claims to ID token (frontend will parse this)
    api.idToken.setCustomClaim(`${namespace}roles`, {
      isSuperAdmin: roles.isSuperAdmin || false,
      isTenantOwner: roles.isTenantOwner || false,
      tenantId: roles.tenantId || null,
      projectRoles: roles.projectRoles || [],
      version: 1,  // Schema version for future evolution
      issuedAt: Date.now()
    });
    
    // Also add to access token (for API calls if needed)
    api.accessToken.setCustomClaim(`${namespace}roles`, roles);
    
    console.log('[Auth0 Action] Custom claims added successfully');
    
  } catch (error) {
    console.error('[Auth0 Action] Failed to fetch user roles:', {
      error: error.message,
      code: error.code,
      response: error.response?.status,
      userId: user.user_id
    });
    
    // Fail gracefully - issue token without custom claims
    // Frontend will fall back to API call GET /users/me/roles
    api.idToken.setCustomClaim(`${namespace}roles`, {
      fallback: true,
      error: error.code || 'role_fetch_failed',
      version: 1,
      issuedAt: Date.now()
    });
    
    console.log('[Auth0 Action] Issued token with fallback flag');
    
    // Don't throw - allow login to proceed
  }
};
```

**Key Features:**
- ✅ Fetches roles from backend internal API
- ✅ Adds roles to JWT as custom claims
- ✅ Handles errors gracefully (fallback flag)
- ✅ 2-second timeout to prevent login delays
- ✅ Comprehensive logging for debugging

**Configuration in Auth0 Dashboard:**

1. Navigate to: **Actions → Library → Create Action → Post-Login**
2. Name: "Enrich JWT with User Roles"
3. Add dependencies: `axios@1.6.0`
4. Add code above
5. Configure secrets:
   - `API_BASE_URL`: Production backend URL
   - `INTERNAL_API_KEY`: Same key from backend `.env`
6. Deploy Action
7. Add to Post-Login Flow

---

#### BR-2.2: Auth0 Action Error Handling

**Failure Scenarios:**

| Scenario | Auth0 Action Behavior | Frontend Behavior |
|----------|----------------------|-------------------|
| Backend API unreachable | Set `fallback: true` flag in token | Use API call `GET /users/me/roles` |
| Backend returns 404 | Set `fallback: true` flag | Use API call (user might be new) |
| Backend returns 500 | Set `fallback: true` flag | Use API call |
| Timeout (>2s) | Set `fallback: true` flag | Use API call |
| Backend returns invalid JSON | Set `fallback: true` flag | Use API call |

**Key Principle:** Never block login. Always issue token, even if role fetch fails.

**Monitoring:**
- Track `fallback: true` rate in frontend metrics
- Alert if fallback rate >5% (indicates backend issues)

---

#### BR-2.3: Auth0 Action Performance Optimization

**Target:** Auth0 Action should complete in <200ms (p95) to avoid slowing login.

**Optimization Strategies:**

1. **Fast Backend Response:**
   - Internal API must respond in <100ms (p95)
   - Database queries optimized with indexes
   - Connection pooling enabled

2. **Short Timeout:**
   - 2-second timeout ensures fast failure
   - Better to fall back to API than wait indefinitely

3. **Minimal Processing:**
   - No heavy computation in Action
   - No external API calls except backend
   - No retries (fail fast)

4. **Monitoring:**
   - Track Action execution time in Auth0 logs
   - Alert if p95 >200ms

**Testing:**
- Load test: 1000 logins/minute
- Measure Auth0 Action latency
- Validate login time not impacted (still <2s total)

---

### BR-3: Monitoring & Observability

**Priority:** P1 (High)  
**Effort:** 1 day

#### BR-3.1: Internal API Endpoint Metrics

**Required Metrics:**
- Request count (per minute)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database query time
- Success/failure ratio

**Implementation:**
```javascript
// Example: Express middleware for metrics
router.get('/internal/users/:auth0UserId/roles',
  validateInternalApiKey,
  metricsMiddleware('internal.users.roles'),  // Track timing
  getRolesHandler
);
```

**Dashboards:**
- Create internal API dashboard (Datadog/CloudWatch/Grafana)
- Track trends over time
- Compare with `/users/me/roles` endpoint metrics

---

#### BR-3.2: Auth0 Action Logging

**Required Logs:**
- Every Action execution (user_id, timestamp)
- Role fetch success/failure
- Response time
- Fallback flag usage
- Error details (sanitized)

**Auth0 Log Exports:**
- Configure Auth0 to export logs to CloudWatch/Datadog
- Set up alerts for error rate >5%

**Log Retention:**
- 30 days minimum
- 90 days for audit trail

---

#### BR-3.3: Alerting

**Critical Alerts:**

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Internal API down | Error rate >50% for 2 min | Critical | Page on-call, disable Auth0 Action |
| Internal API slow | p95 >200ms for 5 min | Warning | Investigate, optimize queries |
| Auth0 Action failing | Fallback rate >10% for 5 min | Critical | Check backend health, rollback if needed |
| Rate limit exceeded | Requests >1500/min | Warning | Review Auth0 traffic, adjust limits |

**Alert Channels:**
- Slack: #alerts-backend
- PagerDuty: On-call engineer
- Email: Backend team lead

---

### BR-4: Security Requirements

**Priority:** P0 (Critical)  
**Effort:** Included in BR-1 and BR-2

#### BR-4.1: Internal API Key Security

**Requirements:**
- ✅ API key generated with `crypto.randomBytes(32)` (256-bit)
- ✅ Stored in AWS Secrets Manager / Vault (not plain .env)
- ✅ Rotatable without code deployment
- ✅ Different keys for dev/staging/production
- ✅ Audit log for all internal API requests

**Key Rotation Procedure:**
1. Generate new key
2. Update in Secrets Manager
3. Update in Auth0 Action secrets
4. Old key remains valid for 24 hours (grace period)
5. Disable old key after 24 hours

**Quarterly Rotation:**
- Schedule rotation every 90 days
- Document in runbook

---

#### BR-4.2: Request Validation

**Requirements:**
- Validate `auth0UserId` format (regex: `^[a-zA-Z0-9|_-]+$`)
- Reject requests with invalid user IDs (400 Bad Request)
- Sanitize all error messages (no sensitive data in responses)
- Rate limiting: 1000 req/min per Auth0 tenant

**Implementation:**
```javascript
function validateAuth0UserId(userId) {
  const regex = /^[a-zA-Z0-9|_-]+$/;
  if (!regex.test(userId)) {
    throw new Error('Invalid auth0UserId format');
  }
  return userId;
}
```

---

#### BR-4.3: HTTPS Only

**Requirements:**
- Internal API endpoint must use HTTPS
- Reject HTTP requests (redirect to HTTPS)
- TLS 1.2+ required
- Valid SSL certificate

**Note:** Auth0 Action only calls HTTPS endpoints (enforced by Auth0)

---

### BR-5: Documentation Requirements

**Priority:** P2 (Medium)  
**Effort:** 1 day

#### BR-5.1: API Documentation

**Update backend API documentation with:**
- New internal endpoint specification
- Authentication requirements (internal API key)
- Response format and examples
- Error codes and handling
- Performance characteristics

**Location:** Backend API docs (Swagger/OpenAPI)

---

#### BR-5.2: Auth0 Action Documentation

**Create documentation for:**
- Auth0 Action setup instructions
- Environment variable configuration
- Troubleshooting guide
- Rollback procedure
- Monitoring and alerting

**Location:** Backend runbook / deployment docs

---

#### BR-5.3: Runbook for On-Call

**Create runbook covering:**
- How to disable Auth0 Action (emergency)
- How to check Auth0 Action logs
- How to investigate internal API failures
- How to rotate internal API key
- Common failure scenarios and resolutions

**Location:** On-call documentation

---

## API Specifications

### Internal Endpoint: GET /internal/users/:auth0UserId/roles

**Base URL:** `https://api.mwap.dev` (production)

**Full Endpoint:** `GET /internal/users/:auth0UserId/roles`

**Authentication:** Internal API key (Bearer token)

**Authorization:** None (system-to-system call)

**Rate Limiting:** 1000 requests/minute

**Request Headers:**
```http
Authorization: Bearer {INTERNAL_API_KEY}
Content-Type: application/json
User-Agent: Auth0-Action/1.0
```

**Path Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `auth0UserId` | string | Yes | Auth0 user ID from JWT | `auth0\|1234567890abcdef` |

**Response Format:**

**Success (200 OK):**
```json
{
  "userId": "auth0|1234567890abcdef",
  "isSuperAdmin": false,
  "isTenantOwner": true,
  "tenantId": "6543210abcdef1234567890",
  "projectRoles": [
    {
      "projectId": "proj-abc123",
      "role": "OWNER"
    },
    {
      "projectId": "proj-xyz789",
      "role": "DEPUTY"
    }
  ]
}
```

**Field Specifications:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `userId` | string | Yes | Same as input `auth0UserId` | Auth0 user identifier |
| `isSuperAdmin` | boolean | Yes | - | User has platform-wide admin access |
| `isTenantOwner` | boolean | Yes | - | User owns a tenant |
| `tenantId` | string \| null | Yes | MongoDB ObjectId or null | Owned tenant ID (null if not owner) |
| `projectRoles` | array | Yes | Max 10 items | Project memberships |
| `projectRoles[].projectId` | string | Yes | MongoDB ObjectId | Project identifier |
| `projectRoles[].role` | string | Yes | Enum: `OWNER`, `DEPUTY`, `MEMBER` | User's role in project |

**Error Responses:**

**401 Unauthorized** - Invalid API key:
```json
{
  "error": "unauthorized",
  "message": "Invalid or missing API key"
}
```

**404 Not Found** - User doesn't exist:
```json
{
  "error": "user_not_found",
  "message": "User with auth0UserId not found in database"
}
```

**400 Bad Request** - Invalid user ID format:
```json
{
  "error": "invalid_request",
  "message": "Invalid auth0UserId format"
}
```

**500 Internal Server Error** - Database failure:
```json
{
  "error": "internal_error",
  "message": "Database query failed"
}
```

**503 Service Unavailable** - Database unreachable:
```json
{
  "error": "service_unavailable",
  "message": "Database temporarily unavailable"
}
```

---

## Auth0 Action Specification

### Action Details

**Name:** Enrich JWT with User Roles  
**Type:** Post-Login Action  
**Trigger:** After user authenticates, before JWT token is issued  
**Language:** Node.js 18  
**Runtime:** Auth0 Cloud

### Dependencies

```json
{
  "dependencies": {
    "axios": "1.6.0"
  }
}
```

### Environment Variables (Secrets)

Configure in Auth0 Dashboard → Actions → Library → [Action Name] → Secrets:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `API_BASE_URL` | `https://api.mwap.dev` | Backend API base URL |
| `INTERNAL_API_KEY` | `a1b2c3d4e5f6...` | Secret key for internal API auth |

**Security Note:** These secrets are encrypted by Auth0 and only available to the Action at runtime.

### Action Flow Diagram

```mermaid
graph TD
    A[User Authenticates] --> B[Auth0 Validates Credentials]
    B --> C{Post-Login Action Triggered}
    C --> D[Fetch Roles from Backend]
    D --> E{Backend Responds?}
    E -->|Success| F[Add Roles to JWT Claims]
    E -->|Failure/Timeout| G[Add Fallback Flag to JWT]
    F --> H[Issue JWT Token]
    G --> H
    H --> I[Send to Frontend]
```

### Performance Characteristics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Execution Time | <200ms (p95) | >500ms for 5 min |
| Success Rate | >95% | <90% for 5 min |
| Timeout Rate | <5% | >10% for 5 min |

### Testing Strategy

**Unit Testing:**
- Mock backend API responses
- Test success scenarios
- Test all error scenarios (404, 500, timeout)
- Test fallback flag logic

**Integration Testing:**
- Test with real backend (staging environment)
- Test with 1000+ logins/minute load
- Measure latency impact on login flow

**Production Validation:**
- Deploy to Auth0 dev environment first
- Test with test users
- Monitor logs for errors
- Gradual rollout (see Deployment section)

---

## Security Requirements

### SEC-1: Authentication & Authorization

**Requirements:**
- ✅ Internal API endpoint requires API key authentication
- ✅ API key is 256-bit random string (not guessable)
- ✅ API key stored securely (Secrets Manager, not git)
- ✅ No user authentication required (system-to-system)
- ✅ Endpoint not exposed publicly (internal only)

**Validation:**
- Attempt to call endpoint without API key → 401 Unauthorized
- Attempt with invalid API key → 401 Unauthorized
- Attempt from public internet (if possible) → Should fail at firewall/VPC level

---

### SEC-2: Data Protection

**Requirements:**
- ✅ All communication over HTTPS (TLS 1.2+)
- ✅ No sensitive data in logs (sanitize user IDs, truncate to 8 chars)
- ✅ No PII in JWT claims (only role flags and IDs)
- ✅ JWT tokens signed by Auth0 (not modifiable by client)

**Note:** Frontend will still validate all permissions on API requests. JWT claims are for UI rendering only, NOT for backend authorization.

---

### SEC-3: Rate Limiting

**Requirements:**
- ✅ Internal API endpoint: 1000 req/min max
- ✅ Reject excess requests with 429 Too Many Requests
- ✅ Rate limit per Auth0 tenant ID (if applicable)
- ✅ Allow burst up to 1500 req/min for 30 seconds

**Implementation:**
- Use existing rate limiting middleware
- Configure for internal endpoint

---

### SEC-4: Audit Logging

**Requirements:**
- ✅ Log every request to internal API endpoint
- ✅ Include: timestamp, user_id (truncated), response time, status code
- ✅ Exclude: API key, full user_id, sensitive data
- ✅ Retention: 90 days minimum
- ✅ Tamper-proof logs (append-only)

**Example Log Entry:**
```json
{
  "timestamp": "2025-11-05T12:34:56.789Z",
  "endpoint": "/internal/users/*/roles",
  "user_id_prefix": "auth0|12",
  "response_time_ms": 45,
  "status_code": 200,
  "source": "auth0_action"
}
```

---

## Performance Requirements

### PERF-1: Response Time

**Requirements:**
- **p50:** <50ms
- **p95:** <100ms
- **p99:** <200ms

**Rationale:** Fast response critical to avoid slowing down login flow.

**Testing:**
- Load test with 1000 concurrent requests
- Measure at Auth0 Action level (include network latency)
- Validate in production with real user traffic

---

### PERF-2: Database Query Optimization

**Requirements:**
- Use parallel queries (not sequential)
- Implement proper database indexes
- Use connection pooling
- Cache superadmin check if possible (infrequent changes)

**Validation:**
- Monitor database query time separately
- Should be <30ms for indexed queries

---

### PERF-3: Scalability

**Requirements:**
- Support 10,000+ logins/day without degradation
- Support burst of 1000 logins/minute (e.g., morning rush)
- Auto-scale backend to handle load

**Testing:**
- Load test with 1000 req/min sustained for 10 minutes
- Measure response time degradation
- Validate auto-scaling triggers

---

## Testing Requirements

### TEST-1: Unit Tests

**Backend Internal API:**
- [ ] Test authentication middleware (valid key, invalid key, missing key)
- [ ] Test role aggregation logic (all role combinations)
- [ ] Test edge cases (user doesn't exist, user has no roles, user has >10 projects)
- [ ] Test error handling (database errors, timeout)

**Auth0 Action:**
- [ ] Mock backend API and test Action logic
- [ ] Test fallback flag on error
- [ ] Test timeout handling
- [ ] Test custom claims structure

---

### TEST-2: Integration Tests

**End-to-End:**
- [ ] Deploy Action to Auth0 dev environment
- [ ] Authenticate with test user
- [ ] Validate JWT contains correct custom claims
- [ ] Validate roles match database state
- [ ] Test fallback: Shut down backend, validate fallback flag in JWT

**Performance:**
- [ ] Load test: 1000 req/min for 10 minutes
- [ ] Measure Auth0 Action execution time
- [ ] Measure internal API response time
- [ ] Validate no degradation

---

### TEST-3: Security Tests

**Penetration Testing:**
- [ ] Attempt to call internal API without API key
- [ ] Attempt to call with invalid API key
- [ ] Attempt SQL injection in `auth0UserId` parameter
- [ ] Attempt to guess API key (brute force)
- [ ] Validate rate limiting works

**Audit:**
- [ ] Review Auth0 Action code for security issues
- [ ] Review API key storage (not in git)
- [ ] Review HTTPS configuration
- [ ] Review logging (no sensitive data)

---

## Deployment Requirements

### DEP-1: Deployment Phases

**Phase 1: Development Environment (Week 1)**
- [ ] Implement internal API endpoint in dev backend
- [ ] Generate dev API key
- [ ] Create Auth0 Action in Auth0 dev environment
- [ ] Configure Action secrets (dev backend URL + dev API key)
- [ ] Test with dev frontend

**Phase 2: Staging Environment (Week 2)**
- [ ] Deploy internal API endpoint to staging backend
- [ ] Generate staging API key
- [ ] Deploy Auth0 Action to Auth0 staging
- [ ] Load test (1000 req/min)
- [ ] Security testing

**Phase 3: Production Deployment (Week 3)**
- [ ] Deploy internal API endpoint to production backend
- [ ] Generate production API key (store in Secrets Manager)
- [ ] Create Auth0 Action in Auth0 production
- [ ] Configure Action secrets (production URL + production key)
- [ ] Enable Action but keep disabled in flow (testing phase)

**Phase 4: Production Enablement (Week 3)**
- [ ] Monitor internal API metrics (no load yet)
- [ ] Enable Action in Auth0 Post-Login flow
- [ ] Monitor first 100 logins
- [ ] Validate JWT claims structure
- [ ] Monitor for 48 hours before declaring success

---

### DEP-2: Rollback Procedure

**If Auth0 Action Causes Issues:**

1. **Immediate Rollback (<5 minutes):**
   - Login to Auth0 Dashboard
   - Navigate to Actions → Flows → Login
   - Remove Action from flow (drag to sidebar)
   - Save flow
   - Frontend automatically falls back to API

2. **Investigate:**
   - Check Auth0 Action logs
   - Check internal API metrics
   - Check backend error logs
   - Identify root cause

3. **Fix and Retry:**
   - Fix issue in dev/staging
   - Re-test thoroughly
   - Re-enable in production

**Rollback Triggers:**
- Auth0 login failure rate >1%
- Internal API error rate >10%
- Auth0 Action execution time >500ms (p95)
- Frontend reports high fallback rate (>10%)

---

### DEP-3: Database Migration

**Required:**
- [ ] Create indexes (if not exist):
  ```sql
  CREATE INDEX IF NOT EXISTS idx_users_auth0_user_id ON users(auth0_user_id);
  CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON tenants(owner_id);
  CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
  ```

**Note:** No schema changes required. Only indexes for performance.

**Deployment:**
- Run during low-traffic period (or create indexes with `CONCURRENTLY` to avoid locks)
- Validate indexes created successfully
- Monitor query performance improvement

---

## Success Criteria

### Functional Success Criteria

- [ ] ✅ Internal API endpoint deployed and responding in <100ms (p95)
- [ ] ✅ Auth0 Action deployed and adding custom claims to JWT tokens
- [ ] ✅ JWT custom claims structure matches specification
- [ ] ✅ Fallback mechanism works (Auth0 Action handles errors gracefully)
- [ ] ✅ Frontend can parse JWT claims successfully
- [ ] ✅ No increase in login failure rate
- [ ] ✅ Security tests pass (API key authentication, HTTPS, rate limiting)

### Performance Success Criteria

- [ ] ✅ Internal API response time: <100ms (p95)
- [ ] ✅ Auth0 Action execution time: <200ms (p95)
- [ ] ✅ Total login time unchanged or faster (not slower)
- [ ] ✅ Load test passes: 1000 req/min sustained for 10 minutes
- [ ] ✅ Database query time: <30ms (p95)

### Business Success Criteria

- [ ] ✅ `/users/me/roles` endpoint load reduced by 90%+
- [ ] ✅ Database query load reduced by 90%+
- [ ] ✅ No user-impacting issues during rollout
- [ ] ✅ Monitoring and alerting functional
- [ ] ✅ Documentation complete

---

## Dependencies & Timeline

### Dependencies

**Blockers for Backend Implementation:**
- None - Backend can start immediately

**Blockers for Frontend Implementation:**
- ⚠️ Backend internal API endpoint deployed to production
- ⚠️ Auth0 Action deployed and enabled in production
- ⚠️ JWT custom claims validated in staging

**External Dependencies:**
- Auth0 platform (SaaS, assumed available)
- AWS Secrets Manager / Vault for API key storage

---

### Timeline

```
Week 1 (Backend Team):
├─ Day 1-2: Implement internal API endpoint
├─ Day 3: Add authentication middleware
├─ Day 4: Optimize database queries + add indexes
└─ Day 5: Write unit tests + deploy to dev

Week 2 (Backend + DevOps):
├─ Day 1-2: Implement Auth0 Action
├─ Day 3: Deploy to staging + integration tests
├─ Day 4: Load testing + security testing
└─ Day 5: Documentation + deploy to production (disabled)

Week 3 (Backend + Frontend):
├─ Day 1: Enable Auth0 Action in production
├─ Day 2-3: Monitor production (backend)
├─ Day 4-5: Frontend integration testing
└─ Week 3+: Frontend implementation (6 weeks, parallel)
```

**Total Backend Effort:** 2 weeks  
**Team:** 1 Backend Engineer + 0.5 DevOps Engineer

**Critical Path:** Backend blocks frontend implementation. Frontend needs backend completed before Week 3.

---

## Questions for Backend Team

### Technical Questions

1. **Database Performance:**
   - Do the required indexes already exist? If not, can we create them without locking tables?
   - Current query performance for `/users/me/roles` endpoint?
   - Are we already using connection pooling?

2. **Infrastructure:**
   - Where should we store the internal API key? (AWS Secrets Manager? Vault? Environment variable?)
   - Is there existing middleware for API key authentication we can reuse?
   - Do we have rate limiting infrastructure in place?

3. **Auth0 Configuration:**
   - Who has access to Auth0 Dashboard (Actions configuration)?
   - Do we have Auth0 dev/staging environments for testing?
   - Current Auth0 login volume per day?

4. **Monitoring:**
   - What monitoring tools are we using? (Datadog? CloudWatch? Grafana?)
   - How should we export Auth0 Action logs?
   - Who should receive alerts from internal API?

---

### Process Questions

5. **Timeline:**
   - Is 2-week timeline realistic for your team?
   - Any competing priorities that would delay this?
   - When can you start implementation?

6. **Deployment:**
   - Standard deployment process for new API endpoints?
   - Approval required for database index changes?
   - Process for Auth0 Action deployment?

7. **Testing:**
   - Do you have load testing infrastructure?
   - Security review required before production?
   - Frontend team involvement needed for integration tests?

---

### Clarification Questions

8. **Scope Confirmation:**
   - Is the internal API endpoint specification clear?
   - Any concerns about Auth0 Action approach?
   - Any alternative approaches we should consider?

9. **Post-Deployment:**
   - On-call support for first week after production deployment?
   - Runbook ownership (backend or DevOps)?
   - Process for API key rotation?

---

## Appendix

### A. Example cURL Request

```bash
# Test internal API endpoint
curl -X GET \
  https://api.mwap.dev/internal/users/auth0%7C1234567890abcdef/roles \
  -H "Authorization: Bearer YOUR_INTERNAL_API_KEY" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "userId": "auth0|1234567890abcdef",
  "isSuperAdmin": false,
  "isTenantOwner": true,
  "tenantId": "6543210abcdef1234567890",
  "projectRoles": [
    {"projectId": "proj-001", "role": "OWNER"}
  ]
}
```

---

### B. JWT Token Example (Decoded)

**Before (Current):**
```json
{
  "sub": "auth0|1234567890abcdef",
  "email": "user@example.com",
  "iat": 1699200000,
  "exp": 1699203600
}
```

**After (With Custom Claims):**
```json
{
  "sub": "auth0|1234567890abcdef",
  "email": "user@example.com",
  "iat": 1699200000,
  "exp": 1699203600,
  "https://mwap.dev/roles": {
    "isSuperAdmin": false,
    "isTenantOwner": true,
    "tenantId": "6543210abcdef1234567890",
    "projectRoles": [
      {"projectId": "proj-001", "role": "OWNER"}
    ],
    "version": 1,
    "issuedAt": 1699200000000
  }
}
```

**Token Size:**
- Current: ~200 bytes
- With roles (10 projects): ~1.5KB
- JWT size limit: 4-8KB (browser-dependent)
- **Conclusion:** Safe margin, no issues expected

---

### C. Database Index SQL

```sql
-- PostgreSQL / MySQL compatible
-- Run during low-traffic period or use CONCURRENTLY

-- Index for Users table lookup by Auth0 user ID
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_auth0_user_id 
ON users(auth0_user_id);

-- Index for Tenants table lookup by owner ID
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_owner_id 
ON tenants(owner_id);

-- Index for ProjectMembers table lookup by user ID
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_members_user_id 
ON project_members(user_id);

-- Verify indexes created
SELECT 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE indexname IN (
  'idx_users_auth0_user_id',
  'idx_tenants_owner_id', 
  'idx_project_members_user_id'
);
```

---

### D. Auth0 Action Testing Checklist

**Before Production Deployment:**

- [ ] Action code reviewed by backend lead
- [ ] Unit tests pass (mocked backend)
- [ ] Deployed to Auth0 dev environment
- [ ] Tested with dev backend (success scenario)
- [ ] Tested with backend down (fallback scenario)
- [ ] Tested with backend slow (timeout scenario)
- [ ] Tested with backend returning 404/500 (error scenarios)
- [ ] JWT custom claims structure validated
- [ ] Frontend team confirms JWT claims parse correctly
- [ ] Load tested (1000 logins/minute)
- [ ] Security reviewed (secrets not exposed)
- [ ] Monitoring configured (logs exported)
- [ ] Runbook created (rollback procedure documented)

---

### E. Monitoring Dashboard Requirements

**Dashboard: Auth0 Action + Internal API**

**Metrics to Display:**

1. **Auth0 Action:**
   - Execution count (per minute)
   - Execution time (p50, p95, p99)
   - Success rate (%)
   - Fallback rate (%)
   - Error rate by type

2. **Internal API:**
   - Request count (per minute)
   - Response time (p50, p95, p99)
   - Error rate (4xx, 5xx)
   - Database query time
   - Rate limit rejections

3. **Comparison:**
   - `/users/me/roles` request count (should decrease 90%+)
   - Database query load (should decrease 90%+)

**Alerts:**
- Auth0 Action execution time >500ms (p95) → Warning
- Auth0 Action fallback rate >10% → Critical
- Internal API error rate >10% → Critical
- Internal API response time >200ms (p95) → Warning

---

## Contact & Support

**Frontend Team Contact:**
- **Lead:** [Frontend Tech Lead Name]
- **Email:** frontend-team@mwap.dev
- **Slack:** #frontend-team

**Questions?**
- Post in: #backend-frontend-sync channel
- Tag: @backend-team @frontend-lead

**Change Request Status:**
- **Created:** 2025-11-05
- **Status:** Draft - Awaiting Backend Team Review
- **Next Steps:** Schedule kickoff meeting

---

## Approval

**Requestor Approval:**

| Role | Name | Approval | Date |
|------|------|----------|------|
| Frontend Tech Lead | TBD | ⏳ Pending | - |
| Engineering Manager | TBD | ⏳ Pending | - |

**Backend Team Acknowledgment:**

| Role | Name | Acknowledged | Date | Notes |
|------|------|--------------|------|-------|
| Backend Tech Lead | TBD | ⏳ Pending | - | - |
| Backend Engineer (Assigned) | TBD | ⏳ Pending | - | - |
| DevOps Engineer (Assigned) | TBD | ⏳ Pending | - | - |

**Next Steps:**
1. Backend team reviews this change request
2. Schedule kickoff meeting (Frontend + Backend + DevOps)
3. Backend team creates their own requirements document
4. Backend team provides effort estimate and timeline confirmation
5. Proceed with implementation

---

**End of Change Request**

**Thank you, Backend Team! This is a critical performance optimization that will benefit all our users. We're here to support you throughout the implementation. Let's make MWAP blazing fast together! 🚀**

