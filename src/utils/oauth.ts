/**
 * OAuth utility functions
 */

/**
 * Get the OAuth redirect URI from environment variables or use a default
 * This URI must match exactly what is configured in the OAuth provider's app settings
 */
export const getOAuthRedirectUri = (): string => {
  return import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:5173/oauth/callback';
};

/**
 * Create a state parameter for OAuth flow
 * @param tenantId The tenant ID
 * @param integrationId The integration ID
 * @returns Base64 encoded state parameter
 */
export const createOAuthState = (tenantId: string, integrationId: string): string => {
  const stateObj = { 
    tenantId, 
    integrationId,
    timestamp: Date.now() // Add timestamp for security
  };
  console.log('Creating OAuth state with:', stateObj);
  const jsonState = JSON.stringify(stateObj);
  console.log('JSON state:', jsonState);
  const encodedState = btoa(jsonState);
  console.log('Encoded state:', encodedState);
  return encodedState;
};

/**
 * Parse the state parameter from OAuth callback
 * @param state Base64 encoded state parameter
 * @returns Parsed state object or null if invalid
 */
export const parseOAuthState = (state: string): { 
  tenantId: string; 
  integrationId: string;
  timestamp?: number;
} | null => {
  try {
    console.log('Attempting to parse state:', state);
    const decodedState = atob(state);
    console.log('Decoded state:', decodedState);
    const parsedState = JSON.parse(decodedState);
    console.log('Parsed state object:', parsedState);
    return parsedState;
  } catch (e) {
    console.error('Failed to parse OAuth state:', e);
    return null;
  }
};