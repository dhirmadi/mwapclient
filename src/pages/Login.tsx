import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Title, Text, Container, Paper, Group } from '@mantine/core';
import AuthRedirect from '../components/auth/AuthRedirect';
import { IconLogin } from '@tabler/icons-react';

/**
 * Login page component
 * 
 * This component renders the login page with Auth0 authentication.
 * It uses AuthRedirect to handle authentication redirects.
 */
const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();

  // If already authenticated, AuthRedirect will handle the redirect
  return (
    <AuthRedirect>
      {!isAuthenticated && (
        <Container size="xs" py="xl">
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <Title order={1} align="center" mb="md">Welcome to MWAP</Title>
            <Text align="center" size="lg" mb="xl" color="dimmed">
              Modular Web Application Platform
            </Text>
            
            <Group position="center">
              <Button
                onClick={login}
                size="lg"
                leftIcon={<IconLogin size={20} />}
                color="blue"
              >
                Sign in with Auth0
              </Button>
            </Group>
          </Paper>
        </Container>
      )}
    </AuthRedirect>
  );
};

export default Login;