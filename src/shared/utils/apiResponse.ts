/**
 * Unified API Response Handler
 * 
 * Consolidates all API response handling logic into a single, consistent utility.
 * Handles:
 * - Response format variations (wrapped vs direct)
 * - ID field transformations (_id -> id)
 * - Error handling and standardization
 * - Type safety
 * 
 * @module apiResponse
 */

// ============================================================================
// Types
// ============================================================================

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

export interface ApiResponseResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

// ============================================================================
// ID Transformation Utilities
// ============================================================================

/**
 * Transform a single object by mapping _id to id
 * Handles MongoDB ObjectId objects
 */
export const transformIdField = <T extends Record<string, any>>(
  data: T | null | undefined
): T => {
  if (!data || typeof data !== 'object') {
    return data as unknown as T;
  }

  // Extract ID from _id or id field
  let id = (data as any)._id || (data as any).id;

  // Handle ObjectId objects (if they come from MongoDB)
  if (id && typeof id === 'object' && id.toString) {
    id = id.toString();
  }

  const transformed = {
    ...data,
    id: id, // Use extracted and normalized ID
  } as T;

  // Only log if there's an issue with ID transformation
  if (!transformed.id) {
    console.warn('transformIdField - No valid ID found:', {
      original: data,
      originalId: (data as any).id,
      originalMongoId: (data as any)._id,
      transformed,
    });
  }

  return transformed;
};

/**
 * Transform an array of objects by mapping _id to id for each item
 */
export const transformIdFields = <T extends Record<string, any>>(
  data: T[] | null | undefined
): T[] => {
  if (!Array.isArray(data)) {
    return data as unknown as T[];
  }

  return data.map(transformIdField);
};

// ============================================================================
// Response Handlers
// ============================================================================

/**
 * Handle API response format variations and transform IDs
 * Supports both wrapped ({ success: true, data: ... }) and direct response formats
 * 
 * @param response - The axios response object
 * @param isArray - Whether the expected data is an array
 * @returns Transformed data with proper ID fields
 */
export const handleApiResponse = <T = any>(
  response: any,
  isArray: boolean = false
): T => {
  if (!response?.data) {
    throw new Error('Invalid response format: No data property');
  }

  const apiData = response.data;

  // Handle wrapped error response
  if (apiData.success === false) {
    const errorMessage = apiData.error || apiData.message || 'API request failed';
    throw new Error(errorMessage);
  }

  // Extract raw data from wrapped or direct format
  let rawData = apiData.success && apiData.data !== undefined ? apiData.data : apiData;

  // Transform IDs if applicable
  if (rawData && (typeof rawData === 'object' || Array.isArray(rawData))) {
    if (Array.isArray(rawData)) {
      rawData = transformIdFields(rawData);
    } else if ('_id' in rawData || 'id' in rawData) {
      rawData = transformIdField(rawData);
    }
  }

  // If array was expected but backend returned null, normalize to []
  if (isArray && (rawData === null || rawData === undefined)) {
    return [] as unknown as T;
  }

  return rawData as T;
};

/**
 * Handle API response with explicit success/error result
 * Useful when you want to handle errors without throwing
 * 
 * @param response - The axios response object
 * @param isArray - Whether the expected data is an array
 * @returns Result object with success flag and data or error
 */
export const handleApiResponseSafe = <T = any>(
  response: any,
  isArray: boolean = false
): ApiResponseResult<T> => {
  try {
    const data = handleApiResponse<T>(response, isArray);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Handle delete response which may be empty or contain success status
 * 
 * @param response - The API response from delete operation
 * @returns Success indicator
 */
export const handleDeleteResponse = (response: any): { success: boolean } => {
  // Handle wrapped response format
  if (response.data && response.data.success !== undefined) {
    if (response.data.success === false) {
      const errorMessage = response.data.error || response.data.message || 'Delete operation failed';
      throw new Error(errorMessage);
    }
    return { success: true };
  }

  // Handle empty response (common for DELETE operations)
  if (response.data === null || response.data === undefined || response.data === '') {
    return { success: true };
  }

  // Handle any other response format
  return response.data || { success: true };
};

// ============================================================================
// Error Handlers
// ============================================================================

/**
 * Handles API errors consistently
 * 
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
      code: data?.code || `HTTP_${status}`,
    };
  }

  // Handle network errors
  if (error.request) {
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
    };
  }

  // Handle other errors
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
};

// ============================================================================
// Standard Error Creators
// ============================================================================

/**
 * Creates a standardized error for unauthorized access
 */
export const createUnauthorizedError = (): ApiError => ({
  message: 'You do not have permission to access this resource',
  status: 403,
  code: 'UNAUTHORIZED',
});

/**
 * Creates a standardized error for not found resources
 */
export const createNotFoundError = (resource: string = 'Resource'): ApiError => ({
  message: `${resource} not found`,
  status: 404,
  code: 'NOT_FOUND',
});

/**
 * Creates a standardized error for validation failures
 */
export const createValidationError = (message: string): ApiError => ({
  message,
  status: 400,
  code: 'VALIDATION_ERROR',
});

/**
 * Creates a standardized error for server errors
 */
export const createServerError = (message: string = 'Internal server error'): ApiError => ({
  message,
  status: 500,
  code: 'SERVER_ERROR',
});

