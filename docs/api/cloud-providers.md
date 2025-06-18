# Cloud Provider API Documentation

## Overview

The Cloud Provider API allows for managing cloud storage providers and tenant integrations with these providers. This API is split into two main parts:

1. **Cloud Providers** - Managed by SUPERADMIN users
2. **Cloud Provider Integrations** - Managed by tenant OWNER users

## Endpoints

### Cloud Providers

| Endpoint                      | Method | Role       | Description                      |
| ----------------------------- | ------ | ---------- | -------------------------------- |
| `/api/v1/cloud-providers`     | GET    | SUPERADMIN | List all cloud providers         |
| `/api/v1/cloud-providers`     | POST   | SUPERADMIN | Create a new cloud provider      |
| `/api/v1/cloud-providers/:id` | PATCH  | SUPERADMIN | Update an existing cloud provider|
| `/api/v1/cloud-providers/:id` | DELETE | SUPERADMIN | Delete a cloud provider          |

### Cloud Provider Integrations

| Endpoint                                          | Method | Role    | Description                      |
| ------------------------------------------------- | ------ | ------- | -------------------------------- |
| `/api/v1/tenants/:tenantId/integrations`          | GET    | OWNER   | List tenant's integrations       |
| `/api/v1/tenants/:tenantId/integrations`          | POST   | OWNER   | Create a new integration         |
| `/api/v1/tenants/:tenantId/integrations/:integrationId` | PATCH  | OWNER   | Update an existing integration   |
| `/api/v1/tenants/:tenantId/integrations/:integrationId` | DELETE | OWNER   | Delete an integration            |

## Data Models

### Cloud Provider Schema

```typescript
interface CloudProvider {
  _id: string;
  name: string;           // 3-50 chars
  slug: string;           // 2-20 chars, lowercase, alphanumeric with hyphens
  scopes: string[];       // OAuth scopes
  authUrl: string;        // OAuth authorization URL
  tokenUrl: string;       // OAuth token URL
  clientId: string;       // OAuth client ID
  clientSecret: string;   // OAuth client secret (encrypted)
  grantType: string;      // Default: "authorization_code"
  tokenMethod: string;    // Default: "POST"
  metadata: Record<string, unknown>; // Optional provider-specific metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;      // Auth0 sub
}
```

### Cloud Provider Integration Schema

```typescript
interface CloudProviderIntegration {
  _id: string;
  tenantId: string;       // Reference to tenant
  providerId: string;     // Reference to cloud provider
  accessToken?: string;   // OAuth access token (encrypted)
  refreshToken?: string;  // OAuth refresh token (encrypted)
  tokenExpiresAt?: Date;  // Token expiration date
  scopesGranted?: string[]; // Granted OAuth scopes
  status: 'active' | 'expired' | 'revoked' | 'error'; // Default: 'active'
  connectedAt?: Date;     // When the integration was established
  metadata?: Record<string, unknown>; // Optional integration-specific metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;      // Auth0 sub
}
```

## Request Examples

### Create Cloud Provider

```http
POST /api/v1/cloud-providers
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Google Drive",
  "slug": "google-drive",
  "scopes": ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.metadata.readonly"],
  "authUrl": "https://accounts.google.com/o/oauth2/auth",
  "tokenUrl": "https://oauth2.googleapis.com/token",
  "clientId": "your-client-id.apps.googleusercontent.com",
  "clientSecret": "your-client-secret",
  "grantType": "authorization_code",
  "tokenMethod": "POST",
  "metadata": {
    "projectId": "your-google-project-id"
  }
}
```

### Create Cloud Provider Integration

```http
POST /api/v1/tenants/{tenantId}/integrations
Content-Type: application/json
Authorization: Bearer {token}

{
  "providerId": "cloud-provider-id",
  "status": "active",
  "scopesGranted": ["https://www.googleapis.com/auth/drive.file"],
  "metadata": {
    "providerName": "Google Drive",
    "providerSlug": "google-drive"
  }
}
```

## Error Codes

- `cloud-integration/not-found`: Integration does not exist
- `cloud-integration/provider-not-found`: Referenced cloud provider does not exist
- `cloud-integration/tenant-not-found`: Referenced tenant does not exist
- `cloud-integration/already-exists`: Integration already exists for this tenant and provider
- `cloud-integration/invalid-input`: Invalid input data
- `cloud-integration/unauthorized`: User is not authorized for this operation