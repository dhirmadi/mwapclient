import React from 'react';
import { useAuth } from '../context/OptimizedAuthContext';
import { Button, Title, Text, Container, Paper, Group } from '@mantine/core';
import OptimizedAuthRedirect from '../components/auth/OptimizedAuthRedirect';
import { IconLogin } from '@tabler/icons-react';

/**
 * Optimized Login page component
 * 
 * This component renders the login page with Auth0 authentication.
 * It uses OptimizedAuthRedirect to handle authentication redirects
 * and prevent UI flashing.
 */
const OptimizedLogin: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();

  // If already authenticated, OptimizedAuthRedirect will handle the redirect
  return (
    <OptimizedAuthRedirect>
      {!isAuthenticated && !isLoading && (
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
    </OptimizedAuthRedirect>
  );
};

export default OptimizedLogin;