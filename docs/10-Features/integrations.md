# Integrations Feature Specification

**Last Updated:** 2025-10-08

**Owner:** Lead Architect

**Status:** Implemented (frontend + backend)

## Overview

The Integrations feature enables a tenant to connect cloud providers (e.g., Dropbox, Google Drive, OneDrive) to MWAP using a backend-driven OAuth 2.0 with PKCE flow. Integrations are tenant-scoped, token handling occurs exclusively on the backend, and UI uses React Query with Mantine for management, health, and testing.

## Goals

- Create/update/delete integrations per tenant
- Backend-driven OAuth (PKCE + HMAC state) with popup flow
- Token lifecycle management (refresh, health, testing)
- Consistent UI/UX with recovery for errors and stale records

## Domain Model

```
Integration
id: string
tenantId: string
providerId: string
provider?: CloudProvider  // populated client-side for UI
status: 'pending' | 'active' | 'inactive' | 'expired' | 'error' | 'revoked'
metadata?: Record<string, unknown>
createdAt: ISO string
updatedAt: ISO string
createdBy: string

// server-side only (sanitized from client)
// accessToken (encrypted), refreshToken (encrypted), tokenExpiresAt, scopes
// oauth: { flowId, nonce, stateHash, pkceVerifier (encrypted), status, createdAt, expiresAt }
```

## Security & RBAC

- Only authenticated users can manage integrations
- Tenant Owner role required for create/update/delete
- Tokens never exposed to the client; all token operations are backend-only

## Backend API (Implemented)

Base prefix: `/api/v1`

### Tenant-scoped Integrations

| Method | Endpoint | Authorization | Description | Status |
|--------|----------|---------------|-------------|--------|
| GET | `/api/v1/tenants/:tenantId/integrations` | Tenant Owner | List integrations | ✅ Implemented |
| GET | `/api/v1/tenants/:tenantId/integrations/:integrationId` | Tenant Owner | Get integration | ✅ Implemented |
| POST | `/api/v1/tenants/:tenantId/integrations` | Tenant Owner | Create integration (pre-OAuth) | ✅ Implemented |
| PATCH | `/api/v1/tenants/:tenantId/integrations/:integrationId` | Tenant Owner | Update integration | ✅ Implemented |
| DELETE | `/api/v1/tenants/:tenantId/integrations/:integrationId` | Tenant Owner | Delete integration | ✅ Implemented |
| GET | `/api/v1/tenants/:tenantId/integrations/:integrationId/health` | Tenant Owner | Check integration health | ✅ Implemented |
| POST | `/api/v1/tenants/:tenantId/integrations/:integrationId/test` | Tenant Owner | Functional connection test (200 with success true/false) | ✅ Implemented |
| POST | `/api/v1/tenants/:tenantId/integrations/:integrationId/refresh-token` | Tenant Owner | Refresh access token | ✅ Implemented |

### OAuth (Backend-driven)

| Method | Endpoint | Authorization | Description | Status |
|--------|----------|---------------|-------------|--------|
| POST | `/api/v1/oauth/tenants/:tenantId/integrations/:integrationId/initiate` | Tenant Owner | Start OAuth; returns `authorizationUrl` | ✅ Implemented |
| GET | `/api/v1/oauth/callback?code&state` | Public | Provider redirects here; backend exchanges tokens | ✅ Implemented |
| GET | `/api/v1/oauth/success` and `/error` | Public | UX pages used by popup flow | ✅ Implemented |
| POST | `/api/v1/oauth/tenants/:tenantId/integrations/:integrationId/reset` | Tenant Owner | Clear ephemeral oauth context | ✅ Implemented |
| POST | `/api/v1/oauth/tenants/:tenantId/integrations/:integrationId/refresh` | Tenant Owner | Alternative refresh endpoint | ✅ Implemented |

Notes:
- Test endpoint returns 200 with `{ success: boolean, details, error? }` — client must not throw on `success:false`.
- Refresh returns sanitized integration (no tokens).

