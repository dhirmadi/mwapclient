import React from 'react';
import { Loader, Text, Center, Stack } from '@mantine/core';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue',
  text
}) => {
  return (
    <Center py="xl">
      <Stack align="center" gap="sm">
        <Loader size={size} color={color} />
        {text && <Text size="sm" color="dimmed">{text}</Text>}
      </Stack>
    </Center>
  );
};

export default LoadingSpinner;