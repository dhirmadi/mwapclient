# Cloud Provider Integration Implementation

This document provides an overview of the implementation of cloud provider integrations in the MWAP client application.

## Implementation Overview

The cloud provider integration implementation follows a three-phase approach:

1. **Phase 1**: Documentation and API updates
2. **Phase 2**: Code refactoring
3. **Phase 3**: Testing and validation

## Phase 1: Documentation and API Updates

In Phase 1, we:

1. Documented the current issues with cloud provider integrations
2. Updated the API documentation with recommended payload structure
3. Added guidance on proper OAuth flow implementation
4. Added documentation on token management

## Phase 2: Code Refactoring

In Phase 2, we:

1. Added dedicated token update methods to the API client
2. Refactored the OAuth callback to use the token update endpoint
3. Added duplicate prevention mechanisms
4. Implemented proper separation of concerns

### Key Changes

#### API Client

Added new methods to the API client:

- `updateIntegrationTokens`: Updates OAuth tokens for an existing integration
- `refreshIntegrationToken`: Refreshes OAuth tokens for an existing integration
- `checkIntegrationExists`: Checks if an integration already exists for a tenant and provider

#### OAuth Flow

Refactored the OAuth flow to follow the recommended approach:

1. Create the integration record first
2. Use the dedicated token update endpoint
3. Properly handle the OAuth callback

#### Duplicate Prevention

Added duplicate prevention mechanisms:

- Check if an integration already exists before creating a new one
- Handle duplicate creation attempts gracefully

#### Token Management

Implemented proper token management:

- Use the dedicated token update endpoint
- Refresh tokens when they expire
- Handle token expiration gracefully

## Phase 3: Testing and Validation

In Phase 3, we:

1. Created unit tests for our new API methods
2. Validated the OAuth flow implementation
3. Tested the duplicate prevention mechanisms
4. Verified proper token management

### Test Implementation

Created the following tests:

- `oauth-state-test.ts`: Tests the creation and parsing of OAuth state parameters
- `oauth-flow-test.ts`: Tests the complete OAuth flow implementation
- `duplicate-prevention-test.ts`: Tests the duplicate prevention mechanisms
- `token-management-test.ts`: Tests the token management functionality
- `api-client-test.ts`: Tests the API client methods for cloud provider integrations

## Implementation Details

### API Client Methods

