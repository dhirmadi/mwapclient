import React from 'react';
import { Alert, Text, Code, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { ApiError } from '../types/api.types';

interface ErrorDisplayProps {
  error: Error | ApiError | null;
  title?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  title = 'An error occurred' 
}) => {
  if (!error) return null;

  const isApiError = 'code' in error;
  const message = isApiError ? error.message : error.message || 'An unknown error occurred';
  const code = isApiError ? error.code : 'ERROR';

  return (
    <Alert 
      icon={<IconAlertCircle size={16} />} 
      title={title}
      color="red"
      variant="filled"
    >
      <Stack gap="xs">
        <Text fw={500}>{code}: {message}</Text>
        
        {isApiError && 'details' in error && error.details && (
          <Code block>
            {JSON.stringify(error.details, null, 2)}
          </Code>
        )}
      </Stack>
    </Alert>
  );
};

export default ErrorDisplay;