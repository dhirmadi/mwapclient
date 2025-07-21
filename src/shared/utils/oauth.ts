import { CloudProvider } from '../../features/cloud-providers/types';
import { Integration } from '../../features/integrations/types';

export interface OAuthState {
  integrationId: string;
  tenantId: string;
  userId?: string;
}

/**
 * Build OAuth authorization URL for cloud provider integration
 */
export function buildOAuthUrl(
  cloudProvider: CloudProvider,
  integration: Integration,
  redirectUri: string
): string {
  const url = new URL(cloudProvider.authUrl);
  
  // Add required OAuth parameters
  url.searchParams.append('client_id', cloudProvider.clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', cloudProvider.scopes.join(' '));
  
  // Add state parameter with integration info for security and callback handling
  const state: OAuthState = {
    integrationId: integration.id,
    tenantId: integration.tenantId
  };
  url.searchParams.append('state', btoa(JSON.stringify(state)));
  
  // Add any provider-specific parameters from metadata
  if (cloudProvider.metadata?.additionalParams) {
    const additionalParams = cloudProvider.metadata.additionalParams as Record<string, string>;
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
}

/**
 * Parse OAuth state parameter
 */
export function parseOAuthState(stateParam: string): OAuthState | null {
  try {
    const decoded = atob(stateParam);
    return JSON.parse(decoded) as OAuthState;
  } catch (error) {
    console.error('Failed to parse OAuth state:', error);
    return null;
  }
}

/**
 * Get OAuth callback redirect URI for the current environment
 */
export function getOAuthCallbackUri(): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/oauth/callback`;
}

/**
 * Get OAuth success redirect URI
 */
export function getOAuthSuccessUri(): string {
  return `${window.location.origin}/integrations?oauth=success`;
}

/**
 * Get OAuth error redirect URI
 */
export function getOAuthErrorUri(error?: string): string {
  const baseUri = `${window.location.origin}/integrations?oauth=error`;
  return error ? `${baseUri}&error=${encodeURIComponent(error)}` : baseUri;
}