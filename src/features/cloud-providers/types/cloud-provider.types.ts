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

