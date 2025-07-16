import { CloudProvider } from '../../cloud-providers/types';

/**
 * Integration Status Enum
 * Represents the current state of a cloud provider integration
 */
export type IntegrationStatus = 'pending' | 'active' | 'inactive' | 'expired' | 'error' | 'revoked';

/**
 * Integration Health Status
 * More detailed health status for monitoring
 */
export type IntegrationHealthStatus = 'healthy' | 'warning' | 'error' | 'critical';

/**
 * Integration Entity
 * Represents a cloud provider integration for a tenant
 */
export interface Integration {
  id: string;                    // Integration ID (transformed from _id)
  tenantId: string;             // Reference to tenant
  providerId: string;           // Reference to cloud provider
  provider?: CloudProvider;     // Populated provider data for UI convenience
  status: IntegrationStatus;    // Current integration status
  isActive?: boolean;           // Whether integration is active (derived from status)
  accessToken?: string;         // OAuth access token (encrypted in backend)
  refreshToken?: string;        // OAuth refresh token (encrypted in backend)
  tokenExpiresAt?: string;      // Token expiration date (ISO string)
  scopesGranted?: string[];     // Granted OAuth scopes
  connectedAt?: string;         // When integration was established (ISO string)
  lastUsedAt?: string;          // Last time integration was used (ISO string)
  metadata?: Record<string, unknown>; // Integration-specific metadata
  createdAt: string;            // ISO date string
  updatedAt: string;            // ISO date string
  createdBy: string;            // Auth0 user ID who created this integration
}

/**
 * Integration Creation Request
 * Data required to create a new integration
 */
export interface IntegrationCreateRequest {
  providerId: string;           // Required: ID of the cloud provider
  metadata?: {
    displayName?: string;       // Custom display name for the integration
    description?: string;       // Optional description
    [key: string]: unknown;     // Additional provider-specific metadata
  };
}

/**
 * Integration Update Request
 * Data that can be updated for an existing integration
 */
export interface IntegrationUpdateRequest {
  status?: IntegrationStatus;   // Update integration status
  isActive?: boolean;           // Update active status
  accessToken?: string;         // Update access token (will be encrypted)
  refreshToken?: string;        // Update refresh token (will be encrypted)
  tokenExpiresAt?: string;      // Update token expiration date (ISO string)
  scopesGranted?: string[];     // Update granted OAuth scopes
  connectedAt?: string;         // Update connection timestamp (ISO string)
  lastUsedAt?: string;          // Update last used timestamp (ISO string)
  metadata?: Record<string, unknown>; // Update integration-specific metadata
}

/**
 * Integration Health Status
 * Represents the health status of an integration
 */
export interface IntegrationHealth {
  integrationId: string;        // Integration ID
  status: 'healthy' | 'unhealthy' | 'unknown'; // Health status
  lastChecked: string;          // Last health check timestamp (ISO string)
  details?: {
    tokenValid?: boolean;       // Whether the token is valid
    apiReachable?: boolean;     // Whether the provider API is reachable
    scopesValid?: boolean;      // Whether the granted scopes are still valid
    errorMessage?: string;      // Error message if unhealthy
  };
  error?: string;               // Error message if health check failed
}

/**
 * Integration Usage Statistics
 * Statistics about integration usage
 */
export interface IntegrationUsageStats {
  integrationId: string;        // Integration ID
  totalRequests: number;        // Total API requests made
  successfulRequests: number;   // Successful API requests
  failedRequests: number;       // Failed API requests
  lastRequestAt?: string;       // Last API request timestamp (ISO string)
  bytesTransferred?: number;    // Total bytes transferred
  filesAccessed?: number;       // Number of files accessed
  period: {
    start: string;              // Statistics period start (ISO string)
    end: string;                // Statistics period end (ISO string)
  };
}

/**
 * Integration List Filters
 * Filters for querying integrations
 */
export interface IntegrationListFilters {
  status?: IntegrationStatus | IntegrationStatus[]; // Filter by status
  providerId?: string;          // Filter by provider ID
  search?: string;              // Search in display name or description
  sortBy?: 'createdAt' | 'updatedAt' | 'connectedAt' | 'lastUsedAt'; // Sort field
  sortOrder?: 'asc' | 'desc';   // Sort order
}

/**
 * Integration Test Result
 * Result of testing an integration connection
 */
export interface IntegrationTestResult {
  integrationId: string;        // Integration ID
  success: boolean;             // Whether the test was successful
  timestamp: string;            // Test timestamp (ISO string)
  details: {
    tokenValid: boolean;        // Token validation result
    apiReachable: boolean;      // API reachability result
    scopesValid: boolean;       // Scopes validation result
    responseTime?: number;      // API response time in milliseconds
  };
  error?: string;               // Error message if test failed
}