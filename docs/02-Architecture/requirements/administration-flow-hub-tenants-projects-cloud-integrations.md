---
title: "Administration Flow (Hub → Tenants / Projects / Cloud Integrations)"
version: "0.1.0"
owners: ["frontend-platform"]
last_updated: "2025-11-05"
status: "draft"
---

## Overview

### Problem Statement
Administrators and project leads need a single, role-aware entry point to manage tenants, projects, and cloud integrations. Access must be strictly gated by RBAC and consistent with our protected routing model. The UI should be thin, reuse existing hooks/utilities, and enforce backend invariants client-side.

### Goals
- Provide a unified Administration Hub that shows only the actions users are permitted to perform.
- Implement tenant, project, and integration admin pages with strict guards and consistent UX.
- Reuse existing API client, OAuth popup flow, and role helpers; no ad-hoc fetches.
- Enforce immutable fields (project type, integration, folderpath) not editable in settings.

### Out of Scope
- Backend OAuth callback logic and provider configuration.
- SuperAdmin-wide platform configuration beyond routes listed.
- Deep audit log UI (assumed available in backend and observability tooling).

### Success Metrics
- A1–A6 acceptance criteria pass in E2E tests.
- Zero unauthorized access to admin routes (no leakage via direct URL).
- Admin Hub load ≤ 300 ms after roles are ready (excluding network).
- Operations (PATCH/DELETE/Test/Refresh) have clear feedback and are idempotent from the user perspective.

### Actors, Roles, and Permissions Matrix

Roles
- SuperAdmin: Can view/manage all tenants and projects; can delete any project; can access tenant list.
- TenantOwner: Owner of a specific tenant; can manage tenant settings and tenant integrations; can manage projects within the tenant.
- ProjectOwner (OWNER): Full project admin, including members and delete.
- ProjectDeputy (DEPUTY): Project settings, limited member management per policy (see members API), cannot delete project.
- ProjectMember (MEMBER): Limited project access; cannot access admin settings unless specifically granted.

Permissions Matrix (CRUD/Execute)

| Entity / Action | SuperAdmin | TenantOwner | ProjectOwner | ProjectDeputy | Member |
|---|---|---|---|---|---|
| Admin Hub access | Yes | Yes | Yes (Project admin only) | Yes (Project admin only) | Yes (Projects card only) |
| Tenant settings view/update | Yes (selected tenant) | Yes (own tenant) | No | No | No |
| Tenants list (system) | Yes | No | No | No | No |
| Projects index | Yes | Yes | Yes | Yes | Yes (limited actions) |
| Project settings | Yes (any) | Yes (in tenant) | Yes | Yes | No |
| Project members | Yes (any) | Yes (in tenant) | Yes | Limited (if policy) | No |
| Project delete | Yes | Yes (in tenant) | Yes | No | No |
| Integrations list/manage | Yes (via selected tenant) | Yes (own tenant) | No | No | No |
| Integration OAuth initiate | Yes (selected tenant) | Yes (own tenant) | No | No | No |
| Integration refresh/test/delete | Yes (selected tenant) | Yes (own tenant) | No | No | No |

References: See RBAC in docs/05-Security and API in docs/04-Backend.

## User Flow Summary

- Entry: User clicks avatar → Administration; route `/admin` is protected and role-gated.
- Step 1 (Admin Hub): Show cards by role — Tenant Settings, Projects, Cloud Integrations.
- Step 2 (Tenant Administration):
  - 2A Tenant Settings `/tenant/settings` (tenantOwner/superAdmin): load details; PATCH updates including archive toggle (superAdmin visibility).
  - 2B Tenants List `/admin/tenants` (superAdmin): system-wide list; view detail; archive/unarchive; delete tenant.
- Step 3 (Project Administration):
  - 3A Project Admin Index `/admin/projects`: list accessible projects with role badge and gated actions.
  - 3B Project Settings `/projects/:id/settings`: OWNER/DEPUTY update editable fields (not immutable).
  - 3C Project Members `/projects/:id/members`: OWNER manage members; DEPUTY per policy.
