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
 * @param providerId The provider ID
 * @returns Base64 encoded state parameter
 */
export const createOAuthState = (tenantId: string, providerId: string): string => {
  return btoa(JSON.stringify({ tenantId, providerId }));
};

/**
 * Parse the state parameter from OAuth callback
 * @param state Base64 encoded state parameter
 * @returns Parsed state object or null if invalid
 */
export const parseOAuthState = (state: string): { tenantId: string; providerId: string } | null => {
  try {
    return JSON.parse(atob(state));
  } catch (e) {
    console.error('Failed to parse OAuth state:', e);
    return null;
  }
};