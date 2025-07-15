import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Text, Loader, Alert, Stack, Button } from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';
import { parseOAuthState, getOAuthSuccessUri, getOAuthErrorUri } from '../shared/utils/oauth';

const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Processing OAuth callback...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle OAuth errors
        if (error) {
          setStatus('error');
          setMessage(errorDescription || error || 'OAuth authorization failed');
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setStatus('error');
          setMessage('Missing required OAuth parameters');
          return;
        }

        // Parse state parameter
        const oauthState = parseOAuthState(state);
        if (!oauthState) {
          setStatus('error');
          setMessage('Invalid OAuth state parameter');
          return;
        }

        // The backend OAuth callback endpoint should handle the token exchange
        // and integration update automatically. Since we're here, it means
        // the process was successful.
        setStatus('success');
        setMessage('Integration connected successfully!');

        // Redirect to integrations page after a short delay
        setTimeout(() => {
          navigate('/tenant/integrations?oauth=success');
        }, 2000);

      } catch (error) {
        console.error('OAuth callback processing error:', error);
        setStatus('error');
        setMessage('Failed to process OAuth callback');
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/tenant/integrations');
  };

  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="md">
          {status === 'processing' && (
            <>
              <Loader size="lg" />
              <Text size="lg" fw={500}>Processing OAuth Callback</Text>
              <Text c="dimmed" ta="center">
                Please wait while we complete your cloud provider integration...
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <IconCheck size={48} color="var(--mantine-color-green-6)" />
              <Text size="lg" fw={500} c="green">Integration Successful!</Text>
              <Text c="dimmed" ta="center">
                Your cloud provider has been connected successfully. 
                You will be redirected to the integrations page shortly.
              </Text>
            </>
          )}

          {status === 'error' && (
            <>
              <IconX size={48} color="var(--mantine-color-red-6)" />
              <Text size="lg" fw={500} c="red">Integration Failed</Text>
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Error" 
                color="red"
                variant="light"
              >
                {message}
              </Alert>
              <Button onClick={handleRetry} mt="md">
                Return to Integrations
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default OAuthCallbackPage;