```typescript
updateIntegrationTokens: debugApiCall('updateIntegrationTokens', async (
  tenantId: string, 
  integrationId: string, 
  data: { authorizationCode: string; redirectUri: string }
): Promise<CloudProviderIntegration> => {
  const response = await apiClient.post(`/tenants/${tenantId}/integrations/${integrationId}/update-tokens`, data);
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  return response.data;
}),

refreshIntegrationToken: debugApiCall('refreshIntegrationToken', async (
  tenantId: string, 
  integrationId: string
): Promise<CloudProviderIntegration> => {
  const response = await apiClient.post(`/tenants/${tenantId}/integrations/${integrationId}/refresh-token`);
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  return response.data;
}),

checkIntegrationExists: debugApiCall('checkIntegrationExists', async (
  tenantId: string, 
  providerId: string
): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/tenants/${tenantId}/integrations`, {
      params: { providerId }
    });
    
    const integrations = response.data && response.data.success && response.data.data 
      ? response.data.data 
      : response.data;
    
    return Array.isArray(integrations) && integrations.length > 0;
  } catch (error) {
    console.error('Error checking if integration exists:', error);
    return false;
  }
})
```

### OAuth Flow Implementation

```typescript
// Initiate OAuth flow
const initiateOAuthFlow = async (provider: CloudProvider) => {
  if (!roles?.tenantId) {
    notifications.show({
      title: 'Error',
      message: 'Tenant ID is required to initiate OAuth flow',
      color: 'red',
      autoClose: 5000
    });
    return;
  }
  
  try {
    // First, check if an integration already exists for this provider
    const exists = await api.checkIntegrationExists(roles.tenantId, provider._id);
    if (exists) {
      notifications.show({
        title: 'Integration Exists',
        message: 'An integration for this provider already exists.',
        color: 'yellow',
        autoClose: 5000
      });
      return;
    }
    
    // Create the integration first
    const integration = await api.createTenantIntegration(roles.tenantId, {
      providerId: provider._id,
      status: 'active',
      scopesGranted: provider.scopes,
      metadata: {
        providerName: provider.name,
        providerSlug: provider.slug,
        displayName: `${provider.name} Integration`,
        description: `Integration with ${provider.name} for cloud storage access.`
      }
    });
    
    // Create state parameter with tenant and integration info
    const state = createOAuthState(roles.tenantId, integration._id);
    
    // Build OAuth URL
    const authUrl = new URL(provider.authUrl);
    
    // Add required OAuth parameters
    authUrl.searchParams.append('client_id', provider.clientId);
    authUrl.searchParams.append('response_type', 'code');
    
    // Use the configured redirect URI that matches what's configured in the OAuth provider
    const redirectUri = getOAuthRedirectUri();
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);
    
    // Add scopes if available
    if (provider.scopes && provider.scopes.length > 0) {
      authUrl.searchParams.append('scope', provider.scopes.join(' '));
    }
    
    // Redirect to OAuth provider
    window.location.href = authUrl.toString();
  } catch (error: any) {
    console.error('Failed to initiate OAuth flow:', error);
    
    notifications.show({
      title: 'Error',
      message: error.message || 'Failed to initiate OAuth authentication. Please try again.',
      color: 'red',
      autoClose: 5000
    });
  }
};
```

### OAuth Callback Implementation

```typescript
const handleOAuthCallback = async () => {
  try {
    // Extract query parameters
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    // Handle error from OAuth provider
    if (error) {
      setError(`Authentication error: ${error}${errorDescription ? `: ${errorDescription}` : ''}`);
      setLoading(false);
      return;
    }

    // Validate required parameters
    if (!code || !state) {
      setError('Missing required parameters (code or state)');
      setLoading(false);
      return;
    }

    // Parse state parameter (contains tenantId and integrationId)
    const stateData = parseOAuthState(state);
    
    if (!stateData) {
      setError('Invalid state parameter');
      setLoading(false);
      return;
    }

    // In the new approach, state contains tenantId and integrationId (not providerId)
    const { tenantId, integrationId, timestamp } = stateData;

    if (!tenantId || !integrationId) {
      setError('Missing tenant ID or integration ID in state parameter');
      setLoading(false);
      return;
    }

    // Check for state expiration (optional, 15 minutes)
    if (timestamp) {
      const stateAge = Date.now() - timestamp;
      if (stateAge > 15 * 60 * 1000) {
        setError('OAuth state has expired. Please try again.');
        setLoading(false);
        return;
      }
    }

    // Update the integration tokens using the dedicated endpoint
    await updateIntegrationTokens({
      tenantId,
      integrationId,
      authorizationCode: code,
      redirectUri: getOAuthRedirectUri()
    });

    // Handle success
    setSuccess(true);
    setLoading(false);

    notifications.show({
      title: 'Integration Successful',
      message: 'Cloud provider integration has been successfully set up',
      color: 'green',
      icon: <IconCheck size={16} />
    });

    // Redirect after a short delay
    setTimeout(() => {
      navigate('/tenant/integrations');
    }, 2000);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    setError(error.message || 'Failed to complete OAuth authentication');
    setLoading(false);
    
    notifications.show({
      title: 'Authentication Failed',
      message: error.message || 'Failed to complete OAuth authentication',
      color: 'red'
    });
  }
};
```

## Conclusion

The cloud provider integration implementation now follows the recommended approach:

1. Create the integration record first
2. Use the dedicated token update endpoint
3. Properly handle the OAuth callback
4. Prevent duplicate integrations
5. Implement proper token management

This implementation addresses the issues identified in Phase 1 and provides a more robust, secure, and maintainable solution for cloud provider integrations.