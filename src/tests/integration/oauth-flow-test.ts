/**
 * OAuth Flow Test Utility
 * 
 * This utility simulates the OAuth flow for cloud provider integrations
 * without requiring actual authentication with Auth0.
 * 
 * Usage:
 * 1. Run this test with `npm run test:integration`
 * 2. Check the console output for test results
 */

import { createOAuthState, parseOAuthState, getOAuthRedirectUri } from '../../utils/oauth';
import { CloudProvider, CloudProviderIntegration } from '../../types/cloud-provider';

// Mock API client
const mockApi = {
  checkIntegrationExists: async (tenantId: string, providerId: string): Promise<boolean> => {
    console.log(`[Mock] Checking if integration exists for tenant ${tenantId} and provider ${providerId}`);
    return false; // Simulate no existing integration
  },
  
  createTenantIntegration: async (tenantId: string, data: any): Promise<CloudProviderIntegration> => {
    console.log(`[Mock] Creating integration for tenant ${tenantId} with provider ${data.providerId}`);
    return {
      _id: 'mock-integration-id',
      tenantId,
      providerId: data.providerId,
      status: data.status,
      scopesGranted: data.scopesGranted,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },
  
  updateIntegrationTokens: async (tenantId: string, integrationId: string, data: any): Promise<CloudProviderIntegration> => {
    console.log(`[Mock] Updating tokens for integration ${integrationId} with code ${data.authorizationCode}`);
    return {
      _id: integrationId,
      tenantId,
      providerId: 'mock-provider-id',
      status: 'active',
      scopesGranted: ['files.content.read', 'files.content.write'],
      metadata: {
        displayName: 'Mock Integration',
        description: 'Mock integration for testing'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },
  
  refreshIntegrationToken: async (tenantId: string, integrationId: string): Promise<CloudProviderIntegration> => {
    console.log(`[Mock] Refreshing token for integration ${integrationId}`);
    return {
      _id: integrationId,
      tenantId,
      providerId: 'mock-provider-id',
      status: 'active',
      scopesGranted: ['files.content.read', 'files.content.write'],
      metadata: {
        displayName: 'Mock Integration',
        description: 'Mock integration for testing'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

// Mock cloud provider
const mockProvider: CloudProvider = {
  _id: 'mock-provider-id',
  name: 'Mock Provider',
  slug: 'mock-provider',
  description: 'Mock cloud provider for testing',
  authUrl: 'https://mock-provider.com/oauth/authorize',
  tokenUrl: 'https://mock-provider.com/oauth/token',
  clientId: 'mock-client-id',
  clientSecret: 'mock-client-secret',
  scopes: ['files.content.read', 'files.content.write'],
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Test the OAuth flow
async function testOAuthFlow() {
  console.log('=== Testing OAuth Flow ===');
  
  const tenantId = 'mock-tenant-id';
  
  try {
    // Step 1: Check if integration exists
    console.log('\nStep 1: Check if integration exists');
    const exists = await mockApi.checkIntegrationExists(tenantId, mockProvider._id);
    console.log(`Integration exists: ${exists}`);
    
    if (exists) {
      console.log('Integration already exists, skipping creation');
      return;
    }
    
    // Step 2: Create the integration
    console.log('\nStep 2: Create the integration');
    const integration = await mockApi.createTenantIntegration(tenantId, {
      providerId: mockProvider._id,
      status: 'active',
      scopesGranted: mockProvider.scopes,
      metadata: {
        providerName: mockProvider.name,
        providerSlug: mockProvider.slug,
        displayName: `${mockProvider.name} Integration`,
        description: `Integration with ${mockProvider.name} for cloud storage access.`
      }
    });
    
    console.log(`Integration created with ID: ${integration._id}`);
    
    // Step 3: Create state parameter
    console.log('\nStep 3: Create state parameter');
    const state = createOAuthState(tenantId, integration._id);
    console.log(`State parameter: ${state}`);
    
    // Step 4: Build OAuth URL
    console.log('\nStep 4: Build OAuth URL');
    const authUrl = new URL(mockProvider.authUrl);
    authUrl.searchParams.append('client_id', mockProvider.clientId);
    authUrl.searchParams.append('response_type', 'code');
    const redirectUri = getOAuthRedirectUri();
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', mockProvider.scopes.join(' '));
    
    console.log(`OAuth URL: ${authUrl.toString()}`);
    
    // Step 5: Simulate OAuth callback
    console.log('\nStep 5: Simulate OAuth callback');
    const code = 'mock-authorization-code';
    
    // Parse state parameter
    const parsedState = parseOAuthState(state);
    console.log(`Parsed state: ${JSON.stringify(parsedState)}`);
    
    if (!parsedState) {
      throw new Error('Invalid state parameter');
    }
    
    const { tenantId: parsedTenantId, integrationId, timestamp } = parsedState;
    
    if (!parsedTenantId || !integrationId) {
      throw new Error('Missing tenant ID or integration ID in state parameter');
    }
    
    // Check for state expiration
    if (timestamp) {
      const stateAge = Date.now() - timestamp;
      if (stateAge > 15 * 60 * 1000) {
        throw new Error('OAuth state has expired. Please try again.');
      }
    }
    
    // Step 6: Update integration tokens
    console.log('\nStep 6: Update integration tokens');
    await mockApi.updateIntegrationTokens(parsedTenantId, integrationId, {
      authorizationCode: code,
      redirectUri
    });
    
    // Step 7: Refresh integration token
    console.log('\nStep 7: Refresh integration token');
    await mockApi.refreshIntegrationToken(parsedTenantId, integrationId);
    
    console.log('\n=== OAuth Flow Test Completed Successfully ===');
  } catch (error: any) {
    console.error('\n=== OAuth Flow Test Failed ===');
    console.error(`Error: ${error.message}`);
  }
}

// Run the test
testOAuthFlow();

// No export needed for ESM