import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Text, Loader, Alert, Stack, Button, Progress, Group } from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { parseOAuthState, getOAuthSuccessUri, getOAuthErrorUri } from '../shared/utils';
import { validateOAuthCallback } from '../features/integrations/utils/oauthUtils';
import api from '../shared/utils/api';
import { handleApiResponseSafe } from '../shared/utils/apiResponse';
import { notifications } from '@mantine/notifications';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../core/context/AuthContext';

const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Processing...');

  useEffect(() => {
    if (searchParams.get('code')) {
      const handleCodeExchange = async () => {
        // Optional: Refresh token
        // await getAccessTokenSilently();
        const validation = validateOAuthCallback(searchParams);
        if (validation.isValid && validation.state) {
          try {
            const response = await api.post(`/oauth/tenants/${validation.state.tenantId}/integrations/${validation.state.integrationId}/complete`, { code: validation.code });
            const result = handleApiResponseSafe(response);
            if (result.success) {
              setStatus('success');
              setMessage('Integration connected successfully!');
              notifications.show({ title: 'Success', message: 'Tokens exchanged', color: 'green' });
              if (window.opener) {
                window.opener.postMessage({ type: 'oauth_success', integrationId: validation.state.integrationId }, window.location.origin);
                setTimeout(() => window.close(), 3000);
              } else {
                setTimeout(() => navigate('/integrations'), 2000);
              }
            } else {
              throw new Error(result.error || 'Exchange failed');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to complete OAuth';
            setStatus('error');
            setMessage(errorMessage);
            notifications.show({ title: 'Error', message: 'Exchange failed', color: 'red' });
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth_error', description: errorMessage }, window.location.origin);
              setTimeout(() => window.close(), 5000);
            }
          }
        } else {
          setStatus('error');
          setMessage(validation.errorMessage || 'Invalid callback parameters');
        }
      };
      handleCodeExchange();
    } else if (pathname === '/oauth/success') {
      handleOAuthSuccess(searchParams);
    } else if (pathname === '/oauth/error') {
      handleOAuthError(searchParams);
    } else {
      setStatus('error');
      setMessage('Invalid OAuth path');
    }
  }, [pathname, searchParams]);

  const handleOAuthSuccess = (params: URLSearchParams) => {
    const tenantId = params.get('tenantId');
    const integrationId = params.get('integrationId');
    if (!tenantId || !integrationId) {
      setStatus('error');
      setMessage('Invalid OAuth response');
      return;
    }
    setStatus('success');
    setMessage('OAuth integration successful!');
    notifications.show({ title: 'Success', message: 'Integration connected', color: 'green' });
    if (window.opener) {
      window.opener.postMessage({ type: 'oauth_success', integrationId }, window.location.origin);
      setTimeout(() => window.close(), 3000);
    } else {
      setTimeout(() => navigate('/integrations'), 2000);
    }
  };

  const handleOAuthError = (params: URLSearchParams) => {
    const message = params.get('message') || params.get('error_description');
    setStatus('error');
    setMessage(message || 'OAuth authentication failed');
    notifications.show({ title: 'Error', message: message || 'OAuth failed', color: 'red' });
    if (window.opener) {
      window.opener.postMessage({ type: 'oauth_error', description: message }, window.location.origin);
      setTimeout(() => window.close(), 5000);
    } else {
      setTimeout(() => navigate('/integrations'), 3000);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="md">
          {status === 'processing' && <Loader size="lg" />}
          {status === 'success' && <IconCheck size={48} color="green" />}
          {status === 'error' && <IconX size={48} color="red" />}
          <Text size="lg" fw={500}>{status === 'success' ? 'Success' : status === 'error' ? 'Error' : 'Processing'}</Text>
          <Text c="dimmed">{message}</Text>
          {status !== 'processing' && (
            <Button onClick={() => navigate('/integrations')}>Go to Integrations</Button>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default OAuthCallbackPage;