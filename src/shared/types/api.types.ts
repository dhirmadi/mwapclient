/**
 * API Response Types
 * These types define the structure of API responses from the MWAP backend
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiListResponse<T> extends ApiResponse<PaginatedResponse<T>> {}

export type ApiSuccessResponse<T> = ApiResponse<T> & { success: true; data: T };
export type ApiErrorResponse = ApiResponse<never> & { success: false; error: ApiError };