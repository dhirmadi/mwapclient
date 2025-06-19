import { MantineProvider } from '@mantine/core';
import OptimizedAppRouter from './router/OptimizedAppRouter';
import '@mantine/core/styles.css';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import NotificationContainer from './components/notifications/NotificationContainer';
import { useState } from 'react';
import { CloudProviderProvider } from './context/OptimizedCloudProviderContext';

/**
 * OptimizedApp component
 * 
 * This component is the root of the application with optimized data fetching
 * and improved performance.
 */
function OptimizedApp() {
  // Create a client with enhanced debugging capabilities and optimized settings
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        refetchOnWindowFocus: false, // Don't refetch on window focus by default
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes
      },
    },
    // Add query logger for debugging
    logger: {
      log: (message) => {
        console.log('React Query:', message);
      },
      warn: (message) => {
        console.warn('React Query Warning:', message);
      },
      error: (message) => {
        console.error('React Query Error:', message);
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        {/* The CloudProviderProvider must be inside the QueryClientProvider but outside the AppRouter */}
        {/* This ensures the context is available throughout the application */}
        <CloudProviderProvider>
          <OptimizedAppRouter />
          <NotificationContainer />
        </CloudProviderProvider>
        {/* Enhanced React Query Devtools with better visibility */}
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom"
          buttonPosition="bottom-right"
          styleNonce="react-query"
        />
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default OptimizedApp;