- Step 4 (Integrations Administration): `/tenant/integrations` (tenantOwner): list with health; create + OAuth; refresh tokens; test connectivity; delete.

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client App
    participant B as API Backend
    participant P as OAuth Popup

    U->>C: Click Administration (avatar menu)
    C-->>U: Navigate /admin (protected)
    C->>B: GET /api/v1/users/me/roles
    B-->>C: 200 roles
    C->>C: Resolve role-based card visibility
    C-->>U: Show Admin Hub (cards by role)

    U->>C: Open Tenant Settings
    C->>B: GET /api/v1/tenants/me (or /tenants/:id for superAdmin)
    B-->>C: 200 tenant
    U->>C: Save changes
    C->>B: PATCH /api/v1/tenants/:id
    B-->>C: 200 updated
    C-->>U: Success toast + refetch

    U->>C: Open Projects Index
    C->>B: GET /api/v1/projects
    B-->>C: 200 projects[]
    U->>C: Project action (Settings/Members/Delete)
    alt Delete
        C->>B: DELETE /api/v1/projects/:id
        B-->>C: 204
        C-->>U: Success toast + refetch
    else Settings
        C-->>U: Navigate /projects/:id/settings
    else Members
        C-->>U: Navigate /projects/:id/members
    end

    U->>C: Open Integrations
    C->>B: GET /api/v1/tenants/:tenantId/integrations
    B-->>C: 200 integrations[]
    U->>C: Connect provider
    C->>B: POST /api/v1/tenants/:tenantId/integrations
    B-->>C: 201 integration
    C->>B: POST /api/v1/oauth/tenants/:tenantId/integrations/:integrationId/initiate
    B-->>C: 200 { authorizationUrl }
    C->>P: window.open(authorizationUrl)
    P-->>C: postMessage(oauth_success|oauth_error)
    alt success
        C->>B: GET /api/v1/tenants/:tenantId/integrations (refetch)
        B-->>C: 200 integrations[] (updated)
    else error/closed
        C-->>U: Stay on page; show retry
    end
