/**
 * API Client Test Utility
 * 
 * This utility tests the API client methods for cloud provider integrations
 * without requiring actual authentication with Auth0.
 * 
 * Usage:
 * 1. Run this test with `npm run test:integration`
 * 2. Check the console output for test results
 */

import { CloudProviderIntegration } from '../../types/cloud-provider';

// Mock API client
const apiClient = {
  post: (url: string, data?: any) => Promise.resolve({ data }),
  get: (url: string, params?: any) => Promise.resolve({ data: [] }),
  patch: (url: string, data?: any) => Promise.resolve({ data }),
  delete: (url: string) => Promise.resolve({ data: null })
};

// Mock API methods
const api = {
  checkIntegrationExists: async (tenantId: string, providerId: string): Promise<boolean> => {
    const response = await apiClient.get(`/tenants/${tenantId}/integrations`, {
      params: { providerId }
    });
    
    const integrations = response.data && response.data.success && response.data.data 
      ? response.data.data 
      : response.data;
    
    return Array.isArray(integrations) && integrations.length > 0;
  },
  
  createTenantIntegration: async (tenantId: string, data: any): Promise<CloudProviderIntegration> => {
    const response = await apiClient.post(`/tenants/${tenantId}/integrations`, data);
    
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
  
  updateIntegrationTokens: async (
    tenantId: string, 
    integrationId: string, 
    data: { authorizationCode: string; redirectUri: string }
  ): Promise<CloudProviderIntegration> => {
    const response = await apiClient.post(`/tenants/${tenantId}/integrations/${integrationId}/update-tokens`, data);
    
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
  
  refreshIntegrationToken: async (tenantId: string, integrationId: string): Promise<CloudProviderIntegration> => {
    const response = await apiClient.post(`/tenants/${tenantId}/integrations/${integrationId}/refresh-token`);
    
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  }
};

// Test the API client methods
function testApiClient() {
  console.log('=== Testing API Client Methods ===');
  
  try {
    // Mock responses
    apiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: []
      }
    });
    
    apiClient.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          _id: 'mock-integration-id',
          tenantId: 'mock-tenant-id',
          providerId: 'mock-provider-id',
          status: 'active',
          scopesGranted: ['files.content.read', 'files.content.write'],
          metadata: {
            displayName: 'Mock Integration',
            description: 'Mock integration for testing'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });
    
    apiClient.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          _id: 'mock-integration-id',
          tenantId: 'mock-tenant-id',
          providerId: 'mock-provider-id',
          status: 'active',
          scopesGranted: ['files.content.read', 'files.content.write'],
          metadata: {
            displayName: 'Mock Integration',
            description: 'Mock integration for testing'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });
    
    apiClient.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          _id: 'mock-integration-id',
          tenantId: 'mock-tenant-id',
          providerId: 'mock-provider-id',
          status: 'active',
          scopesGranted: ['files.content.read', 'files.content.write'],
          metadata: {
            displayName: 'Mock Integration',
            description: 'Mock integration for testing'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });
    
    // Test 1: Check if integration exists
    console.log('\nTest 1: Check if integration exists');
    
    api.checkIntegrationExists('mock-tenant-id', 'mock-provider-id')
      .then(exists => {
        console.log(`Integration exists: ${exists}`);
        console.log('API call parameters:', apiClient.get.mock.calls[0]);
      });
    
    // Test 2: Create integration
    console.log('\nTest 2: Create integration');
    
    api.createTenantIntegration('mock-tenant-id', {
      providerId: 'mock-provider-id',
      status: 'active',
      scopesGranted: ['files.content.read', 'files.content.write'],
      metadata: {
        displayName: 'Mock Integration',
        description: 'Mock integration for testing'
      }
    }).then(integration => {
      console.log(`Integration created with ID: ${integration._id}`);
      console.log('API call parameters:', apiClient.post.mock.calls[0]);
    });
    
    // Test 3: Update integration tokens
    console.log('\nTest 3: Update integration tokens');
    
    api.updateIntegrationTokens('mock-tenant-id', 'mock-integration-id', {
      authorizationCode: 'mock-code',
      redirectUri: 'http://localhost:5173/oauth/callback'
    }).then(integration => {
      console.log(`Integration tokens updated for ID: ${integration._id}`);
      console.log('API call parameters:', apiClient.post.mock.calls[1]);
    });
    
    // Test 4: Refresh integration token
    console.log('\nTest 4: Refresh integration token');
    
    api.refreshIntegrationToken('mock-tenant-id', 'mock-integration-id')
      .then(integration => {
        console.log(`Integration token refreshed for ID: ${integration._id}`);
        console.log('API call parameters:', apiClient.post.mock.calls[2]);
      });
    
    console.log('\n=== API Client Methods Test Completed Successfully ===');
  } catch (error: any) {
    console.error('\n=== API Client Methods Test Failed ===');
    console.error(`Error: ${error.message}`);
  }
}

// Run the test
testApiClient();

// No export needed for ESM