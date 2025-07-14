import React from 'react';
import { Loader, Center, Text, Stack } from '@mantine/core';

interface AuthLoadingSpinnerProps {
  message?: string;
}

/**
 * Loading spinner component shown during authentication process
 */
export const AuthLoadingSpinner: React.FC<AuthLoadingSpinnerProps> = ({ 
  message = "Authenticating..." 
}) => {
  return (
    <Center style={{ minHeight: '200px' }}>
      <Stack align="center" gap="md">
        <Loader size="lg" />
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      </Stack>
    </Center>
  );
};

export default AuthLoadingSpinner;