```

## Functional Requirements

Legend: Steps S1–S4 map to flow sections above. Sub-steps: S2A, S2B, S3A–C.

### Routing & Guards
- FR-1: `/admin` must be protected by `<PrivateRoute/>` and `<RoleRoute requiredRoles={['superAdmin','tenantOwner','projectOwner','projectDeputy']}>` (S1).
  - Rationale: Only admins/project leads can access Admin Hub.
  - Dependencies: Auth context; role helpers.
  - Trace: S1.
- FR-2: Project roles grant access only to project admin areas; tenant/integration admin requires tenantOwner (S1–S4).
  - Rationale: Enforce least privilege.
  - Dependencies: Role checks; route definitions.
  - Trace: S1–S4.

### Administration Hub
- FR-3: Admin Hub displays cards conditionally: Tenant Settings (superAdmin|tenantOwner), Projects (any project role|tenantOwner|superAdmin), Integrations (tenantOwner) (S1).
  - Rationale: Role-aware discoverability.
  - Dependencies: `useAuth()` roles; visibility helper.
  - Trace: S1.
- FR-4: Cards link to `/tenant/settings`, `/admin/projects`, `/tenant/integrations`; superAdmin-only `/admin/tenants` link appears if applicable (S1–S2B).
  - Rationale: Navigation to admin areas.
  - Dependencies: Router; RoleRoute.
  - Trace: S1, S2B.

### Tenant Administration
- FR-5: Tenant Settings page loads `GET /tenants/me` for tenantOwner or `/tenants/:id` for superAdmin-selected tenant (S2A).
  - Rationale: Contextual tenant loading.
  - Dependencies: Roles; optional tenant selector for superAdmin.
  - Trace: S2A.
- FR-6: Tenant Settings allows PATCH `/tenants/:id` for name, settings, archived toggle (archived toggle visible to superAdmin) (S2A).
  - Rationale: Core tenant administration.
  - Dependencies: Form schema (Zod), RHF, API client.
  - Trace: S2A.
- FR-7: SuperAdmin Tenants List `/admin/tenants` lists tenants with archive/unarchive, view detail, and delete (S2B).
  - Rationale: System-wide tenant management.
  - Dependencies: GET `/tenants`, `/tenants/:id`, PATCH, DELETE endpoints.
  - Trace: S2B.

### Project Administration
- FR-8: Project Admin Index lists accessible projects via `GET /projects` with role badges and gated actions (S3A).
  - Rationale: One-stop project administration.
  - Dependencies: Role awareness; table component.
  - Trace: S3A.
- FR-9: Project Settings `/projects/:id/settings` is accessible to OWNER/DEPUTY (and superAdmin/tenantOwner for their scope) and PATCH updates editable fields only (S3B).
  - Rationale: Respect immutability constraints.
  - Dependencies: RoleRoute; API client; form schema.
  - Trace: S3B.
- FR-10: Project Members `/projects/:id/members` is accessible to OWNER (DEPUTY per policy) and uses members API for list/add/update/remove (S3C).
  - Rationale: Manage project membership.
  - Dependencies: Members API; role policy.
  - Trace: S3C.
- FR-11: Project delete action is visible to OWNER or SuperAdmin only and calls `DELETE /projects/:id` with confirmation (S3A).
  - Rationale: Prevent accidental deletion; enforce RBAC.
  - Dependencies: Role checks; confirmation modal.
  - Trace: S3A.

### Integrations Administration
- FR-12: Integrations list `/tenant/integrations` shows integrations and health badges using `GET .../health` (S4).
  - Rationale: Operational visibility.
  - Dependencies: Integrations + health endpoints.
  - Trace: S4.
- FR-13: Connect flow creates integration `POST /tenants/:tenantId/integrations`, initiates OAuth, handles popup `postMessage`, and refetches on success (S4).
  - Rationale: Standard OAuth flow.
  - Dependencies: Popup hook; OAuth initiate endpoint.
  - Trace: S4.
- FR-14: Maintenance actions include PATCH (rename/status), POST refresh-token, POST test, and DELETE integration with confirmation; handle rate-limits gracefully (S4).
  - Rationale: Lifecycle management.
  - Dependencies: API endpoints; notifications.
  - Trace: S4.

### Security & Forbidden
- FR-15: Unauthorized attempts to access guarded routes result in redirect to `/forbidden` with consistent error messaging (S1–S4).
  - Rationale: Clear security posture.
  - Dependencies: RoleRoute; centralized error handling.
  - Trace: S1–S4.

## Acceptance Criteria (Gherkin)

### A1 — Hub visibility (FR-1, FR-2, FR-3, FR-4)
```
Scenario: Admin Hub shows cards based on role
  Given I am authenticated and navigate to /admin
  When my roles include tenantOwner
  Then I see Tenant Settings, Projects, and Cloud Integrations cards

Scenario: Project member sees Projects only
  Given I am authenticated with a project role but not tenantOwner or superAdmin
  When I visit /admin
  Then I see only the Projects card
```

### A2 — Tenant settings (FR-5, FR-6)
```
Scenario: Tenant owner updates settings
  Given I am on /tenant/settings as tenantOwner
  When I change the name and submit
  Then PATCH /tenants/:id succeeds and I see a success toast
  And data refetch updates the view

Scenario: SuperAdmin toggles archive
  Given I am superAdmin viewing a tenant
  When I toggle archived and submit
  Then PATCH /tenants/:id applies the change and refetch updates the badge
```

### A3 — Projects index (FR-8, FR-11)
```
Scenario: Actions gated by role
  Given I am on /admin/projects
  When I have OWNER role on a project
  Then I see Settings, Members, and Delete actions
  But when I have MEMBER role only
  Then I see Open only, without Settings/Members/Delete
```

### A4 — Project settings/members (FR-9, FR-10, FR-15)
```
Scenario: Forbidden project settings
  Given I am a MEMBER of a project
  When I navigate to /projects/:id/settings
  Then I am redirected to /forbidden

