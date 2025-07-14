export interface CloudProvider {
  _id: string;
  name: string;           // 3-50 chars
  slug: string;           // 2-20 chars, lowercase, alphanumeric with hyphens
  scopes: string[];       // OAuth scopes
  authUrl: string;        // OAuth authorization URL
  tokenUrl: string;       // OAuth token URL
  clientId: string;       // OAuth client ID
  clientSecret: string;   // OAuth client secret (encrypted)
  grantType: string;      // Default: "authorization_code"
  tokenMethod: string;    // Default: "POST"
  metadata: Record<string, unknown>; // Optional provider-specific metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;      // Auth0 sub
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
  _id: string;
  tenantId: string;       // Reference to tenant
  providerId: string;     // Reference to cloud provider
  accessToken?: string;   // OAuth access token (encrypted)
  refreshToken?: string;  // OAuth refresh token (encrypted)
  tokenExpiresAt?: string; // Token expiration date
  scopesGranted?: string[]; // Granted OAuth scopes
  status: 'active' | 'expired' | 'revoked' | 'error'; // Default: 'active'
  connectedAt?: string;   // When the integration was established
  metadata?: Record<string, unknown>; // Optional integration-specific metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;      // Auth0 sub
  provider?: CloudProvider; // Added for UI convenience, not part of the API schema
}

export interface CloudProviderIntegrationCreate {
  providerId: string;     // Required: ID of the cloud provider
  status?: 'active' | 'expired' | 'revoked' | 'error'; // Default: 'active'
  scopesGranted?: string[]; // Optional: Granted OAuth scopes
  metadata?: Record<string, unknown>; // Optional: Integration-specific metadata
}