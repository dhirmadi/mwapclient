export interface CloudProvider {
  id: string;             // Cloud provider ID (transformed from _id)
  name: string;           // Provider name
  slug: string;           // Provider slug
  scopes: string[];       // OAuth scopes
  authUrl: string;        // OAuth authorization URL
  tokenUrl: string;       // OAuth token URL
  clientId: string;       // OAuth client ID
  clientSecret: string;   // OAuth client secret (encrypted)
  grantType: string;      // OAuth grant type
  tokenMethod: string;    // OAuth token method
  metadata: Record<string, unknown>; // Provider-specific metadata
  createdAt: string;      // ISO date string
  updatedAt: string;      // ISO date string
  createdBy: string;      // Auth0 user ID who created this provider
}

export interface CloudProviderCreate {
  name: string;           // 3-50 chars
  slug: string;           // 2-20 chars, lowercase, alphanumeric with hyphens
  scopes: string[];       // OAuth scopes
  authUrl: string;        // OAuth authorization URL
  tokenUrl: string;       // OAuth token URL
  clientId: string;       // OAuth client ID
  clientSecret: string;   // OAuth client secret (encrypted)
  grantType?: string;     // Default: "authorization_code"
  tokenMethod?: string;   // Default: "POST"
  metadata?: Record<string, unknown>; // Optional provider-specific metadata
}

export interface CloudProviderUpdate {
  name?: string;
  slug?: string;
  scopes?: string[];
  authUrl?: string;
  tokenUrl?: string;
  clientId?: string;
  clientSecret?: string;
  grantType?: string;
  tokenMethod?: string;
  metadata?: Record<string, unknown>;
}

export interface CloudProviderIntegration {
  id: string;             // Integration ID (transformed from _id)
  tenantId: string;       // Reference to tenant
  providerId: string;     // Reference to cloud provider
  accessToken?: string;   // OAuth access token (encrypted)
  refreshToken?: string;  // OAuth refresh token (encrypted)
  tokenExpiresAt?: string; // Token expiration date (ISO string)
  scopesGranted?: string[]; // Granted OAuth scopes
  status: 'active' | 'expired' | 'revoked' | 'error'; // Integration status
  connectedAt?: string;   // When integration was established (ISO string)
  metadata?: Record<string, unknown>; // Integration-specific metadata
  createdAt: string;      // ISO date string
  updatedAt: string;      // ISO date string
  createdBy: string;      // Auth0 user ID who created this integration
  provider?: CloudProvider; // Added for UI convenience, not part of the API schema
}

export interface CloudProviderIntegrationCreate {
  providerId: string;     // Required: ID of the cloud provider
  status?: 'active' | 'expired' | 'revoked' | 'error'; // Default: 'active'
  accessToken?: string;   // OAuth access token (will be encrypted)
  refreshToken?: string;  // OAuth refresh token (will be encrypted)
  tokenExpiresAt?: string; // Token expiration date (ISO string)
  scopesGranted?: string[]; // Granted OAuth scopes
  connectedAt?: string;   // When integration was established (ISO string)
  metadata?: Record<string, unknown>; // Optional integration-specific metadata
}

export interface CloudProviderIntegrationUpdate {
  status?: 'active' | 'expired' | 'revoked' | 'error';
  accessToken?: string;   // OAuth access token (will be encrypted)
  refreshToken?: string;  // OAuth refresh token (will be encrypted)
  tokenExpiresAt?: string; // Token expiration date (ISO string)
  scopesGranted?: string[]; // Granted OAuth scopes
  connectedAt?: string;   // When integration was established (ISO string)
  metadata?: Record<string, unknown>; // Optional integration-specific metadata
}