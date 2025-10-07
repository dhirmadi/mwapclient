import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Text, Loader, Alert, Stack, Button, Progress, Group } from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { parseOAuthState } from '../shared/utils';
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
  const [cleanupBusy, setCleanupBusy] = useState<boolean>(false);

  useEffect(() => {
    if (pathname === '/oauth/success') {
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
      setTimeout(() => window.close(), 2000);
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

  const handleCleanupStale = async () => {
    if (cleanupBusy) return;
    setCleanupBusy(true);
    try {
      // Prefer state from URL; fallback to localStorage pending context
      const stateParam = searchParams.get('state');
      let tenantId: string | null = null;
      let integrationId: string | null = null;
      if (stateParam) {
        const state = parseOAuthState(stateParam);
        tenantId = state?.tenantId || null;
        integrationId = state?.integrationId || null;
      }
      if (!tenantId || !integrationId) {
        try {
          const pendingRaw = localStorage.getItem('mwap_oauth_pending');
          if (pendingRaw) {
            const pending = JSON.parse(pendingRaw);
            tenantId = tenantId || pending?.tenantId || null;
            integrationId = integrationId || pending?.integrationId || null;
          }
        } catch {}
      }
      if (!tenantId || !integrationId) {
        notifications.show({ title: 'Cleanup Failed', message: 'Missing tenant or integration ID', color: 'red' });
        setCleanupBusy(false);
        return;
      }
      const resp = await api.delete(`/tenants/${tenantId}/integrations/${integrationId}`);
      const res = handleApiResponseSafe(resp);
      if (res.success) {
        try { localStorage.removeItem('mwap_oauth_pending'); } catch {}
        notifications.show({ title: 'Removed', message: 'Stale integration removed', color: 'green' });
        if (window.opener) {
          window.opener.postMessage({ type: 'oauth_cleanup', integrationId }, window.location.origin);
        }
        setTimeout(() => window.close(), 1000);
      } else {
        notifications.show({ title: 'Cleanup Failed', message: res.error || 'Unable to remove', color: 'red' });
      }
    } catch (e: any) {
      notifications.show({ title: 'Cleanup Failed', message: e?.message || 'Unable to remove', color: 'red' });
    } finally {
      setCleanupBusy(false);
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
            <Group>
              <Button onClick={() => navigate('/integrations')}>Go to Integrations</Button>
              {/* Backend-driven flow: cleanup handled in opener UI */}
            </Group>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default OAuthCallbackPage;