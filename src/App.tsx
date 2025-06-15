import { MantineProvider, createTheme } from '@mantine/core';
import { AppRouter } from './router';
import '@mantine/core/styles.css';

// Create a theme with your preferred colors and settings
const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        withBorder: true,
        p: 'lg',
      },
    },
  },
});

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <AppRouter />
    </MantineProvider>
  );
}

export default App;
