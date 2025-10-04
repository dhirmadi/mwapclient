// Shared utilities exports
export { default as api, testNetworkConnectivity } from './api';

// Unified API Response handling (consolidates apiResponseHandler and dataTransform)
export * from './apiResponse';

// Legacy exports for backwards compatibility (deprecated - use apiResponse instead)
export { 
  handleApiResponse as handleApiResponseWithTransform,
  handleDeleteResponse,
  transformIdField,
  transformIdFields
} from './dataTransform';

// Notification utilities
export * from './notificationUtils';

// OAuth utilities
export * from './oauth';

// Format utilities
export * from './format';

// Performance monitoring utilities
export * from './performance';