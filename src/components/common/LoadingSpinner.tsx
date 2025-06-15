import React from 'react';
import { Loader, Text, Center, Stack } from '@mantine/core';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  text = 'Loading...',
  fullPage = false
}) => {
  const content = (
    <Stack align="center" spacing="xs" className={className}>
      <Loader size={size} />
      {text && <Text size="sm" c="dimmed">{text}</Text>}
    </Stack>
  );

  if (fullPage) {
    return (
      <Center style={{ width: '100%', height: '100vh' }}>
        {content}
      </Center>
    );
  }

  return (
    <Center py="xl">
      {content}
    </Center>
  );
};

export default LoadingSpinner;