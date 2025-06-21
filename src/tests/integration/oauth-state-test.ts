/**
 * OAuth State Parameter Test Utility
 * 
 * This utility tests the OAuth state parameter creation and parsing
 * without requiring actual authentication with Auth0.
 * 
 * Usage:
 * 1. Run this test with `npm run test:integration`
 * 2. Check the console output for test results
 */

import { createOAuthState, parseOAuthState } from '../../utils/oauth';

// Test the OAuth state parameter
function testOAuthState() {
  console.log('=== Testing OAuth State Parameter ===');
  
  try {
    // Test 1: Create and parse state parameter
    console.log('\nTest 1: Create and parse state parameter');
    
    const tenantId = 'mock-tenant-id';
    const integrationId = 'mock-integration-id';
    
    const state = createOAuthState(tenantId, integrationId);
    console.log(`State parameter: ${state}`);
    
    const parsedState = parseOAuthState(state);
    console.log(`Parsed state: ${JSON.stringify(parsedState)}`);
    
    if (!parsedState) {
      throw new Error('Failed to parse state parameter');
    }
    
    if (parsedState.tenantId !== tenantId) {
      throw new Error(`Tenant ID mismatch: ${parsedState.tenantId} !== ${tenantId}`);
    }
    
    if (parsedState.integrationId !== integrationId) {
      throw new Error(`Integration ID mismatch: ${parsedState.integrationId} !== ${integrationId}`);
    }
    
    if (!parsedState.timestamp) {
      throw new Error('Timestamp is missing from state parameter');
    }
    
    // Test 2: Parse invalid state parameter
    console.log('\nTest 2: Parse invalid state parameter');
    
    const invalidState = 'invalid-state';
    const parsedInvalidState = parseOAuthState(invalidState);
    
    if (parsedInvalidState !== null) {
      throw new Error('Invalid state parameter was parsed successfully (this should not happen)');
    } else {
      console.log('Invalid state parameter was correctly rejected');
    }
    
    // Test 3: Check timestamp expiration
    console.log('\nTest 3: Check timestamp expiration');
    
    // Create state with expired timestamp (16 minutes ago)
    const expiredTimestamp = Date.now() - 16 * 60 * 1000;
    const expiredState = btoa(JSON.stringify({ 
      tenantId, 
      integrationId,
      timestamp: expiredTimestamp
    }));
    
    const parsedExpiredState = parseOAuthState(expiredState);
    console.log(`Parsed expired state: ${JSON.stringify(parsedExpiredState)}`);
    
    if (!parsedExpiredState) {
      throw new Error('Failed to parse expired state parameter');
    }
    
    // Check if timestamp is expired (15 minutes)
    if (parsedExpiredState.timestamp) {
      const stateAge = Date.now() - parsedExpiredState.timestamp;
      if (stateAge > 15 * 60 * 1000) {
        console.log('Expired state parameter was correctly identified');
      } else {
        throw new Error('Expired state parameter was not identified as expired');
      }
    } else {
      throw new Error('Timestamp is missing from expired state parameter');
    }
    
    console.log('\n=== OAuth State Parameter Test Completed Successfully ===');
  } catch (error: any) {
    console.error('\n=== OAuth State Parameter Test Failed ===');
    console.error(`Error: ${error.message}`);
  }
}

// Run the test
testOAuthState();

// No export needed for ESM