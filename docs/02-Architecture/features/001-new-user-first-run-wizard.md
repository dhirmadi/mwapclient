## Executive Summary

- Problem: New authenticated users without a tenant or project roles lack a guided path to productivity.
- Target users: First-time non-SuperAdmin users; SuperAdmins should stay on their dashboard.
- Core outcome: A gated first-run wizard to create a tenant, connect a cloud integration via OAuth/PKCE, and create the first project.
- Success metrics: A1–A6 AC met; median TTFP ≤ 90s; OAuth completion ≥ 95% (excl. provider outages); zero routing flicker.

## User Stories & Non-Goals

### User Stories (GWT)
- Given I’m authenticated and have no tenant and no project roles, when roles finish loading, then I’m redirected to `/welcome` without flicker.
- Given I’m SuperAdmin, when roles load, then I remain on the SuperAdmin dashboard.
- Given I haven’t created a tenant, when I open `/welcome/integration`, then I’m redirected to `/welcome/tenant`.
- Given I submit a valid tenant name (3–50), when the app POSTs `/tenants` and receives 201, then roles refetch and I’m sent to `/welcome/integration`.
- Given providers and integrations are loaded, when I click Connect on a provider, then the app creates an integration, initiates OAuth, opens a popup, on `oauth_success` refetches integrations and navigates to `/welcome/project`.
- Given the OAuth popup was opened, when I close it early, then I remain on `/welcome/integration` with a retry CTA.
- Given at least one healthy integration and project types are loaded, when I choose type + integration + folder and submit, then the app POSTs `/projects` (201) and navigates to `/projects/:id` with success toast.
- Given folders API errors, when browsing fails, then I can manually enter `folderpath` with validation and an info tooltip.

### Non-Goals
- SuperAdmin catalogs/administration beyond routing to the SuperAdmin dashboard.
- Advanced tenant settings, member management, multi-tenant switching.
- Provider catalog management or backend OAuth callback processing (backend-owned).
- Inventing new backend endpoints beyond the defined subset.

## Domain & Data Contracts

### Entities
- UserRoles → roles and tenant context for routing gates.
- Tenant → user-owned workspace (one per user enforced by backend).
- CloudProvider → available providers to integrate (e.g., `gdrive`, `dropbox`).
- Integration → tenant-scoped provider connection; status-driven lifecycle.
- OAuthInitiateResponse → `authorizationUrl` for popup.
- ProjectType → available project categories.
- Project → tenant project with immutable triplet.
- Folder → provider-agnostic folder node for picker.

### API Surface (method + path)
- GET `/api/v1/users/me/roles` → 200 `UserRoles`.
- POST `/api/v1/tenants` body `{ name: string }` → 201 `Tenant`; 409 `ApiError`.
- GET `/api/v1/cloud-providers` → 200 `CloudProvider[]`.
- GET `/api/v1/tenants/{tenantId}/integrations` → 200 `Integration[]`.
- POST `/api/v1/tenants/{tenantId}/integrations` body `{ providerId: string }` → 201 `Integration`.
- POST `/api/v1/oauth/tenants/{tenantId}/integrations/{integrationId}/initiate` → 200 `OAuthInitiateResponse`.
- GET `/api/v1/project-types` → 200 `ProjectType[]`.
- GET `/api/v1/tenants/{tenantId}/integrations/{integrationId}/folders?path?&folderId?&cursor?` → 200 `{ items: Folder[]; nextCursor?: string }`.
- POST `/api/v1/projects` body `{ name: string; projectTypeId: string; cloudIntegrationId: string; folderpath: string }` → 201 `Project`.

### Types (TS)
```ts
type UserRoles = {
  isSuperAdmin: boolean;
  isTenantOwner: boolean;
  tenantId?: string;
  projectRoles: Array<{ projectId: string; role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER' }>;
};

type Tenant = { id: string; name: string; ownerId: string; createdAt: string };

type CloudProvider = { id: string; name: string; code: string; iconUrl?: string; capabilities?: string[] };

type Integration = {
  id: string;
  tenantId: string;
  providerId: string;
  status: 'PENDING' | 'AUTHORIZED' | 'ERROR' | 'DISCONNECTED';
  displayName?: string;
  createdAt: string;
  updatedAt: string;
};

type OAuthInitiateResponse = { authorizationUrl: string };

type ProjectType = { id: string; name: string; description?: string };

type Project = {
  id: string;
  tenantId: string;
  name: string; // 1-100
  projectTypeId: string; // immutable
  cloudIntegrationId: string; // immutable
  folderpath: string; // immutable
  createdAt: string;
};

type Folder = { id: string; name: string; path: string; isContainer: boolean };

type ApiError = { status: number; code: string; message: string; details?: unknown };
```

