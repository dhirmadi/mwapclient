/**
 * Integration Test Runner
 * 
 * This script runs all integration tests for cloud provider integrations
 * without requiring actual authentication with Auth0.
 * 
 * Usage:
 * 1. Run this test with `npm run test:integration`
 * 2. Check the console output for test results
 */

import './oauth-state-test';
import './oauth-flow-test';
import './duplicate-prevention-test';
import './token-management-test';
import './api-client-test';

console.log('\n=== All Integration Tests Completed ===');