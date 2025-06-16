import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppRouter } from './router';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function App() {
  return (
    <MantineProvider>
      <Notifications position="top-right" limit={5} containerWidth={400} notificationMaxHeight={200} />
      <AppRouter />
    </MantineProvider>
  );
}

export default App;
