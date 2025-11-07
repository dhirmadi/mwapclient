---
title: "Super Administration Flow (Hub → Cloud Providers / Tenants / Project Types / System Ops)"
version: "0.1.0"
owners: ["frontend-platform"]
last_updated: "2025-11-05"
status: "draft"
---

## Overview

### Problem Statement
Super administrators require a centralized, role-gated hub to manage platform-wide resources: cloud providers, tenants, project types, and system operations. The UI must strictly enforce RBAC, reuse shared primitives (routing, API client, React Query), and expose only SuperAdmin actions without introducing public admin endpoints.

### Goals
- Provide a dedicated `/superadmin` hub surfacing SuperAdmin-only capabilities.
- Implement CRUD and operational tooling for cloud providers, tenants, and project types.
- Expose read-only security/operational views and a small set of admin-safe actions (e.g., OpenAPI cache invalidate).
- Keep pages thin and type-safe, with logic in hooks and consistent notifications.

### Out of Scope
- OAuth provider callback handling (backend-owned) and identity impersonation.
- Non-essential system toggles that would violate Zero-Trust; only approved admin actions.
- Any new public routes; only existing OAuth callback remains public per policy.

### Success Metrics
- A1–A6 acceptance criteria pass in E2E.
- Zero access by non-superadmin users to `/superadmin/*` (verified by negative tests).
- CRUD operations return success toasts and reflect updates via refetch/invalidations within 300 ms client-side.

### Actors, Roles, and Permissions

- SuperAdmin: Full access to hub and all sub-pages and actions listed below.
- All other roles: No access; avatar menu item hidden, route guard denies with `/forbidden`.

Permissions Matrix (SuperAdmin-only areas)

| Area | List | Read | Create | Update | Delete | Execute |
|---|---|---|---|---|---|---|
| Cloud Providers | Yes | Yes | Yes | Yes | Yes | — |
| Tenants (system) | Yes | Yes | — | Yes | Yes | — |
| Project Types | Yes | Yes | Yes | Yes | Yes | — |
| System Ops | Yes | Yes | — | — | — | Cache invalidate, run checks |

References: RBAC and security guidelines in `docs/05-Security/`, API in `docs/04-Backend/`.

## User Flow Summary

- Entry: Avatar menu → Super Administration (visible only if `isSuperAdmin`) → `/superadmin`.
- Step 1 (Hub): Four cards: Cloud Providers, Tenants, Project Types, System Ops.
- Step 2 (Cloud Providers): CRUD over `/cloud-providers`; validate unique `slug` and non-empty `scopes[]`.
- Step 3 (Tenants): System-wide tenants list with filters; view/update/archive/unarchive/delete.
- Step 4 (Project Types): CRUD; show usage count; delete disabled if in use (conflict).
- Step 5 (System Ops): Read-only OAuth security panels and OpenAPI/platform panels; admin action to invalidate OpenAPI cache.

```mermaid
sequenceDiagram
    participant U as User (SuperAdmin)
    participant C as Client App
    participant B as API Backend

    U->>C: Click Super Administration
    C-->>U: Navigate /superadmin (guarded)
    C->>B: GET /api/v1/users/me/roles
    B-->>C: 200 roles{ isSuperAdmin:true }
    C-->>U: Render Hub (4 cards)

    U->>C: Open Cloud Providers
    C->>B: GET /api/v1/cloud-providers
    B-->>C: 200 providers[]
    U->>C: Create/Edit/Delete provider
    C->>B: POST|PATCH|DELETE /api/v1/cloud-providers[/:id]
    B-->>C: 2xx result
    C-->>U: Toast + refetch

    U->>C: Open Tenants
    C->>B: GET /api/v1/tenants?includeArchived=...
    B-->>C: 200 tenants[]
    U->>C: Archive/Unarchive/Delete tenant
    C->>B: PATCH|DELETE /api/v1/tenants/:id
    B-->>C: 2xx result
    C-->>U: Toast + refetch

    U->>C: Open Project Types
    C->>B: GET /api/v1/project-types
    B-->>C: 200 types[]
    U->>C: Create/Edit/Delete type
    C->>B: POST|PATCH|DELETE /api/v1/project-types[/:id]
    B-->>C: 2xx or 409 Conflict when in use
    C-->>U: Toast + refetch; disable delete on conflict

    U->>C: Open System Ops
    C->>B: GET /api/v1/oauth/security/metrics|alerts|patterns|report
    C->>B: GET /api/v1/openapi|/openapi/info|/openapi/health|/openapi/cache/status
    B-->>C: 200 data
    U->>C: Invalidate OpenAPI cache
    C->>B: POST /api/v1/openapi/cache/invalidate
    B-->>C: 202 accepted
    C-->>U: Toast + refresh status
```

