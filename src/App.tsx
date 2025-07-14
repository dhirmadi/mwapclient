import { MantineProvider } from '@mantine/core';
import { AppRouter } from './core/router/AppRouter';
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
