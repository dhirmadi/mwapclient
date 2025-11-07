# RBAC Optimization - Frontend Implementation Checklist

**Related:** [Full Requirements](./rbac-optimization-jwt-custom-claims.md) | [Architecture Review](../09-Reports-and-History/RBAC_ARCHITECTURE_REVIEW_2025-11-05.md)

This is a practical, step-by-step checklist for frontend developers implementing the RBAC optimization. Use this alongside the full requirements document.

---

## Pre-Implementation (Week -2 to -1)

**Goal:** Validate assumptions before starting implementation

### Data Analysis
- [ ] **Question 1:** Analyze user project membership distribution
  - Query production database: Count users by number of project memberships
  - Validate: <20% of users have >10 projects
  - Document results in requirements doc

### Decision Points
- [ ] **Question 2:** Get stakeholder approval on 1-hour role staleness
- [ ] **Question 3:** Validate Auth0 Actions cost budget
- [ ] **Question 4:** Execute HTTP/2 Server Push spike (optional, 1 week)
- [ ] **Go/No-Go:** Final decision to proceed with JWT migration

---

## Phase 1: usePermissions Hook (Week 1-2)

**Goal:** Create centralized permission hook and migrate pilot components

### Step 1: Create usePermissions Hook
- [ ] Create file: `src/shared/hooks/usePermissions.ts`
- [ ] Define TypeScript interfaces:
  ```typescript
  interface UsePermissionsOptions {
    tenantId?: string;
    projectId?: string;
  }
  
  interface UsePermissionsReturn {
    // Global
    isSuperAdmin: boolean;
    isTenantOwner: boolean;
    
    // Tenant permissions (functions)
    canViewTenant: (tenantId: string) => boolean;
    canEditTenant: (tenantId: string) => boolean;
    canManageTenants: boolean;
    
    // Project permissions (functions)
    canViewProject: (projectId: string) => boolean;
    canEditProject: (projectId: string) => boolean;
    canManageProject: (projectId: string) => boolean;
    canCreateProject: boolean;
    
    // Integration permissions
    canManageIntegrations: (tenantId: string) => boolean;
    
    // System permissions
    canManageCloudProviders: boolean;
    canManageProjectTypes: boolean;
    canViewSystemAnalytics: boolean;
    
    // Auto-resolved
    current: {
      canViewTenant: boolean;
      canEditTenant: boolean;
      canViewProject: boolean;
      canEditProject: boolean;
      canManageProject: boolean;
    };
  }
  ```

- [ ] Implement hook:
  ```typescript
  export const usePermissions = (options: UsePermissionsOptions = {}): UsePermissionsReturn => {
    const { isSuperAdmin, isTenantOwner, currentTenant, hasProjectRole } = useAuth();
    const { tenantId, projectId } = options;
    
    // Implement all permission functions with useCallback for memoization
    // See full requirements FR-3.2 for business rules
  }
  ```

- [ ] Export from `src/shared/hooks/index.ts`:
  ```typescript
  export { usePermissions } from './usePermissions';
  export type { UsePermissionsOptions, UsePermissionsReturn } from './usePermissions';
  ```

### Step 2: Write Unit Tests
- [ ] Create file: `src/shared/hooks/usePermissions.test.ts`
- [ ] Test cases:
  - [ ] SuperAdmin has all permissions
  - [ ] Tenant owner can edit their tenant only (not others)
  - [ ] Project owner can manage their project
  - [ ] Project deputy can edit but not manage
  - [ ] Project member can view but not edit
  - [ ] Non-member cannot view project
  - [ ] Auto-resolved `current` object works correctly
- [ ] Run tests: `npm test usePermissions.test.ts`
- [ ] Verify coverage >90%

### Step 3: Migrate Pilot Components
- [ ] Migrate 5 pilot components:
  - [ ] `src/features/projects/pages/ProjectSettings.tsx`
  - [ ] `src/features/projects/components/ProjectActions.tsx`
  - [ ] `src/features/tenants/pages/TenantSettings.tsx`
  - [ ] `src/features/integrations/pages/IntegrationList.tsx`
  - [ ] `src/pages/Dashboard.tsx`

**Migration Pattern:**

**Before:**
```typescript
const { isSuperAdmin, hasProjectRole } = useAuth();
const canEdit = isSuperAdmin || hasProjectRole(projectId, 'DEPUTY');
```

**After:**
```typescript
const { canEditProject } = usePermissions({ projectId });
// Use canEditProject directly
```

### Step 4: Document Hook
- [ ] Add JSDoc comments to `usePermissions.ts`
- [ ] Update `docs/06-Guidelines/components.md` with usage examples
- [ ] Create PR with pilot migration

---

## Phase 2: JWT Parsing (Week 3-4)