### Error Envelope & Pagination
- Errors: 4xx/5xx return `ApiError`. Display `message`; log `code`/`status`.
- Pagination: folders support cursor pagination via `cursor` query param and `nextCursor` in response.

### Invariants & Immutables
- One tenant per user; backend returns 409 if violated.
- Project immutables: `projectTypeId`, `cloudIntegrationId`, `folderpath` cannot change after creation.
- OAuth flow is backend-driven; frontend never handles tokens directly.

## RBAC & Security

### Route Guards & Action Permissions
| Role | Access to `/welcome/*` | Create Tenant | Create/Initiate Integration | Create Project |
|---|---|---|---|---|
| superAdmin | No (stays on SuperAdmin dashboard) | N/A | N/A | N/A |
| tenantOwner | Yes (if first run) | Yes | Yes | Yes |
| projectOwner/Admin/Editor/Viewer | Not applicable pre-first-project | No | No | No |

- Gates: `ProtectedRoute` for all `/welcome/*`. Additional `WelcomeRouteGuard` enforces step prerequisites.
- Dashboard gate: On `/dashboard`, after `isReady` and roles fetched, redirect first-run users to `/welcome`.

### Auth Assumptions
- Auth0 session present; roles fetched via protected API.
- PKCE used for OAuth provider auth; popup opened on user gesture; completion via `postMessage`.

### Public vs Protected Routes
- Public: client route `/oauth/callback` only (popup flow). Backend `/api/v1/oauth/callback` remains authoritative.
- All other routes protected.

## UX Spec

### Routes
- `/welcome` → step router/redirector based on prerequisites.
- `/welcome/tenant` → create tenant.
- `/welcome/integration` → select provider, connect via OAuth popup.
- `/welcome/project` → choose type/integration/folder; create project.

### Pages & States
- Tenant: form (name 3–50); loading spinner; 409 shows friendly copy and refetches roles.
- Integration: list providers + existing integrations; Connect CTA; popup success → proceed; popup closed/error → stay with retry.
- Project: load project types; show integrations; folder picker (with pagination); fallback manual `folderpath` with validation.

### Validation & Copy
- Tenant name: Zod `string().min(3).max(50)`.
- Project name: Zod `string().min(1).max(100)`.
- Folderpath fallback: provider-normalized path, non-empty, URL-safe.
- Toasts:
  - Success: "Tenant created"; "Integration connected"; "You’re all set!" (on project create).
  - Errors: generic user-friendly; details logged.

### Accessibility
- Keyboard-accessible forms/buttons; focus moved to first error on submit.
- Popup initiation on explicit click to avoid blockers.
- Descriptive labels/aria; maintain AA contrast.

## Frontend Architecture

### Component Tree (leaf-only where new)
- `/welcome/tenant`: `WelcomeTenantPage`
  - `TenantForm`
- `/welcome/integration`: `WelcomeIntegrationPage`
  - `ProviderGrid` → `ProviderCard`
  - `OAuthPopupLauncher`
- `/welcome/project`: `WelcomeProjectPage`
  - `ProjectTypeSelect`
  - `IntegrationSelect`
  - `FolderPicker` (with pager) | `FolderpathInputFallback`

Reuse shared primitives: notifications, `LoadingSpinner`, Mantine inputs/buttons.

### State: Server vs Local
- Server (React Query): roles, providers, integrations, project types, folders.
- Local: form state (RHF), selected provider/integration/folder, popup state.

### Query Keys & Invalidation
- `['users','me','roles']`
- `['cloudProviders']`
- `['tenants', tenantId, 'integrations']`
- `['projectTypes']`
- `['tenants', tenantId, 'integrations', integrationId, 'folders', { path, cursor }]`
- Invalidate/Refetch on success:
  - Create tenant → refetch `roles`.
  - Create integration → refetch `integrations`.
  - OAuth success → refetch `integrations` then navigate.
  - Create project → invalidate `projects` and navigate.

