# Cloud Provider Integration Tests

This directory contains integration tests for the cloud provider integration functionality in the MWAP client application.

## Overview

These tests validate the implementation of cloud provider integrations, focusing on:

1. OAuth flow implementation
2. Duplicate prevention mechanisms
3. Token management
4. OAuth state parameter handling
5. API client methods

## Running the Tests

To run all integration tests:

```bash
npm run test:integration
```

This will execute all tests in this directory and output the results to the console.

## Test Files

- `oauth-state-test.ts`: Tests the creation and parsing of OAuth state parameters
- `oauth-flow-test.ts`: Tests the complete OAuth flow implementation
- `duplicate-prevention-test.ts`: Tests the duplicate prevention mechanisms
- `token-management-test.ts`: Tests the token management functionality
- `api-client-test.ts`: Tests the API client methods for cloud provider integrations

## Mock Implementation

These tests use mock implementations of the API client and other dependencies to simulate the behavior of the application without requiring actual authentication with Auth0 or real API calls.

## Test Coverage

These tests cover the following aspects of the cloud provider integration implementation:

1. **OAuth Flow**:
   - Creating an integration record
   - Building the OAuth URL
   - Handling the OAuth callback
   - Updating tokens using the authorization code

2. **Duplicate Prevention**:
   - Checking if an integration already exists
   - Preventing duplicate integrations
   - Handling duplicate creation attempts

3. **Token Management**:
   - Updating tokens using the authorization code
   - Refreshing tokens
   - Handling token expiration

4. **OAuth State Parameter**:
   - Creating and parsing state parameters
   - Including timestamp for security
   - Handling invalid state parameters
   - Checking for state expiration

5. **API Client Methods**:
   - Checking if an integration exists
   - Creating an integration
   - Updating integration tokens
   - Refreshing integration tokens