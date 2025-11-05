# Authentication Feature Specification

**Last Updated:** 2025-10-08

**Owner:** Lead Architect

**Status:** Implemented (frontend + backend)

## Overview

Authentication is implemented using Auth0 with PKCE. The client uses the Auth0 SPA SDK and an `AuthContext` to provide auth state, role-based flags, and a cached roles model retrieved from the backend. The API client injects the JWT via interceptors. Protected routes enforce RBAC at the UI level and the backend enforces authorization.

## Goals

- Secure user authentication (Auth0 PKCE)
- Role-based access control (SuperAdmin, TenantOwner, Project roles)
- Token injection into all API requests
- Caching of user roles with TTL for performance

## Roles Model

```
UserRolesResponse
userId: string
isSuperAdmin: boolean
isTenantOwner: boolean
tenantId: string | null
projectRoles: { projectId: string; role: 'OWNER' | 'DEPUTY' | 'MEMBER' }[]
```

## Backend API (Implemented)

Base prefix: `/api/v1`

| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| GET | `/api/v1/users/me/roles` | Bearer | Returns current user's roles and tenant/project mappings | ✅ Implemented |

Notes:
- Endpoint returns either a plain roles object or `{ success: true, data: roles }` wrapper; the client normalizes both.

## Frontend Implementation

### Structure

```
src/core/context/AuthContext.tsx     // role caching, token helpers
src/features/auth/hooks/useAuth.ts   // hook exposing AuthContext
src/features/auth/pages/LoginPage.tsx
src/features/auth/pages/ProfilePage.tsx
```

### AuthContext Capabilities

- `isAuthenticated`: boolean
- `isLoading`: include Auth0 and roles-loading states
- `isReady`: true when authenticated and roles loaded
- `user`: Auth0 user profile
- `login()`: Auth0 loginWithRedirect
- `logout()`: Clears caches and calls Auth0 logout
- `isSuperAdmin`, `isTenantOwner`: derived flags from roles
- `roles`: cached roles object
- `currentTenant`: tenantId derived from roles
- `hasProjectRole(projectId, role)`: OWNER > DEPUTY > MEMBER hierarchy check
- `getToken()`: retrieves JWT via Auth0 and stores in localStorage for interceptors

### Role Caching Strategy

- React Query for `/users/me/roles` with 15-minute `staleTime`
- localStorage backup cache with TTL (15 minutes) keyed by userId
- Automatic invalidation and cleanup on logout or user changes

### API Client Integration

- Axios instance in `src/shared/utils/api.ts` injects `Authorization: Bearer <JWT>` using `getToken()` from context
- Centralized logging, error handling, and timeouts

### Protected Routes & RBAC

- `ProtectedRoute` checks required roles (e.g., `TENANT_OWNER`) before rendering
- UI hides disallowed actions; backend still enforces authorization

## UX Requirements

- Seamless login/logout using Auth0
- Clear error notifications for auth failures
- Loading states while roles are fetched

## Security

- PKCE flow via Auth0 SPA SDK
- JWT stored in memory; short-lived presence in localStorage only when needed for interceptors (per current implementation)
- Roles fetched from backend and cached with TTL

## Testing

- Unit: context value derivations, hasProjectRole logic
- Integration: login flow, roles fetch and cache; logout cache cleanup
- E2E: protected routes respect roles; token injected for API calls

## References

- `docs/05-Security/authentication.md`
- `docs/05-Security/rbac.md`
- `docs/06-Guidelines/development-guide.md`
