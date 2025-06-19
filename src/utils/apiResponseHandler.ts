/**
 * Utility functions for handling API responses consistently
 */

// Generic type for API response formats
export type ApiResponse<T> = 
  | { success: true; data: T } // Format 1: { success: true, data: {...} }
  | T; // Format 2: Direct data object

/**
 * Extracts data from API response regardless of format
 * @param response The API response to extract data from
 * @returns The extracted data
 */
export function extractData<T>(response: any): T {
  // Handle format 1: { success: true, data: {...} }
  if (response && response.success === true && response.data !== undefined) {
    return response.data as T;
  }
  
  // Handle format 2: Direct data object
  return response as T;
}

/**
 * Extracts array data from API response regardless of format
 * @param response The API response to extract array data from
 * @returns The extracted array data or empty array if not found
 */
export function extractArrayData<T>(response: any): T[] {
  // Handle format 1: { success: true, data: [...] }
  if (response && response.success === true && Array.isArray(response.data)) {
    return response.data as T[];
  }
  
  // Handle format 2: Direct array
  if (Array.isArray(response)) {
    return response as T[];
  }
  
  // Return empty array if no valid data found
  console.warn('Unexpected API response format for array data:', response);
  return [] as T[];
}

/**
 * Validates that an object has required fields
 * @param obj The object to validate
 * @param requiredFields Array of field names that must exist
 * @returns True if all required fields exist, false otherwise
 */
export function validateRequiredFields<T>(obj: T, requiredFields: (keyof T)[]): boolean {
  if (!obj) return false;
  
  return requiredFields.every(field => {
    const value = obj[field];
    return value !== undefined && value !== null;
  });
}

/**
 * Ensures an object has an ID field (either id or _id)
 * @param obj The object to ensure has an ID
 * @param fallbackId Fallback ID to use if neither id nor _id exists
 * @returns The object with an ID field
 */
export function ensureId<T extends { id?: string; _id?: string }>(obj: T, fallbackId?: string): T {
  if (!obj.id && !obj._id && fallbackId) {
    return { ...obj, id: fallbackId };
  }
  return obj;
}

/**
 * Creates a standardized error object from API errors
 * @param error The error from the API
 * @param context Additional context about the operation
 * @returns A standardized error object
 */
export function createApiError(error: any, context: string): Error {
  // Extract error message from various formats
  let message = 'Unknown API error';
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && error.message) {
    message = error.message;
  } else if (error && error.error) {
    message = typeof error.error === 'string' ? error.error : 'API error';
  }
  
  // Create error with context
  const contextualizedMessage = `${context}: ${message}`;
  const apiError = new Error(contextualizedMessage);
  
  // Attach original error data for debugging
  (apiError as any).originalError = error;
  
  return apiError;
}