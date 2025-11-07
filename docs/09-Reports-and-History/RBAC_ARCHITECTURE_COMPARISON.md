# RBAC Architecture Comparison: Current vs Proposed

**Related:** [RBAC Architecture Review](./RBAC_ARCHITECTURE_REVIEW_2025-11-05.md) | [Executive Summary](./RBAC_REVIEW_EXECUTIVE_SUMMARY.md)

This document provides visual comparison between current and proposed RBAC architectures.

---

## Current Architecture: API-Based Role Fetching

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER PAGE LOAD                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────┐
         │   1. Check Authentication Status       │
         │   Auth0 SDK verifies session           │
         │   Time: 100-200ms                      │
         └────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────┐
         │   2. Check localStorage Cache          │
         │   TTL: 15 minutes                      │
         │   Cache Hit Rate: ~60%                 │
         └────────────────────────────────────────┘
                    │                         │
                    ▼ Cache HIT               ▼ Cache MISS
         ┌──────────────────┐      ┌────────────────────────────┐
         │  Use Cached      │      │  3. API Call: GET          │
         │  Roles           │      │     /users/me/roles        │
         │  Time: <5ms      │      │                            │
         └──────────────────┘      │  Backend Queries:          │
                    │              │  - User table              │
                    │              │  - Tenant ownership        │
                    │              │  - Project memberships     │
                    │              │                            │
                    │              │  Time: 200-400ms           │
                    │              └────────────────────────────┘
                    │                         │
                    │                         ▼
                    │              ┌────────────────────────────┐
                    │              │  4. Store in Caches        │
                    │              │  - localStorage            │
                    │              │  - React Query             │
                    │              │  Time: 50-100ms            │
                    │              └────────────────────────────┘
                    │                         │
                    └──────────┬──────────────┘
                               ▼
         ┌────────────────────────────────────────┐
         │   5. Derive Permission Flags           │
         │   - isSuperAdmin                       │
         │   - isTenantOwner                      │
         │   - hasProjectRole(id)                 │
         │   Time: 10-20ms                        │
         └────────────────────────────────────────┘
                               │
                               ▼
         ┌────────────────────────────────────────┐
         │   6. Trigger Component Re-renders      │
         │   Multiple conditional renders         │
         │   Time: 100-200ms                      │
         └────────────────────────────────────────┘
                               │
                               ▼
         ┌────────────────────────────────────────┐
         │   USER SEES CONTENT                    │
         │   Total Time: 460-920ms (cache miss)   │
         │   Total Time: 210-420ms (cache hit)    │
         └────────────────────────────────────────┘
```

### Pain Points

❌ **Multiple Network Round-Trips**
- Cache miss: 1 additional API call per page
- 40% of page loads result in cache miss

❌ **Complex Cache Management**
- Two cache layers (localStorage + React Query)
- Manual TTL management
- Race conditions between caches

❌ **Loading State Overhead**
- Every page shows loading spinner
- Delayed UI rendering
- Poor perceived performance

❌ **Distributed Permission Logic**
- 29 files contain permission checks
- Inconsistent patterns
- Hard to audit

---

## Proposed Architecture: JWT Custom Claims

```
┌─────────────────────────────────────────────────────────────────────┐
│                       USER LOGIN (One-time)                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────┐
         │   Auth0 Authentication                 │
         │   User enters credentials              │
         └────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────┐
         │   Auth0 Post-Login Action              │
         │   (Server-side, during token creation) │
         │                                        │
         │   1. Call Backend Internal API         │
         │      GET /internal/users/:id/roles     │
         │      Time: 100-200ms                   │
         │                                        │
         │   2. Embed Roles in JWT Token          │
         │      Custom Claims:                    │
         │      - isSuperAdmin                    │
         │      - isTenantOwner                   │
         │      - tenantId                        │
         │      - projectRoles[] (max 10)         │
         │                                        │
         │   Total Time: 150-250ms (one-time)     │
         └────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────┐
         │   Auth0 Issues JWT with Roles          │
         │   Token stored in Auth0 SDK cache      │
         └────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                         USER PAGE LOAD                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────┐
         │   1. Get JWT from Auth0 SDK            │
         │   Token already in memory              │
         │   Time: <5ms                           │
         └────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────┐
         │   2. Parse JWT Claims (Client-side)    │
         │   Extract custom claims:               │
         │   - 'https://mwap.dev/roles'           │
         │   Time: <5ms                           │
         └────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────┐
         │   3. Derive Permission Flags           │
         │   All permissions computed instantly   │
         │   Time: <5ms                           │
         └────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────┐
         │   4. Render UI with Permissions        │
         │   Single render, no loading state      │
         │   Time: 100-200ms                      │
         └────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────┐
         │   USER SEES CONTENT                    │
         │   Total Time: 105-210ms                │
         │   Improvement: 60-75% faster           │
         └────────────────────────────────────────┘
