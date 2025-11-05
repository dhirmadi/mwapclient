# Cloud Providers Feature Specification

**Last Updated:** 2025-10-08

**Owner:** Lead Architect

**Status:** Implemented (frontend + backend)

## Overview

Cloud Providers are system-level OAuth provider configurations (e.g., Dropbox, Google Drive, OneDrive). Tenants connect to these providers by creating tenant-specific Integrations. This document describes cloud provider management (admin), data model, APIs, frontend implementation, and security.

## Goals

- Maintain a catalog of OAuth-capable cloud providers
- Securely store provider credentials (clientId/clientSecret) server-side
- Expose provider metadata (scopes, URLs) for Integration flows

## Domain Model

```
CloudProvider
id: string
name: string
slug: string
type?: string           // e.g., 'dropbox', 'google-drive'
description?: string
isActive?: boolean
scopes: string[]
authUrl: string
tokenUrl: string
clientId: string
clientSecret: string    // encrypted at rest
grantType: string       // default: authorization_code
tokenMethod: string     // default: POST
metadata: Record<string, unknown>
createdAt: ISO string
updatedAt: ISO string
createdBy: string
```

## Security & RBAC

- Only SuperAdmin (platform) can create/update/delete cloud providers
- Credentials never sent to the client; used only by backend OAuth flows

## Backend API (Implemented)

Base prefix: `/api/v1`

| Method | Endpoint | Authorization | Description | Status |
|--------|----------|---------------|-------------|--------|
| GET | `/api/v1/cloud-providers` | Authenticated | List providers (sanitized) | ✅ Implemented |
| GET | `/api/v1/cloud-providers/:id` | Authenticated | Get provider (sanitized) | ✅ Implemented |
| POST | `/api/v1/cloud-providers` | SuperAdmin | Create provider | ✅ Implemented |
| PATCH | `/api/v1/cloud-providers/:id` | SuperAdmin | Update provider | ✅ Implemented |
| DELETE | `/api/v1/cloud-providers/:id` | SuperAdmin | Delete provider | ✅ Implemented |

Notes:
- Responses to clients are sanitized (no clientSecret exposure)
- Used by Integrations `initiate` to build provider-specific authorization URL

## Frontend Implementation

### Structure

```
src/features/cloud-providers/
├── pages/
│   ├── CloudProviderListPage.tsx
│   ├── CloudProviderCreatePage.tsx
│   └── CloudProviderEditPage.tsx
├── hooks/
│   └── useCloudProviders.ts    // list, get, create, update, delete
├── types/
│   └── cloud-provider.types.ts
```

### Hook: `useCloudProviders`

- List providers: `GET /cloud-providers`
- Get provider by ID: `GET /cloud-providers/:id` via nested `useCloudProvider(id)`
- Create provider: `POST /cloud-providers`
- Update provider: `PATCH /cloud-providers/:id`
- Delete provider: `DELETE /cloud-providers/:id`
- React Query caching with invalidations; validation and error logging included

### Pages & UX

- CloudProviderListPage – admin list with search/filter
- CloudProviderCreatePage – create new provider with validation
- CloudProviderEditPage – update fields (name, slug, scopes, URLs, metadata)

## Error Handling

- Unified via `handleApiResponse` and `handleDeleteResponse`
- Notifications shown by consuming pages; hooks log detailed diagnostics in DEV

## Security

- Secrets stored and used only in backend; client receives sanitized provider data
- Admin-only write operations; authenticated read for listing providers

## Performance

- 5-minute `staleTime` caching for provider list and details
- Targeted invalidation on create/update/delete

## References

- `docs/04-Backend/api-reference.md`
- `docs/03-Frontend/integration-management.md`