## Functional Requirements

Legend: Steps S1–S5 refer to flow above.

### Routing & Guards
- FR-1: `/superadmin` and all subroutes must be wrapped by `<PrivateRoute/>` and `<RoleRoute requiredRoles={["superAdmin"]}/>` (S1).
  - Rationale: Restrict to SuperAdmin only.
  - Dependencies: Auth context; role helpers; router.
  - Trace: S1.
- FR-2: Avatar menu item “Super Administration” is visible only when `isSuperAdmin === true` (S1).
  - Rationale: Avoid discoverability for non-authorized users.
  - Dependencies: RBAC nav visibility helper.
  - Trace: S1.

### Super Admin Hub
- FR-3: Render four cards linking to subpages: Cloud Providers, Tenants, Project Types, System Ops (S1).
  - Rationale: Central entry point.
  - Dependencies: Router; role checks.
  - Trace: S1.

### Cloud Providers
- FR-4: List providers via `GET /cloud-providers` with columns: name, slug, scopes[], updatedAt (S2).
  - Rationale: Manage provider catalog.
  - Dependencies: API client; table component.
  - Trace: S2.
- FR-5: Create/Edit provider using drawer form; validate `name` (1–100), `slug` (kebab-case, unique), `scopes` (non-empty array) (S2).
  - Rationale: Ensure correctness at UI boundary.
  - Dependencies: Zod schema; RHF; API client.
  - Trace: S2.
- FR-6: Delete provider with confirmation; handle 409/constraint errors gracefully (S2).
  - Rationale: Prevent accidental destructive actions.
  - Dependencies: Confirmation modal; error mapping.
  - Trace: S2.

### Tenants (System)
- FR-7: List tenants with filters: status (active/archived), owner, created range (S3).
  - Rationale: Operability at scale.
  - Dependencies: Query params; table filters.
  - Trace: S3.
- FR-8: View/Update tenant; PATCH supports name/settings/archived (S3).
  - Rationale: Lifecycle management.
  - Dependencies: Form; API client.
  - Trace: S3.
- FR-9: Delete tenant requires typed confirmation and final dialog (S3).
  - Rationale: Safety for irreversible operations.
  - Dependencies: Modal; notifications.
  - Trace: S3.

### Project Types
- FR-10: CRUD project types at `/project-types`; prevent delete if API reports conflict/in-use (S4).
  - Rationale: Curate templates safely.
  - Dependencies: API error codes; button disable logic.
  - Trace: S4.

### System Ops
- FR-11: OAuth Security panels fetch metrics/alerts/patterns/report and render read-only charts/tables; server-side rate-limited (S5).
  - Rationale: Security visibility.
  - Dependencies: Chart components; GET endpoints.
  - Trace: S5.
- FR-12: OpenAPI/Platform panels fetch spec/info/health/cache status; provide “Invalidate cache” POST action (S5).
  - Rationale: Operational tooling.
  - Dependencies: API client; button; notifications.
  - Trace: S5.

