import { MantineProvider } from '@mantine/core';
import { Notifications, NotificationsProvider } from '@mantine/notifications';
import { AppRouter } from './router';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function App() {
  return (
    <MantineProvider>
      <NotificationsProvider limit={5} position="top-right" containerWidth={400} notificationMaxHeight={200}>
        <AppRouter />
      </NotificationsProvider>
    </MantineProvider>
  );
}

export default App;
