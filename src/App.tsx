import { MantineProvider } from '@mantine/core';
import { AppRouter } from './router';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider>
      <AppRouter />
    </MantineProvider>
  );
}

export default App;
