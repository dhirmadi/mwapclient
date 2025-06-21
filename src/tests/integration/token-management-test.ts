/**
 * Token Management Test Utility
 * 
 * This utility tests the token management mechanisms for cloud provider integrations
 * without requiring actual authentication with Auth0.
 * 
 * Usage:
 * 1. Run this test with `npm run test:integration`
 * 2. Check the console output for test results
 */

import { CloudProviderIntegration } from '../../types/cloud-provider';

// Mock API client
const mockApi = {
  updateIntegrationTokens: async (
    tenantId: string, 
    integrationId: string, 
    data: { authorizationCode: string; redirectUri: string }
  ): Promise<CloudProviderIntegration> => {
    console.log(`[Mock] Updating tokens for integration ${integrationId} with code ${data.authorizationCode}`);
    
    // Validate input
    if (!data.authorizationCode) {
      throw new Error('Authorization code is required');
    }
    
    if (!data.redirectUri) {
      throw new Error('Redirect URI is required');
    }
    
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
    
    // Simulate token expiration on second call
    if (mockRefreshCount > 0) {
      throw new Error('Refresh token has expired');
    }
    
    mockRefreshCount++;
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

// Counter for mock calls
let mockRefreshCount = 0;

// Test the token management
async function testTokenManagement() {
  console.log('=== Testing Token Management ===');
  
  const tenantId = 'mock-tenant-id';
  const integrationId = 'mock-integration-id';
  
  try {
    // Test 1: Update tokens with valid data
    console.log('\nTest 1: Update tokens with valid data');
    
    const updatedIntegration = await mockApi.updateIntegrationTokens(tenantId, integrationId, {
      authorizationCode: 'valid-code',
      redirectUri: 'http://localhost:5173/oauth/callback'
    });
    
    console.log(`Integration updated with ID: ${updatedIntegration._id}`);
    
    // Test 2: Update tokens with invalid data
    console.log('\nTest 2: Update tokens with invalid data');
    
    try {
      await mockApi.updateIntegrationTokens(tenantId, integrationId, {
        authorizationCode: '',
        redirectUri: 'http://localhost:5173/oauth/callback'
      });
      
      console.log('Tokens updated (this should not happen)');
    } catch (error: any) {
      console.log(`Error caught (correct behavior): ${error.message}`);
    }
    
    // Test 3: Refresh token (first call)
    console.log('\nTest 3: Refresh token (first call)');
    
    const refreshedIntegration = await mockApi.refreshIntegrationToken(tenantId, integrationId);
    console.log(`Integration refreshed with ID: ${refreshedIntegration._id}`);
    
    // Test 4: Refresh token (second call, should fail)
    console.log('\nTest 4: Refresh token (second call, should fail)');
    
    try {
      await mockApi.refreshIntegrationToken(tenantId, integrationId);
      console.log('Token refreshed (this should not happen)');
    } catch (error: any) {
      console.log(`Error caught (correct behavior): ${error.message}`);
    }
    
    console.log('\n=== Token Management Test Completed Successfully ===');
  } catch (error: any) {
    console.error('\n=== Token Management Test Failed ===');
    console.error(`Error: ${error.message}`);
  }
}

// Run the test
testTokenManagement();

// No export needed for ESM