import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError, ApiResponse } from '@/types';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from Auth0
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const data = error.response.data as any;
      
      if (data.error) {
        apiError.code = data.error.code || 'API_ERROR';
        apiError.message = data.error.message || 'An error occurred';
        apiError.details = data.error.details;
      }
    } else if (error.request) {
      // The request was made but no response was received
      apiError.code = 'NETWORK_ERROR';
      apiError.message = 'Network error, please check your connection';
    }

    return Promise.reject(apiError);
  }
);

// Generic API request function
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient(config);
    return response.data as ApiResponse<T>;
  } catch (error) {
    if (error instanceof Error) {
      const apiError = error as unknown as ApiError;
      return {
        success: false,
        error: apiError,
      };
    }
    
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      },
    };
  }
}

// Helper functions for common HTTP methods
export const api = {
  get: <T>(url: string, params?: any) => 
    apiRequest<T>({ method: 'GET', url, params }),
  
  post: <T>(url: string, data?: any) => 
    apiRequest<T>({ method: 'POST', url, data }),
  
  put: <T>(url: string, data?: any) => 
    apiRequest<T>({ method: 'PUT', url, data }),
  
  patch: <T>(url: string, data?: any) => 
    apiRequest<T>({ method: 'PATCH', url, data }),
  
  delete: <T>(url: string) => 
    apiRequest<T>({ method: 'DELETE', url }),
};

export default api;