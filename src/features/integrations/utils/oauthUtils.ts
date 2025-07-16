import { CloudProvider } from '../../cloud-providers/types';
import { 
  OAuthState, 
  OAuthConfig, 
  PKCEChallenge, 
  OAuthError, 
  OAuthErrorType 
} from '../types';
import { OAUTH_CONFIG } from './constants';

/**
 * Generate cryptographically secure random string
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => charset[byte % charset.length]).join('');
}

/**
 * Generate SHA256 hash and encode as base64url
 */
async function sha256(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64url
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE code verifier and challenge
 */
export async function generatePKCEChallenge(): Promise<PKCEChallenge> {
  const codeVerifier = generateRandomString(OAUTH_CONFIG.CODE_VERIFIER_LENGTH);
  const codeChallenge = await sha256(codeVerifier);
  
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: OAUTH_CONFIG.CODE_CHALLENGE_METHOD,
  };
}

/**
 * Create secure OAuth state with CSRF protection and timestamp validation
 */
export function createOAuthState(
  integrationId: string,
  tenantId: string,
  codeVerifier: string,
  userId?: string
): OAuthState {
  const nonce = generateRandomString(32);
  const timestamp = Date.now();
  
  return {
    integrationId,
    tenantId,
    nonce,
    codeVerifier,
    timestamp,
    userId,
  };
}

/**
 * Encode OAuth state as base64url
 */
export function encodeOAuthState(state: OAuthState): string {
  try {
    const stateString = JSON.stringify(state);
    return btoa(stateString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } catch (error) {
    throw new Error('Failed to encode OAuth state');
  }
}

/**
 * Parse and validate OAuth state parameter
 */
export function parseOAuthState(stateParam: string): OAuthState | null {
  try {
    // Convert from base64url to base64
    const base64 = stateParam
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    const decoded = atob(padded);
    const state = JSON.parse(decoded) as OAuthState;
    
    // Validate required fields
    if (!state.integrationId || !state.tenantId || !state.nonce || 
        !state.codeVerifier || !state.timestamp) {
      console.error('OAuth state missing required fields:', state);
      return null;
    }
    
    // Check if state has expired
    const now = Date.now();
    const age = now - state.timestamp;
    if (age > OAUTH_CONFIG.STATE_EXPIRATION_MS) {
      console.error('OAuth state has expired:', { age, maxAge: OAUTH_CONFIG.STATE_EXPIRATION_MS });
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('Failed to parse OAuth state:', error);
    return null;
  }
}

/**
 * Build OAuth authorization URL with PKCE support
 */
export async function buildOAuthUrl(
  cloudProvider: CloudProvider,
  integrationId: string,
  tenantId: string,
  redirectUri: string,
  userId?: string
): Promise<OAuthConfig> {
  // Generate PKCE challenge
  const pkce = await generatePKCEChallenge();
  
  // Create secure state
  const oauthState = createOAuthState(integrationId, tenantId, pkce.codeVerifier, userId);
  const encodedState = encodeOAuthState(oauthState);
  
  // Build OAuth configuration
  const config: OAuthConfig = {
    clientId: cloudProvider.clientId,
    authUrl: cloudProvider.authUrl,
    tokenUrl: cloudProvider.tokenUrl,
    redirectUri,
    scopes: cloudProvider.scopes,
    codeChallenge: pkce.codeChallenge,
    codeChallengeMethod: pkce.codeChallengeMethod,
    state: encodedState,
  };
  
  // Add provider-specific parameters
  if (cloudProvider.metadata?.additionalParams) {
    config.additionalParams = cloudProvider.metadata.additionalParams as Record<string, string>;
  }
  
  return config;
}

/**
 * Build complete OAuth authorization URL from configuration
 */
export function buildAuthorizationUrl(config: OAuthConfig): string {
  const url = new URL(config.authUrl);
  
  // Add required OAuth parameters
  url.searchParams.append('client_id', config.clientId);
  url.searchParams.append('redirect_uri', config.redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', config.scopes.join(' '));
  url.searchParams.append('state', config.state);
  
  // Add PKCE parameters
  url.searchParams.append('code_challenge', config.codeChallenge);
  url.searchParams.append('code_challenge_method', config.codeChallengeMethod);
  
  // Add provider-specific parameters
  if (config.additionalParams) {
    Object.entries(config.additionalParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
}

/**
 * Parse OAuth error from URL parameters
 */
export function parseOAuthError(searchParams: URLSearchParams): OAuthError | null {
  const error = searchParams.get('error') as OAuthErrorType;
  if (!error) return null;
  
  return {
    error,
    error_description: searchParams.get('error_description') || undefined,
    error_uri: searchParams.get('error_uri') || undefined,
    state: searchParams.get('state') || undefined,
  };
}

/**
 * Validate OAuth callback parameters
 */
export function validateOAuthCallback(searchParams: URLSearchParams): {
  isValid: boolean;
  code?: string;
  state?: OAuthState;
  error?: OAuthError;
  errorMessage?: string;
} {
  // Check for OAuth errors first
  const oauthError = parseOAuthError(searchParams);
  if (oauthError) {
    return {
      isValid: false,
      error: oauthError,
      errorMessage: oauthError.error_description || `OAuth error: ${oauthError.error}`,
    };
  }
  
  // Get required parameters
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  
  // Validate required parameters
  if (!code) {
    return {
      isValid: false,
      errorMessage: 'Missing authorization code',
    };
  }
  
  if (!stateParam) {
    return {
      isValid: false,
      errorMessage: 'Missing state parameter',
    };
  }
  
  // Parse and validate state
  const state = parseOAuthState(stateParam);
  if (!state) {
    return {
      isValid: false,
      errorMessage: 'Invalid or expired state parameter',
    };
  }
  
  return {
    isValid: true,
    code,
    state,
  };
}

/**
 * Get OAuth callback redirect URI for the current environment
 */
export function getOAuthCallbackUri(): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}${OAUTH_CONFIG.CALLBACK_PATH}`;
}

/**
 * Get OAuth success redirect URI
 */
export function getOAuthSuccessUri(): string {
  return `${window.location.origin}${OAUTH_CONFIG.SUCCESS_PATH}`;
}

/**
 * Get OAuth error redirect URI
 */
export function getOAuthErrorUri(error?: string): string {
  const baseUri = `${window.location.origin}${OAUTH_CONFIG.ERROR_PATH}`;
  return error ? `${baseUri}&error=${encodeURIComponent(error)}` : baseUri;
}

/**
 * Validate PKCE code verifier format
 */
export function validateCodeVerifier(codeVerifier: string): boolean {
  // PKCE code verifier must be 43-128 characters long
  // and contain only [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
  const regex = /^[A-Za-z0-9\-._~]{43,128}$/;
  return regex.test(codeVerifier);
}

/**
 * Create token exchange request payload
 */
export function createTokenExchangePayload(
  code: string,
  codeVerifier: string,
  redirectUri: string,
  clientId: string
): Record<string, string> {
  return {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  };
}

/**
 * Validate OAuth scopes
 */
export function validateScopes(
  requestedScopes: string[],
  grantedScopes?: string[]
): {
  isValid: boolean;
  missingScopes: string[];
} {
  if (!grantedScopes || grantedScopes.length === 0) {
    return {
      isValid: false,
      missingScopes: requestedScopes,
    };
  }
  
  const missingScopes = requestedScopes.filter(
    scope => !grantedScopes.includes(scope)
  );
  
  return {
    isValid: missingScopes.length === 0,
    missingScopes,
  };
}