### Error Handling Pattern
- API errors → centralized notification with generic copy; field-level errors surfaced via RHF resolver when applicable.
- OAuth errors or popup close → inline retry CTA; remain on integration step.

## File Plan (diff-style)

```
/src/features/welcome/
  /components/
    FolderPicker.tsx                 // Provider-agnostic folder browser with pagination
    FolderpathInputFallback.tsx      // Manual folderpath input with validation
    OAuthPopupLauncher.tsx           // Opens popup and wires postMessage to hook
    ProviderCard.tsx                 // Provider card with connect action
    ProviderGrid.tsx                 // Grid of providers + existing integrations
  /hooks/
    useDashboardGate.ts              // Gate `/dashboard` → `/welcome` redirect logic
    useWelcomeRouteGuard.ts          // Step prerequisite checks and redirects
    useOAuthPopup.ts                 // Popup lifecycle + postMessage handling
    useRolesQuery.ts                 // GET roles
    useTenantMutations.ts            // POST tenants
    useProvidersQuery.ts             // GET providers
    useIntegrationsQueries.ts        // GET integrations; POST create
    useOAuthInitiateMutation.ts      // POST oauth initiate
    useProjectTypesQuery.ts          // GET project types
    useFoldersQuery.ts               // GET folders with cursor
    useProjectCreateMutation.ts      // POST projects
  /pages/
    WelcomeRouter.tsx                // `/welcome` step router/redirector
    WelcomeTenantPage.tsx            // Tenant creation step UI
    WelcomeIntegrationPage.tsx       // Integration connect step UI
    WelcomeProjectPage.tsx           // Project creation step UI
  /types/
    index.ts                         // Re-export domain types used by the feature
  /utils/
    queryKeys.ts                     // Centralized query keys used in this feature
  index.ts                           // Explicit exports
src/core/router/AppRouter.tsx        // Add `/welcome/*` routes guarded by ProtectedRoute
```

For each file: purposes noted inline above.

## Testing Strategy

- Unit (hooks/utils):
  - `useDashboardGate` (first-run redirect, SuperAdmin stay).
  - `useWelcomeRouteGuard` (step prerequisites).
  - `useOAuthPopup` (success, error, closed early).
  - `useFoldersQuery` (cursor pagination, error fallback path).
  - Mutations invalidate/refetch correct keys.
- Component/Page:
  - Route protection and redirects per role matrix.
  - Tenant form validation (3–50), 201 and 409 paths.
  - Integration connect flow with mocked postMessage.
  - Project creation with folder picker and manual fallback.
- Contract tests:
  - Align mocked API responses with types in "Domain & Data Contracts".
  - Ensure error envelope (`ApiError`) handling.

## Risks & Mitigations

1. OAuth popup blocked → Open on user gesture; provide fallback link; show retry CTA.
2. Provider folder API inconsistencies → Manual `folderpath` fallback with validation and help text.
3. Race on roles/integrations refetch → Gate on `isReady`; await React Query refetch before routing.
4. Orphan PENDING integrations → Backend cleanup/reuse on retry (assumed backend policy).

## Rollout & Observability

- Feature flag: `firstRunWizard` gates `/welcome` and dashboard redirect.
- No data migration; user-scoped wizard, legacy users unaffected.
- Telemetry events:
  - `first_run.start` { userId }
  - `tenant.create.success|error` { code? }
  - `oauth.initiate` { providerId }
  - `oauth.result` { success: boolean, code? }
  - `project.create.success|error` { projectTypeId, integrationId }
  - `first_run.complete` { projectId }
- Operational runbook: Owner `frontend-platform`; alerts on OAuth failure spikes and create-project error rate; quick fix → disable flag, retry flows.

## Handoff Checklist (for AI coder)

- Endpoints & types finalized
- RBAC gates listed
- Query keys & invalidations listed
- Forms + validation rules listed
- Empty/error/loading states defined
- Copy & toasts included
- File plan accepted

## Style Rules

- Concise TypeScript; React Query for server state; RHF + Zod for forms.
- Reuse `src/shared/utils/api.ts` client; no ad-hoc fetches.
- Use `ProtectedRoute`, role gates from `src/core/context/*` and `src/core/router/*`.
- Use Mantine v8 components; accessible labels and focus management.

