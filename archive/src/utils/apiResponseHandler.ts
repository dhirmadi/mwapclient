/**
 * Unified API Response Handler
 * 
 * This utility standardizes the handling of API responses across the application,
 * eliminating the need for complex fallback mechanisms in individual API methods.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Handles API responses consistently across all endpoints
 * @param response - The axios response object
 * @returns The extracted data from the response
 * @throws ApiError for error responses or unexpected formats
 */
export const handleApiResponse = <T>(response: any): T => {
  // Handle wrapped response format: { success: true, data: {...} }
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    
    // Handle error in wrapped format
    if (!response.data.success) {
      const errorMessage = response.data.error || response.data.message || 'API request failed';
      throw new Error(errorMessage);
    }
  }
  
  // Handle direct data format (fallback for legacy endpoints)
  if (response.data !== undefined) {
    return response.data;
  }
  
  // If we reach here, the response format is unexpected
  console.error('Unexpected API response format:', response);
  throw new Error('Unexpected API response format');
};

/**
 * Handles API errors consistently
 * @param error - The error object from axios or other sources
 * @returns A standardized ApiError object
 */
export const handleApiError = (error: any): ApiError => {
  // Handle axios errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    // Extract error message from various response formats
    let message = 'An error occurred';
    if (data) {
      if (typeof data === 'string') {
        message = data;
      } else if (data.error) {
        message = data.error;
      } else if (data.message) {
        message = data.message;
      } else if (data.details) {
        message = data.details;
      }
    }
    
    return {
      message,
      status,
      code: data?.code || `HTTP_${status}`
    };
  }
  
  // Handle network errors
  if (error.request) {
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR'
    };
  }
  
  // Handle other errors
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
};

/**
 * Creates a standardized error for unauthorized access
 */
export const createUnauthorizedError = (): ApiError => ({
  message: 'You do not have permission to access this resource',
  status: 403,
  code: 'UNAUTHORIZED'
});

/**
 * Creates a standardized error for not found resources
 */
export const createNotFoundError = (resource: string = 'Resource'): ApiError => ({
  message: `${resource} not found`,
  status: 404,
  code: 'NOT_FOUND'
});