**Goal:** Implement JWT custom claims parsing with feature flag

### Step 1: Feature Flag Setup
- [ ] Add environment variable to `.env.local`:
  ```bash
  VITE_FEATURE_USE_JWT_ROLES=false  # Default: false for safety
  ```
- [ ] Add to `.env.example`:
  ```bash
  # Feature Flags
  VITE_FEATURE_USE_JWT_ROLES=false  # Enable JWT role parsing (requires backend Auth0 Action)
  ```

### Step 2: Update TypeScript Types
- [ ] Add JWT claims interface to `src/shared/types/auth.ts`:
  ```typescript
  interface JWTRolesClaim {
    'https://mwap.dev/roles': {
      isSuperAdmin: boolean;
      isTenantOwner: boolean;
      tenantId: string | null;
      projectRoles: { projectId: string; role: ProjectRole }[];
      version: number;
      issuedAt: number;
      fallback?: boolean;
      error?: string;
    };
  }
  ```

### Step 3: Refactor AuthContext
- [ ] Open `src/core/context/AuthContext.tsx`
- [ ] Import feature flag:
  ```typescript
  const useJwtRoles = import.meta.env.VITE_FEATURE_USE_JWT_ROLES === 'true';
  ```

- [ ] Add JWT parsing function:
  ```typescript
  const parseJwtRoles = useCallback(async (): Promise<UserRolesResponse | null> => {
    try {
      const claims = await getIdTokenClaims();
      const customClaims = claims?.['https://mwap.dev/roles'];
      
      if (!customClaims || customClaims.fallback) {
        console.warn('JWT claims not available, falling back to API');
        return null;  // Trigger API fallback
      }
      
      // Validate schema (FR-1.2)
      if (!validateJwtClaimsSchema(customClaims)) {
        console.error('Invalid JWT claims schema');
        return null;  // Trigger API fallback
      }
      
      // Return normalized roles
      return {
        userId: user.sub,
        isSuperAdmin: customClaims.isSuperAdmin,
        isTenantOwner: customClaims.isTenantOwner,
        tenantId: customClaims.tenantId,
        projectRoles: customClaims.projectRoles,
      };
    } catch (error) {
      console.error('Failed to parse JWT claims:', error);
      return null;  // Trigger API fallback
    }
  }, [getIdTokenClaims, user]);
  ```

- [ ] Add schema validation function:
  ```typescript
  const validateJwtClaimsSchema = (claims: any): boolean => {
    return (
      typeof claims.isSuperAdmin === 'boolean' &&
      typeof claims.isTenantOwner === 'boolean' &&
      (claims.tenantId === null || typeof claims.tenantId === 'string') &&
      Array.isArray(claims.projectRoles) &&
      claims.projectRoles.length <= 10
    );
  };
  ```

- [ ] Update `useQuery` to use JWT or API based on flag:
  ```typescript
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['user', 'roles', user?.sub],
    queryFn: async (): Promise<UserRolesResponse> => {
      if (useJwtRoles) {
        // Try JWT first
        const jwtRoles = await parseJwtRoles();
        if (jwtRoles) {
          console.log('✅ Roles loaded from JWT');
          return jwtRoles;
        }
        // Fallback to API
        console.warn('⚠️ Falling back to API');
      }
      
      // Legacy API path (or fallback)
      const token = await getAccessTokenSilently();
      const response = await api.get('/users/me/roles');
      return handleApiResponse<UserRolesResponse>(response, false).data;
    },
    enabled: isAuthenticated && !!user?.sub,
    staleTime: 60 * 60 * 1000,  // 1 hour (JWT expiration)
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  ```

### Step 4: Remove localStorage Cache
- [ ] Delete `getCachedRoles()` function
- [ ] Delete `setCachedRoles()` function
- [ ] Delete `clearCachedRoles()` function
- [ ] Delete constants: `ROLES_CACHE_KEY`, `ROLES_CACHE_TTL`
- [ ] Add one-time cleanup in `useEffect`:
  ```typescript
  useEffect(() => {
    // One-time: Clear legacy cache
    const LEGACY_KEY = 'mwap_user_roles_cache';
    if (localStorage.getItem(LEGACY_KEY)) {
      localStorage.removeItem(LEGACY_KEY);
      console.log('✅ Cleared legacy role cache');
    }
  }, []);
  ```

### Step 5: Add refreshRoles Method
- [ ] Add to AuthContext:
  ```typescript
  const refreshRoles = useCallback(async (): Promise<void> => {
    try {
      await getAccessTokenSilently({
        cacheMode: 'off',
        ignoreCache: true,
      });
      console.log('✅ Token refreshed, new roles will be parsed');
    } catch (error) {
      console.error('Failed to refresh token:', error);
      queryClient.invalidateQueries({ queryKey: ['user', 'roles'] });
    }
  }, [getAccessTokenSilently, queryClient]);
  ```

