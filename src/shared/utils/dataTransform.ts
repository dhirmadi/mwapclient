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
): { success: boolean; data: T | null; error?: string } => {
  if (!response?.data) {
    return { success: false, data: null, error: 'Invalid response format' };
  }
  const apiData = response.data;
  if (apiData.success === false) {
    return { success: false, data: null, error: apiData.message || 'API request failed' };
  }
  let rawData = apiData.success && apiData.data !== undefined ? apiData.data : apiData;
  // Only transform if it's an object or array with potential IDs
  if (rawData && (typeof rawData === 'object' || Array.isArray(rawData))) {
    if (Array.isArray(rawData)) {
      rawData = transformIdFields(rawData);
    } else if ('_id' in rawData || 'id' in rawData) {
      rawData = transformIdField(rawData);
    }
  }
  return { success: true, data: rawData as T };
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