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
    console.log('[Callback] OAuthCallbackPage mounted', { pathname, search: window.location.search });
    
    if (pathname === '/oauth/success') {
      handleOAuthSuccess(searchParams);
    } else if (pathname === '/oauth/error') {
      handleOAuthError(searchParams);
    } else {
      setStatus('error');
      setMessage('Invalid OAuth path');
    }
  }, [pathname, searchParams]);
  
  // Separate effect to handle immediate postMessage (CSP-safe)
  useEffect(() => {
    console.log('[Callback] Status effect triggered', { status, hasOpener: !!window.opener });
    
    if (status === 'success') {
      const tenantId = searchParams.get('tenantId');
      const integrationId = searchParams.get('integrationId');
      console.log('[Callback] Success status, params:', { tenantId, integrationId, hasOpener: !!window.opener });
      
      if (window.opener && tenantId && integrationId) {
        console.log('[Callback] Posting success message to opener NOW');
        try {
          window.opener.postMessage({ type: 'oauth_success', integrationId, tenantId }, '*');
          console.log('[Callback] ✅ Message posted successfully');
        } catch (e) {
          console.error('[Callback] ❌ postMessage failed:', e);
        }
      } else {
        console.warn('[Callback] Cannot post message:', { hasOpener: !!window.opener, tenantId, integrationId });
      }
    } else if (status === 'error') {
      const message = searchParams.get('message') || searchParams.get('error_description');
      if (window.opener) {
        console.log('[Callback] Posting error message immediately from effect');
        try {
          window.opener.postMessage({ type: 'oauth_error', description: message }, '*');
        } catch (e) {
          console.error('[Callback] postMessage failed:', e);
        }
      }
    }
  }, [status, searchParams]);

  const handleOAuthSuccess = (params: URLSearchParams) => {
    const tenantId = params.get('tenantId');
    const integrationId = params.get('integrationId');
    if (!tenantId || !integrationId) {
      setStatus('error');
      setMessage('Invalid OAuth response: Missing tenantId or integrationId');
      return;
    }
    setStatus('success');
    setMessage('OAuth integration successful!');
    notifications.show({ title: 'Success', message: 'Integration connected', color: 'green' });
    
    console.log('[Callback] window.opener exists?', !!window.opener);
    console.log('[Callback] window.opener value:', window.opener);
    
    // Try postMessage first
    if (window.opener && !window.opener.closed) {
      try {
        console.log('[Callback] Sending oauth_success to opener via postMessage:', { integrationId, tenantId });
        window.opener.postMessage({ type: 'oauth_success', integrationId, tenantId }, '*');
        console.log('[Callback] ✅ postMessage sent successfully');
      } catch (e) {
        console.error('[Callback] Failed to post message:', e);
      }
    } else {
      console.warn('[Callback] No opener or opener closed, using localStorage fallback');
    }
    
    // ALSO use localStorage as fallback (in case opener is lost due to redirects)
    try {
      const oauthResult = {
        type: 'oauth_success',
        integrationId,
        tenantId,
        timestamp: Date.now()
      };
      localStorage.setItem('mwap_oauth_result', JSON.stringify(oauthResult));
      console.log('[Callback] ✅ Stored result in localStorage:', oauthResult);
      
      // Trigger storage event (doesn't fire in same window, but opener will detect on focus)
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('[Callback] Failed to store in localStorage:', e);
    }
    
    // Don't auto-close - let user close manually to see console logs
  };

  const handleOAuthError = (params: URLSearchParams) => {
    const message = params.get('message') || params.get('error_description');
    setStatus('error');
    setMessage(message || 'OAuth authentication failed');
    notifications.show({ title: 'Error', message: message || 'OAuth failed', color: 'red' });
    
    // Post error message to opener FIRST
    if (window.opener) {
      try {
        console.log('[Callback] Sending oauth_error to opener:', { message });
        window.opener.postMessage({ type: 'oauth_error', description: message }, '*');
      } catch (e) {
        console.error('[Callback] Failed to post error message:', e);
      }
    }
    
    // Don't auto-close - let user close manually to see console logs
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

  const handleManualClose = () => {
    console.log('[Callback] Manual close button clicked');
    try {
      window.close();
    } catch (e) {
      console.log('[Callback] window.close() failed, navigating instead');
      navigate('/integrations');
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
              <Button onClick={handleManualClose} variant="filled">Close Window</Button>
              <Button onClick={() => navigate('/integrations')} variant="subtle">Go to Integrations</Button>
            </Group>
          )}
          {status === 'success' && (
            <Alert color="blue" variant="light" mt="md">
              <Text size="sm">✓ Message sent to main window. Check console logs before closing.</Text>
            </Alert>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default OAuthCallbackPage;