- [ ] Export in AuthContextType interface and context value

### Step 6: Write Integration Tests
- [ ] Create file: `src/core/context/AuthContext.test.tsx`
- [ ] Test cases:
  - [ ] JWT claims parsed successfully
  - [ ] Fallback to API when claims missing
  - [ ] Fallback to API when claims invalid
  - [ ] Feature flag toggles behavior
  - [ ] refreshRoles triggers token refresh
- [ ] Run tests: `npm test AuthContext.test.tsx`

### Step 7: Manual Testing
- [ ] Test with feature flag OFF (legacy API path):
  - [ ] Login works
  - [ ] Roles load correctly
  - [ ] Permissions work as before
- [ ] Test with feature flag ON (JWT path):
  - [ ] Login works
  - [ ] JWT claims parsed (check console logs)
  - [ ] Roles load correctly
  - [ ] Fallback works if claims missing
- [ ] Test error scenarios:
  - [ ] Malformed JWT → Fallback to API
  - [ ] API also fails → Error message shown

---

## Phase 3: Component Migration (Week 5-6)

**Goal:** Migrate all remaining components and add optimistic updates

### Step 1: Find Remaining Components
- [ ] Run search to find all files with permission checks:
  ```bash
  grep -r "hasProjectRole\|isSuperAdmin\|isTenantOwner" src/features --include="*.tsx" --include="*.ts" -l
  ```
- [ ] Create list of ~24 remaining files (see FR-4.1)

### Step 2: Migrate Components in Batches
- [ ] **Batch 1** (5 files):
  - [ ] File 1
  - [ ] File 2
  - [ ] File 3
  - [ ] File 4
  - [ ] File 5
  - [ ] Test manually
  - [ ] Create PR

- [ ] **Batch 2** (5 files):
  - Repeat...

- [ ] **Batch 3** (5 files):
  - Repeat...

- [ ] **Batch 4** (5 files):
  - Repeat...

- [ ] **Batch 5** (4 remaining files):
  - Repeat...

### Step 3: Update ProtectedRoute
- [ ] Open `src/core/router/ProtectedRoute.tsx`
- [ ] Refactor to use `usePermissions()` if needed
- [ ] Ensure `isReady` check remains:
  ```typescript
  if (isLoading || !isReady) {
    return <LoadingSpinner />;
  }
  ```

### Step 4: Add Optimistic Updates
- [ ] **Tenant Creation** - `src/features/tenants/hooks/useCreateTenant.ts`:
  ```typescript
  return useMutation({
    mutationFn: (data) => api.post('/tenants', data),
    onMutate: async () => {
      // Optimistic
      queryClient.setQueryData(['user', 'roles'], (old: any) => ({
        ...old,
        isTenantOwner: true,
        tenantId: 'pending',
      }));
    },
    onSuccess: (response) => {
      // Update with real ID
      queryClient.setQueryData(['user', 'roles'], (old: any) => ({
        ...old,
        tenantId: response.data._id,
      }));
      refreshRoles();  // Background refresh
    },
    onError: () => {
      // Rollback
      queryClient.invalidateQueries({ queryKey: ['user', 'roles'] });
    },
  });
  ```

- [ ] **Project Member Add** - `src/features/projects/hooks/useAddProjectMember.ts`:
  - Add optimistic update for new project role

- [ ] **Project Member Remove** - `src/features/projects/hooks/useRemoveProjectMember.ts`:
  - Add optimistic update to remove project role

### Step 5: Write E2E Tests
- [ ] Create E2E test suite: `tests/e2e/rbac-jwt.spec.ts`
- [ ] Test flows:
  - [ ] Login as SuperAdmin → See all features
  - [ ] Login as regular user → Create tenant → See tenant features instantly
  - [ ] Login as project member → View project (no edit)
- [ ] Run E2E tests: `npm run test:e2e`

### Step 6: Update Documentation
- [ ] Update `docs/05-Security/README.md`:
  - Remove localStorage cache references
  - Add JWT parsing section
  - Update flow diagrams
- [ ] Update `docs/02-Architecture/README.md`:
  - Document JWT-based role architecture
- [ ] Update `docs/06-Guidelines/development-guide.md`:
  - Add usePermissions usage guide
  - Document migration pattern

---

## Phase 4: Gradual Rollout (Week 7-8)

**Goal:** Enable JWT roles for production users gradually

### Week 7: Canary Rollout
- [ ] **Day 1-2: 0% (Internal Testing)**
  - Deploy with flag OFF
  - Manual testing by team
  - Verify monitoring dashboards

