/**
 * OAuth State for PKCE Flow
 * Enhanced OAuth state with PKCE support and security measures
 */
export interface OAuthState {
  integrationId: string;        // Integration ID for callback handling
  tenantId: string;             // Tenant ID for security validation
  nonce: string;                // CSRF protection nonce
  codeVerifier: string;         // PKCE code verifier
  timestamp: number;            // State creation timestamp for expiration
  userId?: string;              // Optional user ID for additional validation
}

/**
 * OAuth Configuration
 * Configuration for OAuth flow with PKCE support
 */
export interface OAuthConfig {
  clientId: string;             // OAuth client ID
  authUrl: string;              // Authorization URL
  tokenUrl: string;             // Token exchange URL
  redirectUri: string;          // Callback redirect URI
  scopes: string[];             // Requested OAuth scopes
  codeChallenge: string;        // PKCE code challenge
  codeChallengeMethod: 'S256';  // PKCE code challenge method (always S256)
  state: string;                // Base64 encoded OAuth state
  additionalParams?: Record<string, string>; // Provider-specific parameters
}

/**
 * OAuth Token Response
 * Response from OAuth token exchange
 */
export interface OAuthTokenResponse {
  access_token: string;         // Access token
  refresh_token?: string;       // Refresh token (optional)
  token_type: string;           // Token type (usually "Bearer")
  expires_in?: number;          // Token expiration in seconds
  scope?: string;               // Granted scopes (space-separated)
  [key: string]: unknown;       // Additional provider-specific fields
}

/**
 * Token Status
 * Represents the current status of OAuth tokens
 */
export type TokenStatus = 
  | 'active'                    // Token is valid and active
  | 'expired'                   // Token has expired
  | 'expiring_soon'             // Token is expiring soon
  | 'refreshing'                // Token is being refreshed
  | 'error'                     // Token has an error
  | 'revoked'                   // Token has been revoked
  | 'unknown';                  // Token status is unknown

/**
 * Token Health Information
 * Detailed information about token health
 */
export interface TokenHealth {
  status: TokenStatus;          // Current token status
  expiresAt?: string;           // Token expiration timestamp (ISO string)
  expiresIn?: number;           // Seconds until expiration
  isExpired?: boolean;          // Whether token is expired
  isExpiringSoon: boolean;      // Whether token expires within warning threshold
  scopes?: string[];            // Token scopes
  lastRefreshed?: string;       // Last refresh timestamp (ISO string)
  refreshAttempts: number;      // Number of refresh attempts
  lastError?: string;           // Last error message
}

/**
 * OAuth Error Types
 * Standard OAuth error types
 */
export type OAuthErrorType =
  | 'invalid_request'           // Invalid request parameters
  | 'invalid_client'            // Invalid client credentials
  | 'invalid_grant'             // Invalid authorization grant
  | 'unauthorized_client'       // Client not authorized for this grant type
  | 'unsupported_grant_type'    // Grant type not supported
  | 'invalid_scope'             // Invalid or unknown scope
  | 'access_denied'             // User denied authorization
  | 'server_error'              // Authorization server error
  | 'temporarily_unavailable'   // Service temporarily unavailable
  | 'state_mismatch'            // OAuth state parameter mismatch
  | 'code_expired'              // Authorization code expired
  | 'pkce_verification_failed'; // PKCE verification failed

/**
 * OAuth Error
 * Structured OAuth error information
 */
export interface OAuthError {
  error: OAuthErrorType;        // Error type
  error_description?: string;   // Human-readable error description
  error_uri?: string;           // URI with error information
  state?: string;               // State parameter from request
}

/**
 * OAuth Flow Step
 * Represents different steps in the OAuth flow
 */
export type OAuthFlowStep =
  | 'initialization'            // Preparing OAuth flow
  | 'authorization'             // User authorization in progress
  | 'callback'                  // Processing OAuth callback
  | 'token_exchange'            // Exchanging code for tokens
  | 'completion'                // OAuth flow completed
  | 'error';                    // OAuth flow failed

/**
 * OAuth Flow State
 * Tracks the current state of an OAuth flow
 */
export interface OAuthFlowState {
  step: OAuthFlowStep;          // Current flow step
  integrationId?: string;       // Integration ID being processed
  error?: OAuthError;           // Error information if failed
  isLoading: boolean;           // Whether flow is in progress
  progress: number;             // Progress percentage (0-100)
}

/**
 * PKCE Code Verifier and Challenge
 * PKCE implementation details
 */
export interface PKCEChallenge {
  codeVerifier: string;         // Random code verifier (43-128 chars)
  codeChallenge: string;        // SHA256 hash of code verifier (base64url)
  codeChallengeMethod: 'S256';  // Challenge method (always S256)
}