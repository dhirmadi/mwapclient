import { MantineProvider } from '@mantine/core';
import { AppRouter } from './core/router/AppRouter';
import '@mantine/core/styles.css';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import NotificationContainer from './components/notifications/NotificationContainer';
import DebugPanel from './components/DebugPanel';
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
        onError: (error) => {
          if (import.meta.env.DEV) {
            console.error('🚨 REACT QUERY ERROR:', error);
          }
        },
        onSuccess: (data) => {
          if (import.meta.env.DEV) {
            console.log('🎉 REACT QUERY SUCCESS:', data);
          }
        },
      },
      mutations: {
        onError: (error) => {
          if (import.meta.env.DEV) {
            console.error('🚨 REACT QUERY MUTATION ERROR:', error);
          }
        },
        onSuccess: (data) => {
          if (import.meta.env.DEV) {
            console.log('🎉 REACT QUERY MUTATION SUCCESS:', data);
          }
        },
      },
    },
    logger: import.meta.env.DEV ? {
      log: (...args) => console.log('📊 React Query Log:', ...args),
      warn: (...args) => console.warn('⚠️ React Query Warning:', ...args),
      error: (...args) => console.error('❌ React Query Error:', ...args),
    } : undefined,
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <AppRouter />
        <NotificationContainer />
        <DebugPanel />
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
