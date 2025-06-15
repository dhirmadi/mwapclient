import { useState } from 'react';
import { ApiError, ApiResponse } from '../types/api';
import api from '../utils/api';

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
          response = await api.get<T>(url, params || defaultParams);
          break;
        case 'POST':
          response = await api.post<T>(url, params || defaultParams);
          break;
        case 'PUT':
          response = await api.put<T>(url, params || defaultParams);
          break;
        case 'PATCH':
          response = await api.patch<T>(url, params || defaultParams);
          break;
        case 'DELETE':
          response = await api.delete<T>(url);
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
          error: response.error || {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
          },
        });
      }

      return response;
    } catch (error) {
      const apiError: ApiError = {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      };

      setState({
        data: null,
        loading: false,
        error: apiError,
      });

      return {
        success: false,
        error: apiError,
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