import { 
  Integration, 
  IntegrationStatus, 
  TokenStatus, 
  TokenHealth,
  IntegrationHealth 
} from '../types';
import { 
  INTEGRATION_STATUS_CONFIG, 
  TOKEN_STATUS_CONFIG,
  OAUTH_CONFIG,
  INTEGRATION_ERROR_CODES 
} from './constants';

/**
 * Get integration status display configuration
 */
export const getIntegrationStatusConfig = (status: IntegrationStatus) => {
  return INTEGRATION_STATUS_CONFIG[status] || INTEGRATION_STATUS_CONFIG.error;
};

/**
 * Get token status display configuration
 */
export const getTokenStatusConfig = (status: TokenStatus) => {
  return TOKEN_STATUS_CONFIG[status] || TOKEN_STATUS_CONFIG.unknown;
};

/**
 * Check if integration is active and healthy
 */
export const isIntegrationHealthy = (integration: Integration): boolean => {
  return integration.status === 'active' && 
         !!integration.accessToken && 
         !isTokenExpired(integration);
};

/**
 * Check if integration token is expired
 */
export const isTokenExpired = (integration: Integration): boolean => {
  if (!integration.tokenExpiresAt) return false;
  
  const expirationTime = new Date(integration.tokenExpiresAt).getTime();
  const currentTime = Date.now();
  
  return currentTime >= expirationTime;
};

/**
 * Check if integration token is expiring soon
 */
export const isTokenExpiringSoon = (integration: Integration): boolean => {
  if (!integration.tokenExpiresAt) return false;
  
  const expirationTime = new Date(integration.tokenExpiresAt).getTime();
  const currentTime = Date.now();
  const warningThreshold = OAUTH_CONFIG.TOKEN_EXPIRATION_WARNING_MS;
  
  return (expirationTime - currentTime) <= warningThreshold && 
         (expirationTime - currentTime) > 0;
};

/**
 * Get time until token expiration in milliseconds
 */
export const getTimeUntilExpiration = (integration: Integration): number | null => {
  if (!integration.tokenExpiresAt) return null;
  
  const expirationTime = new Date(integration.tokenExpiresAt).getTime();
  const currentTime = Date.now();
  
  return Math.max(0, expirationTime - currentTime);
};

/**
 * Format time until expiration as human-readable string
 */
export const formatTimeUntilExpiration = (integration: Integration): string | null => {
  const timeUntilExpiration = getTimeUntilExpiration(integration);
  
  if (timeUntilExpiration === null) return null;
  if (timeUntilExpiration <= 0) return 'Expired';
  
  const minutes = Math.floor(timeUntilExpiration / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return 'Less than 1 minute';
  }
};

/**
 * Get token health information
 */
export const getTokenHealth = (integration: Integration): TokenHealth => {
  const isExpired = isTokenExpired(integration);
  const isExpiringSoon = isTokenExpiringSoon(integration);
  const timeUntilExpiration = getTimeUntilExpiration(integration);
  
  let status: TokenStatus;
  
  if (integration.status === 'revoked') {
    status = 'revoked';
  } else if (integration.status === 'error') {
    status = 'error';
  } else if (isExpired) {
    status = 'expired';
  } else if (integration.accessToken) {
    status = 'active';
  } else {
    status = 'unknown';
  }
  
  return {
    status,
    expiresAt: integration.tokenExpiresAt,
    expiresIn: timeUntilExpiration ? Math.floor(timeUntilExpiration / 1000) : undefined,
    isExpiringSoon,
    lastRefreshed: integration.updatedAt,
    refreshAttempts: 0, // This would come from backend if tracked
  };
};

/**
 * Determine integration status from various factors
 */
export const determineIntegrationStatus = (
  hasToken: boolean,
  tokenExpired: boolean,
  lastError?: string
): IntegrationStatus => {
  if (lastError) return 'error';
  if (!hasToken) return 'pending';
  if (tokenExpired) return 'expired';
  return 'active';
};

/**
 * Format integration display name
 */
export const formatIntegrationDisplayName = (integration: Integration): string => {
  const customName = integration.metadata?.displayName as string;
  const providerName = integration.provider?.name;
  
  if (customName) return customName;
  if (providerName) return `${providerName} Integration`;
  return 'Cloud Integration';
};

/**
 * Get integration description
 */
export const getIntegrationDescription = (integration: Integration): string => {
  const customDescription = integration.metadata?.description as string;
  const providerName = integration.provider?.name;
  
  if (customDescription) return customDescription;
  if (providerName) return `Integration with ${providerName} cloud storage`;
  return 'Cloud storage integration';
};

/**
 * Format date for integration display
 */
