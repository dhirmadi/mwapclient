# Cloud Provider API Documentation

## Overview

The Cloud Provider API allows for managing cloud storage providers and tenant integrations with these providers. This API is split into two main parts:

1. **Cloud Providers** - Managed by SUPERADMIN users
2. **Cloud Provider Integrations** - Managed by tenant OWNER users

This documentation covers both the API endpoints and the OAuth integration process.

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

# OAuth Integration Guide

This guide explains how to integrate with cloud providers using OAuth in the MWAP platform.

## Overview

MWAP supports OAuth-based integrations with cloud providers. The process involves:

1. Registering a cloud provider (admin only)
2. Creating an integration for a tenant
3. Completing the OAuth flow to obtain access tokens
4. Using the integration to access cloud provider resources

## Cloud Provider Registration (Admin Only)

Cloud providers must be registered by an admin before they can be used for integrations.

```http
POST /api/v1/cloud-providers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Dropbox",
  "slug": "dropbox",
  "scopes": ["files.content.read", "files.metadata.read"],
  "authUrl": "https://www.dropbox.com/oauth2/authorize",
  "tokenUrl": "https://api.dropboxapi.com/oauth2/token",
  "clientId": "your-dropbox-app-key",
  "clientSecret": "your-dropbox-app-secret",
  "grantType": "authorization_code",
  "tokenMethod": "POST",
  "metadata": {
    "apiBaseUrl": "https://api.dropboxapi.com/2"
  }
}
```

## Creating a Cloud Provider Integration

To create an integration for a tenant:

```http
POST /api/v1/tenants/:tenantId/integrations
Authorization: Bearer <tenant_owner_token>
Content-Type: application/json

{
  "providerId": "65a1b2c3d4e5f6a7b8c9d0e1",
  "status": "active",
  "metadata": {
    "displayName": "My Dropbox",
    "description": "Integration for project files"
  }
}
```

The `providerId` must be a valid MongoDB ObjectId that corresponds to an existing cloud provider in the database.

## OAuth Flow

The OAuth flow is handled separately from the integration creation. Here's how it works:

1. **Get the OAuth authorization URL**:
   ```javascript
   // Frontend code
   const provider = await api.get(`/api/v1/cloud-providers?slug=dropbox`);
   const authUrl = `${provider.authUrl}?client_id=${provider.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(provider.scopes.join(' '))}`;
   // Redirect the user to authUrl
   ```

2. **Handle the OAuth callback**:
   ```javascript
   // Frontend code - After OAuth redirect
   const code = new URLSearchParams(window.location.search).get('code');
   if (code) {
     // Exchange the code for tokens
     const response = await api.patch(`/api/v1/tenants/${tenantId}/integrations/${integrationId}`, {
       accessToken: code, // The backend will exchange this for actual tokens
       metadata: {
         oauth_code: code,
         redirect_uri: redirectUri
       }
     });
   }
   ```

3. **Backend token exchange**:
   The backend will use the code to exchange for access and refresh tokens, then store them securely.

## Using the Integration

Once the integration is set up and the OAuth flow is complete, you can use the integration to access cloud provider resources:

```http
GET /api/v1/projects/:projectId/files?folder=/
Authorization: Bearer <user_token>
```

The backend will use the stored access token to fetch files from the cloud provider.

## Error Handling

Common errors and their meanings:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: User does not have permission
- `404 Not Found`: Resource not found
- `409 Conflict`: Integration already exists

Error responses include a code that can be used to identify the specific error:

```json
{
  "success": false,
  "error": {
    "message": "Cloud provider not found",
    "code": "cloud-integration/provider-not-found",
    "status": 404
  }
}
```

## Security Considerations

- Access tokens and refresh tokens are encrypted in the database
- The OAuth flow should use PKCE (Proof Key for Code Exchange) for public clients
- Always use HTTPS for all API requests
- Validate all input data on both client and server
- Implement proper error handling and logging

## Example: Complete OAuth Flow

Here's a complete example of how to implement the OAuth flow in a frontend application:

```javascript
// Step 1: Create the integration
const createIntegration = async (tenantId, providerId) => {
  const response = await api.post(`/api/v1/tenants/${tenantId}/integrations`, {
    providerId,
    metadata: {
      displayName: "My Dropbox",
      description: "Integration for project files"
    }
  });
  return response.data;
};

// Step 2: Start the OAuth flow
const startOAuthFlow = async (providerId) => {
  const provider = await api.get(`/api/v1/cloud-providers/${providerId}`);
  const redirectUri = `${window.location.origin}/oauth/callback`;
  const state = generateRandomState(); // Generate a random state for CSRF protection
  
  // Store the state and integration ID in session storage
  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('integration_id', integration._id);
  
  const authUrl = `${provider.authUrl}?client_id=${provider.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(provider.scopes.join(' '))}&state=${state}`;
  
  // Redirect the user to the authorization URL
  window.location.href = authUrl;
};

// Step 3: Handle the OAuth callback
const handleOAuthCallback = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  
  // Verify the state to prevent CSRF attacks
  if (state !== sessionStorage.getItem('oauth_state')) {
    throw new Error('Invalid state parameter');
  }
  
  const integrationId = sessionStorage.getItem('integration_id');
  const tenantId = getCurrentTenantId(); // Get the current tenant ID
  
  // Update the integration with the OAuth code
  const response = await api.patch(`/api/v1/tenants/${tenantId}/integrations/${integrationId}`, {
    metadata: {
      oauth_code: code,
      redirect_uri: `${window.location.origin}/oauth/callback`
    }
  });
  
  // Clear the session storage
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('integration_id');
  
  // Redirect to the integrations page
  window.location.href = '/integrations';
};
```

## Troubleshooting

If you encounter issues with the OAuth flow:

1. Check that the cloud provider is correctly registered with valid OAuth credentials
2. Ensure the redirect URI matches the one registered with the cloud provider
3. Verify that the required scopes are included in the authorization request
4. Check the browser console and server logs for error messages
5. Verify that the integration exists and is active
6. Ensure the user has the necessary permissions to create and update integrations