```

### Benefits

✅ **Zero Additional API Calls**
- Roles embedded in JWT token
- No network latency for role fetching

✅ **Simplified Architecture**
- Single source of truth (JWT)
- No cache management needed
- No cache synchronization issues

✅ **Better User Experience**
- No loading spinners for permissions
- Instant UI rendering
- Perceived as significantly faster

✅ **Centralized Permission Logic**
- Single `usePermissions()` hook
- Consistent patterns
- Easy to audit and test

---

## Side-by-Side Comparison

| Aspect | Current (API-Based) | Proposed (JWT Claims) |
|--------|--------------------|-----------------------|
| **Time to Render** | 460-920ms (miss) / 210-420ms (hit) | 105-210ms |
| **API Calls** | 1 per page (cache miss) | 0 (embedded in token) |
| **Cache Layers** | 2 (localStorage + React Query) | 0 (JWT is the cache) |
| **Loading States** | Every page load | None (instant) |
| **Permission Checks** | Distributed (29 files) | Centralized (1 hook) |
| **Role Staleness** | 15 minutes (TTL) | Until token expires (~1 hour) |
| **Invalidation** | Manual (queryClient.invalidate) | Automatic (new token) |
| **Complexity** | High (multi-layer caching) | Low (parse JWT) |
| **Failure Mode** | API error → No permissions | Fallback to API call |

---

## Data Flow Comparison

### Current: Multi-Step with Network Dependency

```
┌──────┐    ┌────────┐    ┌──────────────┐    ┌────────┐
│ Auth0│───▶│localStorage│◀──│React Query  │◀───│Backend │
│ SDK  │    │  Cache   │   │   Cache     │    │  API   │
└──────┘    └────────┘    └──────────────┘    └────────┘
    │            │               │                  │
    └────────────┴───────────────┴──────────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  Component  │
                  │  Rendering  │
                  └─────────────┘
```

### Proposed: Direct JWT Parsing

```
┌──────────────────────┐
│   Auth0 SDK          │
│   (JWT with roles)   │
└──────────────────────┘
           │
           │ Parse Claims (<5ms)
           │
           ▼
    ┌─────────────┐
    │  Component  │
    │  Rendering  │
    └─────────────┘
```

---

## Permission Check Pattern Comparison

### Current: Scattered Checks

```typescript
// File 1: ProjectActions.tsx
const { isSuperAdmin, hasProjectRole } = useAuth();
const canEdit = isSuperAdmin || hasProjectRole(projectId, 'DEPUTY');

// File 2: TenantSettings.tsx
const { isSuperAdmin, isTenantOwner, currentTenant } = useAuth();
const canEdit = isSuperAdmin || (isTenantOwner && currentTenant === tenantId);

// File 3: IntegrationList.tsx
const { isSuperAdmin, isTenantOwner } = useAuth();
const canManage = isSuperAdmin || isTenantOwner;

// ... repeated 26 more times across codebase
```

**Issues:**
- Manual permission composition in every file
- Inconsistent logic (easy to make mistakes)
- Hard to change permission rules globally

### Proposed: Centralized Hook

```typescript
// Single source of truth: usePermissions.ts
export const usePermissions = (options) => {
  const { isSuperAdmin, isTenantOwner, currentTenant, hasProjectRole } = useAuth();
  
  return {
    canEditProject: (projectId) => 
      isSuperAdmin || hasProjectRole(projectId, 'DEPUTY'),
    
    canEditTenant: (tenantId) => 
      isSuperAdmin || (isTenantOwner && currentTenant === tenantId),
    
    canManageIntegrations: 
      isSuperAdmin || isTenantOwner,
    
    // ... all permissions defined once
  };
};