## Frontend Implementation

### Structure

```
src/features/integrations/
├── pages/
│   ├── IntegrationListPage.tsx
│   ├── IntegrationCreatePage.tsx
│   └── IntegrationDetailsPage.tsx
├── components/
│   ├── IntegrationWizard.tsx
│   ├── IntegrationCard.tsx
│   ├── TokenStatusBadge.tsx
│   ├── ProviderSelector.tsx
│   ├── OAuthButton.tsx
│   ├── IntegrationHealthMonitor.tsx
│   ├── IntegrationTestingPanel.tsx
│   └── BulkOperationsPanel.tsx
├── hooks/
│   ├── useIntegrations.ts
│   ├── useCreateIntegration.ts
│   ├── useUpdateIntegration.ts
│   ├── useDeleteIntegration.ts
│   ├── useOAuthFlow.ts
│   ├── useTokenManagement.ts
│   ├── useIntegrationHealth.ts
│   ├── useIntegrationTesting.ts
│   ├── useBulkOperations.ts
│   └── useIntegrationAnalytics.ts
├── types/
│   ├── integration.types.ts
│   └── oauth.types.ts
└── utils/
    ├── integrationUtils.ts
    ├── oauthUtils.ts
    └── constants.ts
```

### Key Hooks (Implemented)

- `useIntegrations` – list and fetch by ID; proper response handling (returns array/data directly)
- `useCreateIntegration` – creates integration (Step 3 flow)
- `useUpdateIntegration` – update metadata/settings
- `useDeleteIntegration` – delete integration
- `useOAuthFlow` – just-in-time integration creation + OAuth initiation; opens popup via `OAuthButton`
- `useTokenManagement` – refresh token, health check, connection test; test uses raw `response.data`
- `useIntegrationHealth` – periodic health polling
- `useIntegrationTesting` – structured testing suite support

### Pages & UX

- IntegrationListPage – shows integrations with status badges; fixed data transform for display
- IntegrationCreatePage – wizard; Step 2 collects metadata; Step 3 runs OAuth initiation
- IntegrationDetailsPage – detailed view:
  - Provider Information (fetched separately via `useCloudProviders().useCloudProvider`)
  - Connection Status (Test Now with result breakdown + latency)
  - Token Info (expiration in months/days)
  - Actions: Refresh token, Test connection, Edit, Delete

### OAuth Popup & Messaging

- `OAuthButton` opens placeholder popup synchronously, then navigates to `authorizationUrl`
- `OAuthCallbackPage` posts `oauth_success`/`oauth_error` via `postMessage` and also stores result in `localStorage` as fallback
- Opener listens to `message` events and polls `localStorage` during active flow
- Strict origin validation can be toggled; currently permissive for local debugging

## Error Handling

- Unified errors via `handleApiResponse`; avoid throwing for functional test failures
- On OAuth failure: opener-side cleanup modal allows deleting stale integration
- On refresh failure: show specific messages (e.g., needs re-auth) and keep details page stable

## Security

- Backend-only token handling; encrypted at rest; PKCE verifier never leaves backend
- HMAC-SHA256 state with TTL and nonce; backend callback authoritative
- Tenant-scoped endpoints; RBAC via Tenant Owner requirement

## Performance

- React Query caching + targeted invalidations (list/details/health)
- Popup pre-open to avoid blockers; lightweight details rendering

## Testing

- Unit: hooks and utilities (OAuth flow helpers, response handling)
- Integration: end-to-end OAuth with popup; success/error paths; localStorage fallback
- Manual: verify test endpoint behaviors for both success and failure responses

## References

- `docs/09-Reports-and-History/BACKEND_DRIVEN_OAUTH_MIGRATION.md`
- `docs/03-Frontend/integration-management.md`
- `docs/04-Backend/api-reference.md`
- `docs/05-Security/oauth-security.md`
