# Tenants Feature Specification

**Last Updated:** 2025-10-08

**Owner:** Lead Architect

**Status:** Implemented (frontend + backend)

## Overview

Tenants are organizational containers representing customer accounts in MWAP. All resources (projects, integrations, users-as-members) are scoped to a tenant. This document describes the implemented Tenants feature: capabilities, APIs, frontend implementation, security, and operations.

## Goals

- Provide CRUD for tenant entities (Owner-managed)
- Enforce strict multi-tenant isolation across all data
- Centralize tenant-level settings and metadata
- Serve as the scope for integrations and projects

## Domain Model

```
Tenant
id: string
name: string
description?: string
ownerUserId: string
createdAt: ISO string
updatedAt: ISO string
settings?: {
  timezone?: string;
  locale?: string;
  notifications?: { enabled: boolean };
}
```

Relationships:

- Tenant has many Integrations
- Tenant has many Projects
- Tenant Owner manages tenant settings

## Security & RBAC

- Only authenticated users can access tenant data
- Tenant Owner has full control over their tenant
- Server validates that the caller belongs to the tenant context for every request
- Frontend uses `ProtectedRoute` with `TENANT_OWNER` checks for owner-only pages

## Backend API (Implemented)

Base prefix: `/api/v1`

### Tenant APIs (Owner-facing)

| Method | Endpoint | Authorization | Description | Status |
|--------|----------|---------------|-------------|--------|
| GET | `/api/v1/tenants/me` | Authenticated | Get the tenant owned by current user | ✅ Implemented |
| GET | `/api/v1/tenants/:tenantId` | Tenant Owner | Get tenant by ID | ✅ Implemented |
| PATCH | `/api/v1/tenants/:tenantId` | Tenant Owner | Update tenant settings/metadata | ✅ Implemented |

### Tenant Administration APIs (SuperAdmin/internal)

| Method | Endpoint | Authorization | Description | Status |
|--------|----------|---------------|-------------|--------|
| GET | `/api/v1/tenants` | SuperAdmin | List tenants (supports `?includeArchived=true`) | ✅ Implemented |
| POST | `/api/v1/tenants` | SuperAdmin | Create tenant | ✅ Implemented |
| DELETE | `/api/v1/tenants/:tenantId` | SuperAdmin | Delete tenant | ✅ Implemented |

Notes:

- Response format uses `{ success, data }` wrapper
- Validation with Zod (server-side) and consistent error codes
- Archived listing available via `GET /tenants?includeArchived=true`

### Integrations under Tenant (see Integrations Feature)

- `POST /api/v1/tenants/:tenantId/integrations` – create integration
- `GET /api/v1/tenants/:tenantId/integrations` – list integrations
- `GET /api/v1/tenants/:tenantId/integrations/:integrationId` – get integration
- `PATCH /api/v1/tenants/:tenantId/integrations/:integrationId` – update
- `DELETE /api/v1/tenants/:tenantId/integrations/:integrationId` – delete

## Frontend Implementation

### Feature Structure

```
src/features/tenants/
├── pages/
│   ├── TenantListPage.tsx
│   ├── TenantDetailsPage.tsx
│   ├── TenantCreatePage.tsx
│   ├── TenantEditPage.tsx
│   ├── TenantSettingsPage.tsx
│   └── TenantManagementPage.tsx
├── hooks/
│   ├── useTenant.ts
│   ├── useTenants.ts   // list current/admin tenants, expose delete mutation
│   ├── useCreateTenant.ts
│   └── useUpdateTenant.ts
├── types/
│   └── tenant.types.ts
└── components/
    ├── TenantSummary.tsx
    └── TenantSettingsForm.tsx
```

### Key Hooks (Implemented)

- `useTenant` – fetch a tenant by ID (`GET /tenants/:id`)
- `useTenants` – list active and archived tenants (admin), fetch current tenant (`GET /tenants/me`), and expose delete mutation
- `useCreateTenant` – create tenant (admin workflows)
- `useUpdateTenant` – update tenant settings

### Pages

- TenantListPage – admin list of tenants with search/filters
- TenantDetailsPage – view tenant details
- TenantCreatePage – admin create flow
- TenantEditPage – edit tenant metadata/settings
- TenantSettingsPage – owner-facing settings for current tenant
- TenantManagementPage – aggregate operations/overview

## UX Requirements

- Mantine v8; consistent theming and a11y
- Clear affordances for owner-only vs admin-only actions
- Inline validation with Zod
- Centralized notifications for success/error

## Security Requirements

- Auth0 PKCE; JWT injected by `api.ts` interceptor
- `ProtectedRoute` for all tenant owner/admin flows
- Never expose secrets; all integration interactions via backend

## Error Handling

- Unified error surface via `handleApiResponse`
- Specific error codes: `auth/unauthorized`, `auth/forbidden`, `resource/not-found`, `validation/invalid-input`
- Notifications on failure with actionable messages

## Performance

- React Query caching for tenant and integration lists
- Invalidate queries on updates to keep UI consistent

## Testing

### Backend

- Unit: tenant read/update with RBAC
- Integration: tenant with integrations listing and admin flows

### Frontend

- Unit: hooks (happy/error paths) and forms
- Component: settings form validation
- E2E: owner views/updates settings; admin creates/edits/deletes tenant

## Operations

- Audit log tenant updates (who, when, fields changed)
- Rate limit settings updates to prevent abuse
- Ensure data export pathway (future)

## References

- `docs/02-Architecture/README.md`
- `docs/03-Frontend/README.md`
- `docs/04-Backend/api-reference.md`
- `docs/05-Security/rbac.md`
- `docs/06-Guidelines/development-guide.md`
