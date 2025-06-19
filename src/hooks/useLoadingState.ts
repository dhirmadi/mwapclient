import { useState, useCallback } from 'react';

/**
 * Interface for the loading state
 */
export interface LoadingState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Interface for the loading state hook return value
 */
export interface UseLoadingStateReturn extends LoadingState {
  startLoading: () => void;
  setSuccess: () => void;
  setError: (error: Error) => void;
  reset: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

/**
 * Custom hook for managing loading states
 * @returns Object with loading state and functions to update it
 */
export function useLoadingState(): UseLoadingStateReturn {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });
  
  // Start loading
  const startLoading = useCallback(() => {
    setState({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
    });
  }, []);
  
  // Set success
  const setSuccess = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
    });
  }, []);
  
  // Set error
  const setError = useCallback((error: Error) => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: true,
      error,
    });
  }, []);
  
  // Reset state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
    });
  }, []);
  
  // Utility function to wrap a promise with loading state
  const withLoading = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    try {
      startLoading();
      const result = await promise;
      setSuccess();
      return result;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }, [startLoading, setSuccess, setError]);
  
  return {
    ...state,
    startLoading,
    setSuccess,
    setError,
    reset,
    withLoading,
  };
}