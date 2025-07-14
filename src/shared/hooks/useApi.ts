import { useState } from 'react';
// import { ApiError, ApiResponse } from '../types/api';

interface ApiError {
  message: string;
  status?: number;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiActions<T, P = any> {
  execute: (params?: P) => Promise<ApiResponse<T>>;
  reset: () => void;
}

type UseApiResult<T, P = any> = UseApiState<T> & UseApiActions<T, P>;

/**
 * Custom hook for making API calls with loading and error states
 */
export function useApi<T, P = any>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  defaultParams?: P
): UseApiResult<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async (params?: P): Promise<ApiResponse<T>> => {
    setState({ ...state, loading: true, error: null });

    try {
      let response: ApiResponse<T>;

      switch (method) {
        case 'GET':
          const getResponse = await apiClient.get<T>(url, { params: params || defaultParams });
          response = { data: getResponse.data, success: true };
          break;
        case 'POST':
          const postResponse = await apiClient.post<T>(url, params || defaultParams);
          response = { data: postResponse.data, success: true };
          break;
        case 'PUT':
          const putResponse = await apiClient.put<T>(url, params || defaultParams);
          response = { data: putResponse.data, success: true };
          break;
        case 'PATCH':
          const patchResponse = await apiClient.patch<T>(url, params || defaultParams);
          response = { data: patchResponse.data, success: true };
          break;
        case 'DELETE':
          const deleteResponse = await apiClient.delete<T>(url);
          response = { data: deleteResponse.data, success: true };
          break;
      }

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: {
            message: 'An unknown error occurred',
          },
        });
      }

      return response;
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      };

      setState({
        data: null,
        loading: false,
        error: apiError,
      });

      return {
        data: null as any,
        success: false,
        message: apiError.message,
      };
    }
  };

  const reset = () => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  };

  return {
    ...state,
    execute,
    reset,
  };
}

export default useApi;