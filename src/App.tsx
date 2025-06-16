import { MantineProvider } from '@mantine/core';
import { AppRouter } from './router';
import '@mantine/core/styles.css';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import NotificationContainer from './components/notifications/NotificationContainer';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <AppRouter />
        <NotificationContainer />
        <ReactQueryDevtools initialIsOpen={false} />
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
