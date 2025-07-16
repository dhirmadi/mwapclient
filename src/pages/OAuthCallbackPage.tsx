import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Text, Loader, Alert, Stack, Button, Progress, Group } from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { parseOAuthState, getOAuthSuccessUri, getOAuthErrorUri } from '../shared/utils';
import { useOAuthFlow } from '../features/integrations';
import { validateOAuthCallback } from '../features/integrations/utils/oauthUtils';

const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [legacyMode, setLegacyMode] = useState(false);
  const [legacyStatus, setLegacyStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [legacyMessage, setLegacyMessage] = useState<string>('Processing OAuth callback...');
  
  const { 
    flowState, 
    handleCallback, 
    getErrorMessage: getFlowErrorMessage,
    isLoading 
  } = useOAuthFlow();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // First, try to validate with new OAuth flow
        const validation = validateOAuthCallback(searchParams);
        
        if (validation.isValid && validation.state) {
          // Use new integration flow
          if (import.meta.env.DEV) {
            console.log('🔗 Using new OAuth integration flow');
          }
          
          try {
            await handleCallback(searchParams);
            // Success handling is done in the hook's onSuccess callback
            setTimeout(() => {
              navigate('/integrations?oauth=success');
            }, 2000);
          } catch (error) {
            // Error handling is done in the hook's onError callback
            console.error('New OAuth flow failed:', error);
          }
          return;
        }
        
        // Fallback to legacy OAuth flow for backward compatibility
        if (import.meta.env.DEV) {
          console.log('🔗 Falling back to legacy OAuth flow');
        }
        
        setLegacyMode(true);
        await processLegacyCallback();
        
      } catch (error) {
        console.error('OAuth callback processing error:', error);
        setLegacyMode(true);
        setLegacyStatus('error');
        setLegacyMessage('Failed to process OAuth callback');
      }
    };

    const processLegacyCallback = async () => {
      try {
        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle OAuth errors
        if (error) {
          setLegacyStatus('error');
          setLegacyMessage(errorDescription || error || 'OAuth authorization failed');
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setLegacyStatus('error');
          setLegacyMessage('Missing required OAuth parameters');
          return;
        }

        // Parse state parameter (legacy format)
        const oauthState = parseOAuthState(state);
        if (!oauthState) {
          setLegacyStatus('error');
          setLegacyMessage('Invalid OAuth state parameter');
          return;
        }

        // The backend OAuth callback endpoint should handle the token exchange
        // and integration update automatically. Since we're here, it means
        // the process was successful.
        setLegacyStatus('success');
        setLegacyMessage('Integration connected successfully!');

        // Redirect to integrations page after a short delay
        setTimeout(() => {
          navigate('/integrations?oauth=success');
        }, 2000);

      } catch (error) {
        console.error('Legacy OAuth callback processing error:', error);
        setLegacyStatus('error');
        setLegacyMessage('Failed to process OAuth callback');
      }
    };

    processCallback();
  }, [searchParams, navigate, handleCallback]);

  const handleRetry = () => {
    if (legacyMode) {
      navigate('/integrations');
    } else {
      navigate('/integrations');
    }
  };

  const handleCancel = () => {
    navigate('/integrations');
  };

  // Render new OAuth flow UI
  if (!legacyMode) {
    const currentStep = flowState.step;
    const progress = flowState.progress;
    const error = flowState.error;

    return (
      <Container size="sm" py="xl">
        <Paper withBorder p="xl" radius="md">
          <Stack align="center" gap="md">
            {/* Progress indicator */}
            {(isLoading || currentStep !== 'error') && (
              <Progress 
                value={progress} 
                size="lg" 
                radius="xl" 
                style={{ width: '100%' }}
                animated={isLoading}
              />
            )}

            {/* Processing states */}
            {(currentStep === 'callback' || currentStep === 'token_exchange') && (
              <>
                <Loader size="lg" />
                <Text size="lg" fw={500}>
                  {currentStep === 'callback' ? 'Processing OAuth Callback' : 'Exchanging Tokens'}
                </Text>
                <Text c="dimmed" ta="center">
                  {currentStep === 'callback' 
                    ? 'Validating authorization and processing callback...'
                    : 'Exchanging authorization code for access tokens...'
                  }
                </Text>
              </>
            )}

            {/* Success state */}
            {currentStep === 'completion' && (
              <>
                <IconCheck size={48} color="var(--mantine-color-green-6)" />
                <Text size="lg" fw={500} c="green">Integration Connected!</Text>
                <Text c="dimmed" ta="center">
                  Your cloud provider has been connected successfully with enhanced security. 
                  You will be redirected to the integrations page shortly.
                </Text>
              </>
            )}

            {/* Error state */}
            {currentStep === 'error' && (
              <>
                <IconX size={48} color="var(--mantine-color-red-6)" />
                <Text size="lg" fw={500} c="red">Integration Failed</Text>
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  title="OAuth Error" 
                  color="red"
                  variant="light"
                >
                  {error ? getFlowErrorMessage(error) : 'Unknown error occurred'}
                </Alert>
                <Group gap="sm" mt="md">
                  <Button onClick={handleRetry} variant="filled">
                    Return to Integrations
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Render legacy OAuth flow UI for backward compatibility
  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="md">
          <Text size="xs" c="dimmed" mb="md">Legacy OAuth Flow</Text>
          
          {legacyStatus === 'processing' && (
            <>
              <Loader size="lg" />
              <Text size="lg" fw={500}>Processing OAuth Callback</Text>
              <Text c="dimmed" ta="center">
                Please wait while we complete your cloud provider integration...
              </Text>
            </>
          )}

          {legacyStatus === 'success' && (
            <>
              <IconCheck size={48} color="var(--mantine-color-green-6)" />
              <Text size="lg" fw={500} c="green">Integration Successful!</Text>
              <Text c="dimmed" ta="center">
                Your cloud provider has been connected successfully. 
                You will be redirected to the integrations page shortly.
              </Text>
            </>
          )}

          {legacyStatus === 'error' && (
            <>
              <IconX size={48} color="var(--mantine-color-red-6)" />
              <Text size="lg" fw={500} c="red">Integration Failed</Text>
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Error" 
                color="red"
                variant="light"
              >
                {legacyMessage}
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