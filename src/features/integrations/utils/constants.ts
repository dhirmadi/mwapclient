import { IntegrationStatus, TokenStatus } from '../types';

/**
 * Integration Status Constants
 */
export const INTEGRATION_STATUS = {
  PENDING: 'pending' as const,
  ACTIVE: 'active' as const,
  EXPIRED: 'expired' as const,
  ERROR: 'error' as const,
  REVOKED: 'revoked' as const,
} as const;

/**
 * Token Status Constants
 */
export const TOKEN_STATUS = {
  ACTIVE: 'active' as const,
  EXPIRED: 'expired' as const,
  REFRESHING: 'refreshing' as const,
  ERROR: 'error' as const,
  REVOKED: 'revoked' as const,
  UNKNOWN: 'unknown' as const,
} as const;

/**
 * Integration Status Display Configuration
 */
export const INTEGRATION_STATUS_CONFIG = {
  [INTEGRATION_STATUS.PENDING]: {
    label: 'Pending',
    color: 'yellow',
    description: 'Integration is being set up',
    icon: 'clock',
  },
  [INTEGRATION_STATUS.ACTIVE]: {
    label: 'Active',
    color: 'green',
    description: 'Integration is working properly',
    icon: 'check',
  },
  [INTEGRATION_STATUS.EXPIRED]: {
    label: 'Expired',
    color: 'orange',
    description: 'Token has expired and needs refresh',
    icon: 'alert-triangle',
  },
  [INTEGRATION_STATUS.ERROR]: {
    label: 'Error',
    color: 'red',
    description: 'Integration has encountered an error',
    icon: 'x-circle',
  },
  [INTEGRATION_STATUS.REVOKED]: {
    label: 'Revoked',
    color: 'gray',
    description: 'Integration has been revoked',
    icon: 'ban',
  },
} as const;

/**
 * Token Status Display Configuration
 */
export const TOKEN_STATUS_CONFIG = {
  [TOKEN_STATUS.ACTIVE]: {
    label: 'Active',
    color: 'green',
    description: 'Token is valid and active',
    icon: 'check-circle',
  },
  [TOKEN_STATUS.EXPIRED]: {
    label: 'Expired',
    color: 'red',
    description: 'Token has expired',
    icon: 'x-circle',
  },
  [TOKEN_STATUS.REFRESHING]: {
    label: 'Refreshing',
    color: 'blue',
    description: 'Token is being refreshed',
    icon: 'refresh-cw',
  },
  [TOKEN_STATUS.ERROR]: {
    label: 'Error',
    color: 'red',
    description: 'Token has an error',
    icon: 'alert-circle',
  },
  [TOKEN_STATUS.REVOKED]: {
    label: 'Revoked',
    color: 'gray',
    description: 'Token has been revoked',
    icon: 'ban',
  },
  [TOKEN_STATUS.UNKNOWN]: {
    label: 'Unknown',
    color: 'gray',
    description: 'Token status is unknown',
    icon: 'help-circle',
  },
} as const;

/**
 * OAuth Configuration Constants
 */
export const OAUTH_CONFIG = {
  // PKCE constants
  CODE_VERIFIER_LENGTH: 128,
  CODE_CHALLENGE_METHOD: 'S256' as const,
  
  // State expiration (10 minutes)
  STATE_EXPIRATION_MS: 10 * 60 * 1000,
  
  // Token expiration warning threshold (5 minutes)
  TOKEN_EXPIRATION_WARNING_MS: 5 * 60 * 1000,
  
  // Default redirect paths
  CALLBACK_PATH: '/oauth/callback',
  SUCCESS_PATH: '/integrations?oauth=success',
  ERROR_PATH: '/integrations?oauth=error',
} as const;

/**
 * Integration Health Check Constants
 */
export const HEALTH_CHECK_CONFIG = {
  // Health check interval (5 minutes)
  CHECK_INTERVAL_MS: 5 * 60 * 1000,
  
  // Health check timeout (30 seconds)
  TIMEOUT_MS: 30 * 1000,
  
  // Maximum retry attempts
  MAX_RETRIES: 3,
  
  // Retry delay (exponential backoff base)
  RETRY_DELAY_BASE_MS: 1000,
} as const;

/**
 * Integration Query Keys
 * Standardized query keys for React Query
 */
export const INTEGRATION_QUERY_KEYS = {
  all: ['integrations'] as const,
  lists: () => [...INTEGRATION_QUERY_KEYS.all, 'list'] as const,
  list: (tenantId: string, filters?: any) => 
    [...INTEGRATION_QUERY_KEYS.lists(), tenantId, filters] as const,
  details: () => [...INTEGRATION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...INTEGRATION_QUERY_KEYS.details(), id] as const,
  health: () => [...INTEGRATION_QUERY_KEYS.all, 'health'] as const,
  healthCheck: (id: string) => [...INTEGRATION_QUERY_KEYS.health(), id] as const,
  usage: () => [...INTEGRATION_QUERY_KEYS.all, 'usage'] as const,
  usageStats: (id: string) => [...INTEGRATION_QUERY_KEYS.usage(), id] as const,
} as const;

/**
 * Integration Validation Constants
 */
export const VALIDATION_CONFIG = {
  // Display name constraints
  DISPLAY_NAME_MIN_LENGTH: 1,
  DISPLAY_NAME_MAX_LENGTH: 100,
  
  // Description constraints
  DESCRIPTION_MAX_LENGTH: 500,
  
  // Search query constraints
  SEARCH_MIN_LENGTH: 2,
  SEARCH_MAX_LENGTH: 100,
  
  // Pagination constraints
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Integration Error Codes
 */
export const INTEGRATION_ERROR_CODES = {
  // Authentication errors
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  REFRESH_FAILED: 'REFRESH_FAILED',
  
  // Authorization errors
  INSUFFICIENT_SCOPES: 'INSUFFICIENT_SCOPES',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Provider errors
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Configuration errors
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
  MISSING_CREDENTIALS: 'MISSING_CREDENTIALS',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

/**
 * Integration Permissions
 */
export const INTEGRATION_PERMISSIONS = {
  CREATE: 'integration:create',
  READ: 'integration:read',
  UPDATE: 'integration:update',
  DELETE: 'integration:delete',
  REFRESH_TOKEN: 'integration:refresh_token',
  VIEW_HEALTH: 'integration:view_health',
  VIEW_USAGE: 'integration:view_usage',
} as const;

/**
 * Default Integration Metadata
 */
export const DEFAULT_INTEGRATION_METADATA = {
  displayName: '',
  description: '',
  tags: [] as string[],
  settings: {} as Record<string, unknown>,
} as const;