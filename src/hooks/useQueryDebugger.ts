import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * A custom hook to help debug React Query issues
 * @param queryKey The query key to debug
 * @param options Additional options
 */
export const useQueryDebugger = (
  queryKey: unknown[],
  options: {
    logOnMount?: boolean;
    logOnUnmount?: boolean;
    logOnChange?: boolean;
  } = {}
) => {
  const {
    logOnMount = true,
    logOnUnmount = true,
    logOnChange = true,
  } = options;
  
  const queryClient = useQueryClient();
  
  // Get the query data
  const queryData = queryClient.getQueryData(queryKey);
  
  // Log on mount
  useEffect(() => {
    if (logOnMount) {
      console.group(`Query Debugger - Mount: ${JSON.stringify(queryKey)}`);
      console.log('Query Key:', queryKey);
      console.log('Initial Data:', queryData);
      console.log('Query Cache:', queryClient.getQueryCache().getAll());
      console.groupEnd();
    }
    
    return () => {
      if (logOnUnmount) {
        console.group(`Query Debugger - Unmount: ${JSON.stringify(queryKey)}`);
        console.log('Query Key:', queryKey);
        console.log('Final Data:', queryClient.getQueryData(queryKey));
        console.groupEnd();
      }
    };
  }, [queryKey, queryClient, queryData, logOnMount, logOnUnmount]);
  
  // Log on data change
  useEffect(() => {
    if (logOnChange) {
      console.group(`Query Debugger - Data Changed: ${JSON.stringify(queryKey)}`);
      console.log('Query Key:', queryKey);
      console.log('New Data:', queryData);
      console.groupEnd();
    }
  }, [queryKey, queryData, logOnChange]);
  
  // Return utilities for manual debugging
  return {
    // Force refetch the query
    refetch: () => queryClient.refetchQueries({ queryKey }),
    
    // Reset the query cache
    reset: () => queryClient.resetQueries({ queryKey }),
    
    // Remove the query from cache
    remove: () => queryClient.removeQueries({ queryKey }),
    
    // Get the current query data
    getData: () => queryClient.getQueryData(queryKey),
    
    // Set query data manually
    setData: (data: any) => queryClient.setQueryData(queryKey, data),
    
    // Get the query state
    getState: () => {
      const query = queryClient.getQueryCache().find({ queryKey });
      return query ? {
        state: query.state,
        isStale: query.isStale(),
        isActive: query.isActive(),
      } : null;
    },
  };
};

export default useQueryDebugger;