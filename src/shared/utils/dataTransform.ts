/**
 * Data transformation utilities for API responses
 * Handles common transformations like _id to id mapping
 */

/**
 * Transform a single object by mapping _id to id
 * @param data - The object to transform
 * @returns Transformed object with id field
 */
export const transformIdField = <T extends Record<string, any>>(data: T | null | undefined): T => {
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
      transformed 
    });
  }
  
  return transformed;
};

/**
 * Transform an array of objects by mapping _id to id for each item
 * @param data - The array to transform
 * @returns Transformed array with id fields
 */
export const transformIdFields = <T extends Record<string, any>>(data: T[] | null | undefined): T[] => {
  if (!Array.isArray(data)) {
    return data as unknown as T[];
  }

  return data.map(transformIdField);
};

/**
 * Handle API response format variations and transform IDs
 * Supports both wrapped ({ success: true, data: ... }) and direct response formats
 * @param response - The API response
 * @param isArray - Whether the expected data is an array
 * @returns Transformed data with proper ID fields
 */
export const handleApiResponse = <T = any>(
  response: any,
  isArray: boolean = false
): T => {
  let rawData: any = null;

  // Handle wrapped response format: { success: true, data: ... }
  if (response.data && response.data.success && response.data.data !== undefined) {
    rawData = response.data.data;
  }
  // Handle error response format: { success: false, message: ... }
  else if (response.data && response.data.success === false) {
    throw new Error(response.data.message || 'API request failed');
  }
  // Handle direct response format
  else if (response.data !== undefined) {
    rawData = response.data;
  }
  else {
    throw new Error('Invalid API response format');
  }

  // Transform IDs based on expected data type
  if (isArray && Array.isArray(rawData)) {
    return transformIdFields(rawData) as T;
  } else if (!isArray && rawData && typeof rawData === 'object') {
    return transformIdField(rawData) as T;
  } else if (isArray && !Array.isArray(rawData)) {
    // Expected array but got single object or null
    return (rawData === null ? [] : [transformIdField(rawData)]) as T;
  }

  return rawData as T;
};

/**
 * Handle delete response which may be empty or contain success status
 * @param response - The API response from delete operation
 * @returns Success indicator
 */
export const handleDeleteResponse = (response: any): { success: boolean } => {
  // Handle wrapped response format
  if (response.data && response.data.success !== undefined) {
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Delete operation failed');
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