- [ ] **Day 3-4: 10% Canary**
  - Enable flag for 10% of users
  - Monitor metrics:
    - [ ] TTI <300ms
    - [ ] JWT fallback rate <5%
    - [ ] Error rate <0.1%
  - Check support tickets
  - Review user feedback

- [ ] **Day 5-7: 25%**
  - Enable for 25% of users
  - Continue monitoring
  - No critical issues → Proceed

### Week 8: Full Rollout
- [ ] **Day 1-3: 50%**
  - Enable for 50% of users
  - Monitor closely
  - Validate performance improvements

- [ ] **Day 4-5: 100%**
  - Enable for all users
  - Monitor for 48 hours
  - Confirm success metrics met

### Rollback Procedure (if needed)
If critical issues occur:
1. [ ] Set `VITE_FEATURE_USE_JWT_ROLES=false`
2. [ ] Redeploy (5-10 min)
3. [ ] All users fall back to API path
4. [ ] Investigate and fix issue
5. [ ] Resume rollout when stable

### Success Validation
After 100% rollout for 48 hours:
- [ ] Confirm TTI <300ms (p90)
- [ ] Confirm JWT fallback rate <5%
- [ ] Confirm error rate <0.1%
- [ ] Review support tickets (no RBAC issues)
- [ ] Survey sample users (NPS score)

---

## Phase 5: Cleanup (Week 9)

**Goal:** Remove legacy code and finalize

### Step 1: Remove Feature Flag
- [ ] Remove `VITE_FEATURE_USE_JWT_ROLES` checks from AuthContext
- [ ] Remove legacy API path code (JWT path only)
- [ ] Keep fallback API call (for error scenarios)

### Step 2: Final Code Cleanup
- [ ] Remove any remaining localStorage cache references
- [ ] Remove commented-out code
- [ ] Update all TypeScript types
- [ ] Run linter: `npm run lint -- --fix`

### Step 3: Update Documentation
- [ ] Update all docs to reflect new architecture
- [ ] Remove references to localStorage caching
- [ ] Publish release notes

### Step 4: Retrospective
- [ ] Schedule team retrospective
- [ ] Discuss what went well
- [ ] Discuss what to improve
- [ ] Document lessons learned

---

## Monitoring & Alerts Setup

### Performance Metrics
- [ ] Set up tracking for:
  - `auth.roles.load_time` (ms)
  - `auth.roles.method` ('jwt' | 'api' | 'fallback')
  - `auth.jwt.parse_time` (ms)
  - `page.time_to_interactive` (ms)

### Alerts
- [ ] Configure alerts:
  - TTI >500ms for 5 min → Warning
  - JWT fallback rate >5% for 10 min → Critical
  - Error rate >1% for 5 min → Critical
  - Auth0 login failures >1% → Critical (disable Action)

### Dashboards
- [ ] Create monitoring dashboard:
  - TTI over time (before/after comparison)
  - JWT vs API usage breakdown
  - Fallback rate trend
  - Error rate by type

---

## Testing Checklist

### Unit Tests
- [ ] `usePermissions.test.ts` - All permission functions
- [ ] Coverage >90%

### Integration Tests
- [ ] `AuthContext.test.tsx` - JWT parsing and fallback
- [ ] All test cases passing

### E2E Tests
- [ ] Login flows for each role
- [ ] Tenant creation with optimistic update
- [ ] Project access permissions

### Manual Testing
- [ ] SuperAdmin flow complete
- [ ] Tenant owner flow complete
- [ ] Project member flow complete
- [ ] Error scenarios handled gracefully

### Performance Testing
- [ ] Lighthouse CI: TTI <300ms
- [ ] Network tab: 1 fewer API call per page
- [ ] No loading spinners for permissions

### Security Testing
- [ ] Tampered JWT rejected
- [ ] Expired JWT triggers re-auth
- [ ] Tokens not in localStorage

---

## Quick Reference

### Useful Commands
```bash
# Run unit tests
npm test usePermissions

# Run integration tests
npm test AuthContext

# Run E2E tests
npm run test:e2e

# Check TypeScript
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Dev server
npm run dev
```

### Key Files
- `src/shared/hooks/usePermissions.ts` - Centralized permission hook
- `src/core/context/AuthContext.tsx` - JWT parsing and role management
- `src/shared/types/auth.ts` - TypeScript types
- `.env.local` - Feature flag configuration

### Documentation
- [Full Requirements](./rbac-optimization-jwt-custom-claims.md)
- [Architecture Review](../09-Reports-and-History/RBAC_ARCHITECTURE_REVIEW_2025-11-05.md)
- [Executive Summary](../09-Reports-and-History/RBAC_REVIEW_EXECUTIVE_SUMMARY.md)

---

**Last Updated:** 2025-11-05  
**Status:** Ready for Implementation  
**Owner:** Frontend Team

