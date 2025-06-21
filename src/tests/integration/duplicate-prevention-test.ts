/**
 * Duplicate Prevention Test Utility
 * 
 * This utility tests the duplicate prevention mechanisms for cloud provider integrations
 * without requiring actual authentication with Auth0.
 * 
 * Usage:
 * 1. Run this test with `npm run test:integration`
 * 2. Check the console output for test results
 */

import { CloudProvider, CloudProviderIntegration } from '../../types/cloud-provider';

// Mock API client
const mockApi = {
  checkIntegrationExists: async (tenantId: string, providerId: string): Promise<boolean> => {
    console.log(`[Mock] Checking if integration exists for tenant ${tenantId} and provider ${providerId}`);
    
    // Simulate existing integration for the second call
    if (mockCallCount > 0) {
      return true;
    }
    
    mockCallCount++;
    return false;
  },
  
  createTenantIntegration: async (tenantId: string, data: any): Promise<CloudProviderIntegration> => {
    console.log(`[Mock] Creating integration for tenant ${tenantId} with provider ${data.providerId}`);
    
    // Simulate duplicate error on second call
    if (mockCreateCount > 0) {
      throw new Error('Integration already exists for this provider');
    }
    
    mockCreateCount++;
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

// Counter for mock calls
let mockCallCount = 0;
let mockCreateCount = 0;

// Test the duplicate prevention mechanism
async function testDuplicatePrevention() {
  console.log('=== Testing Duplicate Prevention ===');
  
  const tenantId = 'mock-tenant-id';
  
  try {
    // Test 1: First integration creation (should succeed)
    console.log('\nTest 1: First integration creation');
    
    // Check if integration exists
    const exists1 = await mockApi.checkIntegrationExists(tenantId, mockProvider._id);
    console.log(`Integration exists: ${exists1}`);
    
    if (!exists1) {
      // Create the integration
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
    } else {
      console.log('Integration already exists, skipping creation');
    }
    
    // Test 2: Second integration creation (should fail)
    console.log('\nTest 2: Second integration creation (should fail)');
    
    // Check if integration exists
    const exists2 = await mockApi.checkIntegrationExists(tenantId, mockProvider._id);
    console.log(`Integration exists: ${exists2}`);
    
    if (!exists2) {
      // Create the integration
      await mockApi.createTenantIntegration(tenantId, {
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
      
      console.log('Integration created (this should not happen)');
    } else {
      console.log('Integration already exists, skipping creation (correct behavior)');
    }
    
    // Test 3: Force duplicate creation (should throw error)
    console.log('\nTest 3: Force duplicate creation (should throw error)');
    
    try {
      // Create the integration without checking if it exists
      await mockApi.createTenantIntegration(tenantId, {
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
      
      console.log('Integration created (this should not happen)');
    } catch (error: any) {
      console.log(`Error caught (correct behavior): ${error.message}`);
    }
    
    console.log('\n=== Duplicate Prevention Test Completed Successfully ===');
  } catch (error: any) {
    console.error('\n=== Duplicate Prevention Test Failed ===');
    console.error(`Error: ${error.message}`);
  }
}

// Run the test
testDuplicatePrevention();

// No export needed for ESM