### Security Posture
- FR-13: Non-superadmin access attempts to `/superadmin/*` redirect to `/forbidden` (S1).
  - Rationale: Zero-Trust reinforcement.
  - Dependencies: RoleRoute; error handling.
  - Trace: S1.

## Acceptance Criteria (Gherkin)

### A1 — Gate
```
Scenario: Only super admins can access Super Administration
  Given I am authenticated but not a super admin
  When I navigate to /superadmin
  Then I am redirected to /forbidden

Scenario: Super admin sees hub and menu item
  Given I am authenticated as a super admin
  When I open the avatar menu
  Then I see Super Administration
  And visiting /superadmin shows four cards
```

### A2 — Cloud Providers
```
Scenario: Create provider with validation
  Given I am on /superadmin/cloud-providers
  When I open Create and submit name, unique slug, and non-empty scopes
  Then POST /cloud-providers returns 201 and the table refreshes with a success toast

Scenario: Duplicate slug shows field error
  Given an existing provider with slug "gdrive"
  When I submit another with slug "gdrive"
  Then I see a field-level error mapped from the API
```

### A3 — Tenants
```
Scenario: Archive/unarchive tenant
  Given I am on /superadmin/tenants
  When I archive a tenant
  Then PATCH /tenants/:id sets archived=true and the row updates after refetch

Scenario: Delete tenant requires confirmation
  Given I choose Delete on a tenant row
  When I type the tenant name to confirm
  Then DELETE /tenants/:id succeeds and the tenant disappears from the list
```

### A4 — Project Types
```
Scenario: Prevent deleting type in use
  Given a project type with usage count > 0
  When I attempt to delete
  Then the Delete action is disabled or the API returns 409 and the UI shows a friendly message
```

### A5 — System Ops
```
Scenario: Invalidate OpenAPI cache
  Given I am on /superadmin/system → OpenAPI tab
  When I click Invalidate Cache
  Then POST /openapi/cache/invalidate returns 202 and status refreshes
```

### A6 — Security
```
Scenario: No public admin endpoints introduced
  Given I am unauthenticated
  When I try to access /superadmin or subroutes
  Then I am redirected to the login flow
```

## Non-Functional Requirements

- Performance: Hub and tables render within 300 ms client-time p95 after data load; list views paginated.
- Availability: Admin features follow backend SLO; retries/backoff on 429/5xx; no infinite spinners.
- Security: Strict role guard; HTTPS-only via proxy; no tokens in logs; adhere to RBAC/Zero-Trust.
- Privacy/Compliance: Avoid exposing PII beyond necessary admin fields; redact sensitive data in UI if present.
- i18n/a11y: All labels aria-complete; keyboard navigable; WCAG AA; copy localizable.
- Observability: Log admin actions (client) with correlation IDs; capture error codes; minimal PII in logs.
- Scalability: Pagination, server-side filtering; React Query caching; avoid N+1.
- Maintainability: Hooks for data/logic; Zod validation; explicit types; shared components.
- Cost: Avoid unnecessary refetches; batch invalidations after mutations.

## Data & API Contracts

### Entities (indicative types)
```ts
type CloudProvider = {
  id: string;
  name: string;
  slug: string; // unique, kebab-case
  scopes: string[]; // non-empty
  updatedAt: string;
  createdAt: string;
};

type Tenant = {
  id: string;
  name: string;
  ownerId: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProjectType = {
  id: string;
  name: string;
  description?: string;
  defaults?: Record<string, unknown>; // e.g., required scopes
  usageCount?: number; // read-only hint
};

type OAuthSecurityMetrics = unknown; // rendered as read-only charts/tables
type OpenApiInfo = unknown;
```

### Error Model
```ts
type ApiError = {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>; // optional mapping for forms
};
```

### API Surface (subset)

- Roles: GET `/api/v1/users/me/roles`

- Cloud Providers
  - GET `/api/v1/cloud-providers`
  - POST `/api/v1/cloud-providers` `{ name, slug, scopes: string[] }`
  - PATCH `/api/v1/cloud-providers/{id}` `{ name?, slug?, scopes? }`
  - DELETE `/api/v1/cloud-providers/{id}`