// Usage: Consistent across all files
const { canEditProject } = usePermissions({ projectId });
if (canEditProject) {
  // Show edit button
}
```

**Benefits:**
- Single source of permission logic
- Consistent patterns everywhere
- Easy to update globally
- Testable in isolation

---

## Migration Strategy

### Phase 1: Backend + Auth0 (No Breaking Changes)

```
Current API Flow (Unchanged)
    │
    ├─────▶ Continue working
    │
    └─────▶ Add: Auth0 Action to enrich JWT
             (Parallel path, no impact on existing flow)
```

### Phase 2: Frontend Dual-Mode (Feature Flag)

```
                  ┌──────────────────────┐
                  │   Feature Flag:      │
                  │   useJwtRoles        │
                  └──────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │   JWT Claims     │      │   API Call       │
    │   (New Path)     │      │   (Old Path)     │
    └──────────────────┘      └──────────────────┘
              │                         │
              └────────────┬────────────┘
                           ▼
                  ┌──────────────────┐
                  │   Same Result    │
                  │   to Components  │
                  └──────────────────┘
```

**Rollout:**
- Week 1-2: 0% users (dev testing only)
- Week 3: 10% users (canary)
- Week 4: 25% users
- Week 5: 50% users
- Week 6: 100% users

### Phase 3: Cleanup (Remove Old Path)

```
┌──────────────────┐
│   JWT Claims     │ ◀─── Only path remaining
│   (Optimized)    │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│   Components     │
└──────────────────┘
```

---

## Risk Mitigation Visualized

### Token Size Monitoring

```
JWT Token Size Limits:

├─ 2KB ──────────────────────┐ Comfortable (All users fit)
│                            │
├─ 4KB ──────────────────────┤ Warning (Monitor usage)
│                            │
├─ 6KB ──────────────────────┤ Critical (Limit project roles)
│                            │
└─ 8KB ──────────────────────┘ Maximum (Browser limits)

Current Proposal:
  User metadata: ~200 bytes
  10 project roles: ~800 bytes
  JWT overhead: ~500 bytes
  Total: ~1.5KB ✅ Safe margin
```

### Fallback Strategy

```
┌────────────────────────────────────────┐
│   Attempt: Parse JWT Claims            │
└────────────────────────────────────────┘
                  │
                  ├─────▶ Success ✅
                  │       Use JWT roles
                  │
                  └─────▶ Failure ⚠️
                          (Claims missing/invalid)
                          │
                          ▼
          ┌────────────────────────────────┐
          │   Fallback: API Call           │
          │   GET /users/me/roles          │
          └────────────────────────────────┘
                          │
                          ├─────▶ Success ✅
                          │       Use API roles
                          │
                          └─────▶ Failure ❌
                                  Show error message
```

**Result:** 99.9% availability (Auth0 SLA + API fallback)

---

## Performance Impact Graph

```
Time to Render Protected UI (milliseconds)

Current (Cache Miss)    ████████████████████████████████████████ 920ms
Current (Cache Hit)     ████████████████████ 420ms
Proposed (JWT)          ██████ 210ms
Target                  █████ 200ms

Performance Gain:
- Cache Miss: 77% faster (920ms → 210ms)
- Cache Hit:  50% faster (420ms → 210ms)
- Average:    63% faster (weighted by 60% hit rate)
```

---

## Conclusion

The proposed JWT Custom Claims architecture:

✅ **Simplifies** the system (removes cache layers)  
✅ **Improves** performance (60-75% faster)  
✅ **Enhances** user experience (no loading spinners)  
✅ **Reduces** maintenance burden (centralized permissions)  
✅ **Maintains** security (backend validates JWT)  
✅ **Provides** graceful fallback (API call if JWT fails)

**Next Step:** Review [Executive Summary](./RBAC_REVIEW_EXECUTIVE_SUMMARY.md) for implementation roadmap.

---

**Related Documents:**
- 📊 [Full Technical Report](./RBAC_ARCHITECTURE_REVIEW_2025-11-05.md)
- 📋 [Executive Summary](./RBAC_REVIEW_EXECUTIVE_SUMMARY.md)
- 📁 [Reports Index](./README.md)