export const formatIntegrationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Get integration health status
 */
export const getIntegrationHealthStatus = (integration: Integration): IntegrationHealth => {
  const tokenHealth = getTokenHealth(integration);
  const isHealthy = isIntegrationHealthy(integration);
  
  return {
    integrationId: integration.id,
    status: isHealthy ? 'healthy' : 'unhealthy',
    lastChecked: new Date().toISOString(),
    details: {
      tokenValid: tokenHealth.status === 'active',
      apiReachable: integration.status !== 'error',
      scopesValid: !!integration.scopesGranted?.length,
      errorMessage: integration.status === 'error' ? 'Integration has errors' : undefined,
    },
  };
};

/**
 * Filter integrations by status
 */
export const filterIntegrationsByStatus = (
  integrations: Integration[],
  status: IntegrationStatus | IntegrationStatus[]
): Integration[] => {
  const statusArray = Array.isArray(status) ? status : [status];
  return integrations.filter(integration => 
    statusArray.includes(integration.status)
  );
};

/**
 * Sort integrations by specified field
 */
export const sortIntegrations = (
  integrations: Integration[],
  sortBy: 'createdAt' | 'updatedAt' | 'connectedAt' | 'lastUsedAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Integration[] => {
  return [...integrations].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (!aValue && !bValue) return 0;
    if (!aValue) return sortOrder === 'asc' ? -1 : 1;
    if (!bValue) return sortOrder === 'asc' ? 1 : -1;
    
    const aTime = new Date(aValue).getTime();
    const bTime = new Date(bValue).getTime();
    
    return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
  });
};

/**
 * Search integrations by display name or description
 */
export const searchIntegrations = (
  integrations: Integration[],
  searchQuery: string
): Integration[] => {
  if (!searchQuery.trim()) return integrations;
  
  const query = searchQuery.toLowerCase().trim();
  
  return integrations.filter(integration => {
    const displayName = formatIntegrationDisplayName(integration).toLowerCase();
    const description = getIntegrationDescription(integration).toLowerCase();
    const providerName = integration.provider?.name?.toLowerCase() || '';
    
    return displayName.includes(query) || 
           description.includes(query) || 
           providerName.includes(query);
  });
};

/**
 * Get error message for integration error code
 */
export const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    [INTEGRATION_ERROR_CODES.INVALID_TOKEN]: 'The access token is invalid',
    [INTEGRATION_ERROR_CODES.TOKEN_EXPIRED]: 'The access token has expired',
    [INTEGRATION_ERROR_CODES.TOKEN_REVOKED]: 'The access token has been revoked',
    [INTEGRATION_ERROR_CODES.REFRESH_FAILED]: 'Failed to refresh the access token',
    [INTEGRATION_ERROR_CODES.INSUFFICIENT_SCOPES]: 'Insufficient permissions granted',
    [INTEGRATION_ERROR_CODES.ACCESS_DENIED]: 'Access denied by the provider',
    [INTEGRATION_ERROR_CODES.PROVIDER_UNAVAILABLE]: 'The cloud provider is currently unavailable',
    [INTEGRATION_ERROR_CODES.PROVIDER_ERROR]: 'The cloud provider returned an error',
    [INTEGRATION_ERROR_CODES.RATE_LIMITED]: 'Rate limit exceeded',
    [INTEGRATION_ERROR_CODES.INVALID_CONFIGURATION]: 'Invalid integration configuration',
    [INTEGRATION_ERROR_CODES.MISSING_CREDENTIALS]: 'Missing required credentials',
    [INTEGRATION_ERROR_CODES.NETWORK_ERROR]: 'Network connection error',
    [INTEGRATION_ERROR_CODES.TIMEOUT]: 'Request timed out',
    [INTEGRATION_ERROR_CODES.VALIDATION_ERROR]: 'Validation error',
    [INTEGRATION_ERROR_CODES.UNKNOWN_ERROR]: 'An unknown error occurred',
  };
  
  return errorMessages[errorCode] || 'An unexpected error occurred';
};

/**
 * Validate integration metadata
 */
export const validateIntegrationMetadata = (metadata: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (metadata.displayName && typeof metadata.displayName !== 'string') {
    errors.push('Display name must be a string');
  }
  
  if (metadata.description && typeof metadata.description !== 'string') {
    errors.push('Description must be a string');
  }
  
  if (metadata.displayName && (metadata.displayName as string).length > 100) {
    errors.push('Display name must be 100 characters or less');
  }
  
  if (metadata.description && (metadata.description as string).length > 500) {
    errors.push('Description must be 500 characters or less');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format distance to now (simple implementation)
 */
export const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''}`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
  } else {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
  }
};