Scenario: Owner manages members
  Given I am OWNER of a project
  When I add a member via the members page
  Then the new member appears in the list after refetch
```

### A5 — Integrations (FR-12, FR-13, FR-14)
```
Scenario: Connect integration via OAuth
  Given I am on /tenant/integrations as tenantOwner
  When I click Connect for a provider
  Then the app creates an integration and initiates OAuth in a popup
  And on oauth_success the list shows Connected and health badge updates

Scenario: Test connectivity with rate-limit
  Given I am on /tenant/integrations
  When I click Test repeatedly
  Then the UI rate-limits requests and shows a friendly message if limited
```

### A6 — Security (FR-1, FR-2, FR-15)
```
Scenario: No public admin routes
  Given I am unauthenticated
  When I navigate to /admin or any admin route
  Then I am redirected to the login flow
```

## Non-Functional Requirements

- Performance: Admin Hub renders within 300 ms p95 after roles ready; index tables paginate to keep < 200 ms client processing per page.
- Availability: Admin pages follow backend SLO; destructive actions require confirmation and handle retries idempotently.
- Security: All routes wrapped in `<PrivateRoute/>` + `<RoleRoute/>`; OAuth callback remains public but audited; no token exposure in UI; HTTPS only via proxy.
- Privacy/Compliance: Surface only necessary metadata; avoid logging PII; follow least-privilege UI exposure.
- i18n/a11y: Keyboard accessible controls; aria labels; color contrast AA; copy localizable.
- Observability: Log admin actions (client) with correlation IDs; capture API error codes; monitor rate-limit events.
- Scalability: Pagination and lazy-loading for lists; React Query caching; avoid N+1 calls.
- Maintainability: Thin pages; logic in hooks; shared components and API utilities; strict TypeScript types.
- Cost: Avoid unnecessary refetches; debounce health polling if implemented.

## Data & API Contracts

### Domain Entities (indicative types)
```ts
type Tenant = {
  id: string;
  name: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

type TenantSettingsPatch = {
  name?: string; // 3-50
  settings?: Record<string, unknown>;
  archived?: boolean; // superAdmin only
};

type Project = {
  id: string;
  tenantId: string;
  name: string; // 1-100
  description?: string;
  projectTypeId: string; // immutable
  cloudIntegrationId: string; // immutable
  folderpath: string; // immutable
  createdAt: string;
};

type ProjectPatch = {
  name?: string;
  description?: string;
};

type ProjectMember = {
  userId: string;
  role: 'OWNER' | 'DEPUTY' | 'MEMBER';
};

type Integration = {
  id: string;
  tenantId: string;
  providerId: string;
  status: 'PENDING' | 'AUTHORIZED' | 'ERROR' | 'DISCONNECTED';
  displayName?: string;
  health?: { status: 'HEALTHY' | 'DEGRADED' | 'ERROR'; lastCheckedAt?: string };
};
```

### Error Model
```ts
type ApiError = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};
```

### API Surface (subset)

- GET `/api/v1/users/me/roles` → role gating for Admin Hub.

- Tenants
  - GET `/api/v1/tenants/me` (tenantOwner) | GET `/api/v1/tenants/{id}` (superAdmin selection)
  - GET `/api/v1/tenants?includeArchived=true|false` (superAdmin)
  - PATCH `/api/v1/tenants/{id}` with `TenantSettingsPatch`
  - DELETE `/api/v1/tenants/{id}` (superAdmin)

- Projects
  - GET `/api/v1/projects` (auto-scoped)
  - GET `/api/v1/projects/{id}`
  - PATCH `/api/v1/projects/{id}` with `ProjectPatch`
  - DELETE `/api/v1/projects/{id}` (OWNER or superAdmin)
  - Members:
    - GET `/api/v1/projects/{id}/members`
    - POST `/api/v1/projects/{id}/members` `{ userId, role }`
    - PATCH `/api/v1/projects/{id}/members/{userId}` `{ role }`
    - DELETE `/api/v1/projects/{id}/members/{userId}`

- Integrations
  - GET `/api/v1/tenants/{tenantId}/integrations`
  - GET `/api/v1/tenants/{tenantId}/integrations/{integrationId}/health`
  - POST `/api/v1/tenants/{tenantId}/integrations` `{ providerId }`
  - POST `/api/v1/oauth/tenants/{tenantId}/integrations/{integrationId}/initiate`
  - POST `/api/v1/tenants/{tenantId}/integrations/{integrationId}/refresh-token`
  - POST `/api/v1/tenants/{tenantId}/integrations/{integrationId}/test`
  - PATCH `/api/v1/tenants/{tenantId}/integrations/{integrationId}` `{ displayName?, status? }`
  - DELETE `/api/v1/tenants/{tenantId}/integrations/{integrationId}`

## UX Notes

- Hub: Three card layout; role-based visibility; concise descriptions and CTAs.
- Tables: Paginated, searchable by name; role badge chips; action menus disabled/hidden as per role.
- Forms: RHF + Zod; optimistic UI avoided for destructive actions; success/error toasts via shared notifications.
- Forbidden: Consistent `/forbidden` page; include “Back to dashboard” link.
- OAuth: Popup per standardized hook; clear retry/error states; no sensitive data in logs.

## Risks, Assumptions, Open Questions

### Risks
1. RBAC drift between UI and backend (Impact: High, Probability: Medium) → Mitigation: Centralize role checks, rely on backend 403s, handle gracefully.
2. Destructive actions (delete tenant/project) cause data loss (H, L) → Mitigation: Strong confirmation modals; require typing resource name.
3. Integration test/refresh rate-limits (M, M) → Mitigation: Client-side throttling + server 429 handling with backoff.

### Assumptions
- Projects `GET /projects` is auto-scoped by backend to accessible projects.
- Members API enforces OWNER/DEPUTY permissions; frontend reflects those constraints.
- Health endpoint returns a simple status sufficient for badges.

### Open Questions
1. Should TenantOwner be allowed to delete tenant in UI, or superAdmin only?
2. Does DEPUTY have any members write permissions, or view-only?
3. Should project deletion require superAdmin confirmation when initiated by OWNER?

## Traceability Matrix

| Flow Step | FRs | AC Scenarios | API/Data |
|---|---|---|---|
| S1 Admin Hub | FR-1, FR-2, FR-3, FR-4 | Hub visibility | GET /users/me/roles |
| S2A Tenant Settings | FR-5, FR-6 | Tenant owner updates; superAdmin archive | GET/PATCH /tenants |
| S2B Tenants List | FR-7 | SuperAdmin tenants ops | GET/PATCH/DELETE /tenants |
| S3A Projects Index | FR-8, FR-11 | Actions gated by role | GET/DELETE /projects |
| S3B Project Settings | FR-9 | Forbidden when not authorized | PATCH /projects/{id} |
| S3C Project Members | FR-10 | Owner manages members | Members API |
| S4 Integrations | FR-12, FR-13, FR-14 | Connect/Test/Refresh/Delete | Integrations + OAuth |

## Release & Validation Plan

- Milestones
  1. Admin Hub routing and guards (FR-1..4) behind feature flag `adminHub`.
  2. Tenant Settings and SuperAdmin Tenants list (FR-5..7).
  3. Projects Index, Settings, Members (FR-8..11).
  4. Integrations admin with OAuth + maintenance (FR-12..14).
  5. Security hardening and E2E validation (FR-15).

- Feature Flags / Kill Switches: `adminHub` for /admin entry; separate flags `tenantAdmin`, `projectAdmin`, `integrationAdmin` optional by route.

- Migration/Backfill: None required; routes additive; ensure nav shows/hides items by role without affecting existing users.

- Test Strategy
  - Unit: role helpers; visibility utilities; form schemas.
  - Integration: route guards; members API flows; OAuth popup hook interactions.
  - E2E: A1–A6 scenarios; destructive action confirmations; forbidden redirects.
  - Perf: Table pagination performance; hub load time.
  - Security: RBAC negative tests; ensure no admin route is public; CSP for popup.


