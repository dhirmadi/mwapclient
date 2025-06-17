import { MantineProvider } from '@mantine/core';
import { AppRouter } from './router';
import '@mantine/core/styles.css';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import NotificationContainer from './components/notifications/NotificationContainer';
import { useState } from 'react';

function App() {
  // Create a client with enhanced debugging capabilities
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        refetchOnWindowFocus: true,
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
        <AppRouter />
        <NotificationContainer />
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

export default App;