- Tenants (system scope)
  - GET `/api/v1/tenants?includeArchived=true|false&ownerId=&createdFrom=&createdTo=`
  - GET `/api/v1/tenants/{id}`
  - PATCH `/api/v1/tenants/{id}` `{ name?, settings?, archived? }`
  - DELETE `/api/v1/tenants/{id}`

- Project Types
  - GET `/api/v1/project-types`
  - POST `/api/v1/project-types` `{ name, description?, defaults? }`
  - PATCH `/api/v1/project-types/{id}` `{ name?, description?, defaults? }`
  - DELETE `/api/v1/project-types/{id}`

- System Ops
  - GET `/api/v1/oauth/security/metrics`
  - GET `/api/v1/oauth/security/alerts`
  - GET `/api/v1/oauth/security/patterns`
  - GET `/api/v1/oauth/security/report`
  - GET `/api/v1/openapi`
  - GET `/api/v1/openapi/info`
  - GET `/api/v1/openapi/health`
  - GET `/api/v1/openapi/cache/status`
  - POST `/api/v1/openapi/cache/invalidate`

## UX Notes

- Hub: Four-card layout; concise descriptions; clear CTAs.
- Tables: Pagination + filters; batch refetch after mutations; role-badges where relevant.
- Forms: RHF + Zod; map API `fieldErrors` to inputs; optimistic updates OK for non-destructive edits.
- Destructive actions: Two-step confirmation; type-to-confirm for tenant delete.
- System Ops: Read-only by default; action buttons clearly marked admin-only.

## Risks, Assumptions, Open Questions

### Risks
1. Accidental deletion in admin areas (Impact: High, Probability: Low) → Mitigation: Typed confirmation and explicit warnings.
2. Large lists impact performance (M, M) → Mitigation: Pagination + filters; virtualized tables if needed.
3. Rate-limited system endpoints (M, M) → Mitigation: Backoff, UI throttling, clear messages.

### Assumptions
- API provides 409/constraint conflicts for in-use project types.
- Cloud provider `slug` uniqueness enforced server-side.
- System ops endpoints are safe and rate-limited server-side.

### Open Questions
1. Should we surface read-only tenant owner impersonation link? (default: no)
2. Any additional admin-safe actions desired in System Ops (e.g., seed fixtures)?

## Traceability Matrix

| Flow Step | FRs | AC Scenarios | API/Data |
|---|---|---|---|
| S1 Hub & Guard | FR-1, FR-2, FR-3 | A1 | Roles |
| S2 Cloud Providers | FR-4, FR-5, FR-6 | A2 | Cloud Providers CRUD |
| S3 Tenants | FR-7, FR-8, FR-9 | A3 | Tenants CRUD |
| S4 Project Types | FR-10 | A4 | Project Types CRUD |
| S5 System Ops | FR-11, FR-12 | A5 | OAuth Security, OpenAPI Ops |

## Release & Validation Plan

- Milestones
  1. Add `/superadmin` routes and hub (FR-1..3) behind feature flag `superAdminHub`.
  2. Cloud Providers CRUD (FR-4..6).
  3. Tenants system list and lifecycle (FR-7..9).
  4. Project Types CRUD (FR-10).
  5. System Ops panels and actions (FR-11..12).

- Feature Flags / Kill Switches: `superAdminHub` controls hub visibility and routing behavior.

- Migration/Backfill: None; routes additive, RBAC-gated.

- Test Strategy
  - Unit: role visibility; Zod schemas; error mapping to forms.
  - Integration: route guards; table filters; mutation flows.
  - E2E: A1–A6; negative access tests for non-superadmin users.
  - Perf: List pagination; cache invalidation roundtrip.
  - Security: Ensure no public admin endpoints; verify `/forbidden` redirects.


