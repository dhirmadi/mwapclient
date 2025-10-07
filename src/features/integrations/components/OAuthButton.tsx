import React, { useState, useEffect } from 'react';
import {
  Button,
  Group,
  Text,
  Progress,
  Alert,
  Stack,
  Tooltip,
  Modal,
  Avatar,
  Divider,
  List,
  Badge
} from '@mantine/core';
import {
  IconExternalLink,
  IconShield,
  IconKey,
  IconAlertCircle,
  IconCheck,
  IconRefresh,
  IconInfoCircle,
  IconLock,
  IconCloud
} from '@tabler/icons-react';
import { CloudProvider } from '../../cloud-providers/types';
import { useOAuthFlow, verifyIntegration } from '../hooks';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../core/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OAuthButtonProps {
  provider: CloudProvider;
  metadata?: Record<string, unknown>;
  integrationId?: string;
  onSuccess?: (integrationId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default';
  fullWidth?: boolean;
  showProgress?: boolean;
  showSecurityInfo?: boolean;
}

export const OAuthButton: React.FC<OAuthButtonProps> = ({
  provider,
  metadata,
  integrationId,
  onSuccess,
  onError,
  disabled = false,
  size = 'md',
  variant = 'filled',
  fullWidth = false,
  showProgress = true,
  showSecurityInfo = false,
}) => {
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupBusy, setCleanupBusy] = useState(false);
  const {
    flowState,
    initiateOAuth,
    isLoading,
    getErrorMessage,
    resetFlow,
  } = useOAuthFlow();
  const queryClient = useQueryClient();
  const { currentTenant } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const allowedOrigins = [
      window.location.origin,
      'https://mwapps.shibari.photo',
      'https://mwapss.shibari.photo',
      'http://localhost:3001',
      'http://localhost:5173',
      'https://localhost:5173',
    ];
    const handleMessage = async (event: MessageEvent) => {
      if (!allowedOrigins.includes(event.origin)) return;
      if (event.data.type === 'oauth_cleanup') {
        // Opener requested to cleanup and refresh integrations
        try {
          const pendingRaw = localStorage.getItem('mwap_oauth_pending');
          if (pendingRaw) {
            const pending = JSON.parse(pendingRaw);
            localStorage.removeItem('mwap_oauth_pending');
            if (pending?.tenantId) {
              queryClient.invalidateQueries({ queryKey: ['integrations', pending.tenantId] });
            }
          }
        } catch {}
        return;
      }
      if (event.data.type === 'oauth_success') {
        if (!currentTenant) {
          notifications.show({ title: 'Error', message: 'No current tenant', color: 'red' });
          return;
        }
        const verification = await verifyIntegration(currentTenant, event.data.integrationId);
        if (verification.success && verification.data.status === 'active') {
          queryClient.invalidateQueries({ queryKey: ['integrations', currentTenant] });
          notifications.show({ title: 'Integration Verified', message: `Successfully connected to ${provider.name}`, color: 'green' });
          onSuccess?.(event.data.integrationId);
          navigate('/integrations');
        } else {
          notifications.show({ title: 'Verification Failed', message: 'Integration status not active.', color: 'red' });
          onError?.('Verification failed');
        }
      } else if (event.data.type === 'oauth_error') {
        notifications.show({ title: 'Integration Failed', message: event.data.description || 'OAuth failed', color: 'red' });
        onError?.(event.data.description);
        // Reset local flow to stop loading/progress states
        try { resetFlow(); } catch {}
        // Offer cleanup flow in opener when popup is cross-origin
        setShowCleanupModal(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient, currentTenant, provider.name, onSuccess, onError, navigate, verifyIntegration]);

    const handleOAuthClick = async () => {
      if (isLoading) return;  // Prevent multiple clicks
    try {
      const result = await initiateOAuth(provider.id, metadata, integrationId);
      console.log('OAuth initiation result:', result);
      if (result.success && result.authUrl) {
        console.log('Attempting to open popup with URL:', result.authUrl);
        const popupWidth = 600;
        const popupHeight = 600;
        const left = (window.screen.width / 2) - (popupWidth / 2);
        const top = (window.screen.height / 2) - (popupHeight / 2);
        const popup = window.open(result.authUrl, 'oauthPopup', `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`);
        if (!popup) {
          // Fallback to full redirect on popup block
          notifications.show({ title: 'Popup Blocked', message: 'Redirecting in new tab.', color: 'yellow' });
          window.location.href = result.authUrl;
          return;
        }
        // Monitor the popup for same-origin error page and inject cleanup UI
        const monitorIntervalMs = 300;
        const monitor = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(monitor);
              return;
            }
            const href = popup.location.href;
            if (href && href.startsWith(window.location.origin + '/oauth/error')) {
              clearInterval(monitor);
              const url = new URL(href);
              const msg = url.searchParams.get('message') || 'OAuth failed';
              const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OAuth Error</title>
    <style>
      body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background: #fff; color: #111; }
      .card { max-width: 520px; margin: 10vh auto; border: 1px solid #eee; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
      .title { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
      .desc { color: #666; margin: 0 0 16px; }
      .row { display: flex; gap: 8px; }
      .btn { cursor: pointer; border: 0; border-radius: 8px; padding: 10px 14px; font-weight: 600; }
      .btn-primary { background: #fa5252; color: #fff; }
      .btn-secondary { background: #f1f3f5; color: #111; }
      .note { font-size: 12px; color: #888; margin-top: 12px; }
    </style>
  </head>
  <body>
    <div class="card">
      <p class="title">Authorization failed</p>
      <p class="desc">${msg}</p>
      <div class="row">
        <button class="btn btn-primary" id="cleanupBtn">Remove stale integration</button>
        <button class="btn btn-secondary" id="closeBtn">Close</button>
      </div>
      <p class="note">You can retry after cleanup.</p>
    </div>
    <script>
      (function(){
        const q = (k) => document.querySelector(k);
        const showMsg = (t, c) => {
          const el = document.createElement('div');
          el.textContent = t;
          el.style.marginTop = '12px';
          el.style.color = c || '#111';
          document.querySelector('.card').appendChild(el);
        };
        q('#closeBtn').onclick = function(){ window.close(); };
        q('#cleanupBtn').onclick = async function(){
          try {
            const pendingRaw = localStorage.getItem('mwap_oauth_pending');
            if (!pendingRaw) { showMsg('No pending integration found', '#c92a2a'); return; }
            const pending = JSON.parse(pendingRaw);
            if (!pending || !pending.tenantId || !pending.integrationId) { showMsg('Missing tenant or integration ID', '#c92a2a'); return; }
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/tenants/' + pending.tenantId + '/integrations/' + pending.integrationId, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json', 'Authorization': token ? ('Bearer ' + token) : undefined }
            });
            if (!res.ok) { showMsg('Cleanup failed (' + res.status + ')', '#c92a2a'); return; }
            try { localStorage.removeItem('mwap_oauth_pending'); } catch (e) {}
            try { window.opener && window.opener.postMessage({ type: 'oauth_cleanup', integrationId: pending.integrationId }, window.location.origin); } catch (e) {}
            showMsg('Removed. Closing...', '#2f9e44');
            setTimeout(function(){ window.close(); }, 700);
          } catch (e) {
            showMsg('Cleanup error', '#c92a2a');
          }
        };
      })();
    </script>
  </body>
 </html>`;
              try {
                popup.document.open();
                popup.document.write(html);
                popup.document.close();
              } catch (e) {
                // If writing fails, just close the monitor and let user close popup
              }
            }
          } catch {
            // Ignore cross-origin errors until it returns to our origin
          }
        }, monitorIntervalMs);
        // Add timeout for auto-close failure
        const maxWait = 30000; // 30s
        const timer = setTimeout(() => {
          if (!popup.closed) {
            notifications.show({ title: 'OAuth Timeout', message: 'Closing popup.', color: 'orange' });
            popup.close();
          }
        }, maxWait);
      } else {
        console.error('Initiation failed:', result.error);
        notifications.show({ title: 'Error', message: result.error || 'Failed to initiate', color: 'red' });
      }
    } catch (error: any) {
      notifications.show({ title: 'Error', message: error.message || 'Failed to start', color: 'red' });
    }
  };

  // Simple debounce function
  const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };
  const debouncedHandleOAuthClick = debounce(handleOAuthClick, 1000);

  const getButtonContent = () => {
    const providerIcon = provider.metadata?.iconUrl ? (
      <Avatar
        src={provider.metadata.iconUrl as string}
        size={16}
        radius="sm"
      />
    ) : (
      <IconCloud size={16} />
    );

    switch (flowState.step) {
      case 'initialization':
        return {
          icon: providerIcon,
          text: `Connect ${provider.name}`,
          loading: isLoading,
        };
      
      case 'authorization':
        return {
          icon: <IconExternalLink size={16} />,
          text: 'Redirecting...',
          loading: true,
        };
      
      case 'callback':
        return {
          icon: <IconRefresh size={16} />,
          text: 'Processing...',
          loading: true,
        };
      
      case 'token_exchange':
        return {
          icon: <IconKey size={16} />,
          text: 'Exchanging tokens...',
          loading: true,
        };
      
      case 'completion':
        return {
          icon: <IconCheck size={16} />,
          text: 'Connected!',
          loading: false,
        };
      
      case 'error':
        return {
          icon: <IconAlertCircle size={16} />,
          text: 'Try Again',
          loading: false,
        };
      
      default:
        return {
          icon: providerIcon,
          text: `Connect ${provider.name}`,
          loading: isLoading,
        };
    }
  };

  const buttonContent = getButtonContent();
  const isButtonDisabled = disabled || !provider.isActive || isLoading;

  const getProgressValue = () => {
    return flowState.progress || 0;
  };

  const getProgressColor = () => {
    if (flowState.step === 'error') return 'red';
    if (flowState.step === 'completion') return 'green';
    return 'blue';
  };

  const renderSecurityModal = () => (
    <Modal
      opened={showSecurityModal}
      onClose={() => setShowSecurityModal(false)}
      title={
        <Group gap="sm">
          <IconShield size={20} color="var(--mantine-color-green-6)" />
          <Text fw={500}>Security Information</Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        <Alert
          icon={<IconLock size={16} />}
          color="green"
          variant="light"
        >
          <Text size="sm">
            This connection uses industry-standard OAuth 2.0 with PKCE for maximum security.
          </Text>
        </Alert>

        <div>
          <Text fw={500} mb="xs">What happens when you connect:</Text>
          <List size="sm" spacing="xs">
            <List.Item>You'll be redirected to {provider.name}'s secure login page</List.Item>
            <List.Item>You'll authorize MWAP to access your account</List.Item>
            <List.Item>A secure token will be created for API access</List.Item>
            <List.Item>No passwords are stored on our servers</List.Item>
          </List>
        </div>

        <Divider />

        <div>
          <Text fw={500} mb="xs">Permissions requested:</Text>
          <Stack gap="xs">
            {provider.scopes.map((scope, index) => (
              <Group key={index} gap="xs">
                <Badge size="xs" variant="light">
                  {scope}
                </Badge>
                <Text size="sm" c="dimmed">
                  {getScopeDescription(scope)}
                </Text>
              </Group>
            ))}
          </Stack>
        </div>

        <Divider />

        <Group justify="space-between">
          <Button
            variant="subtle"
            onClick={() => setShowSecurityModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowSecurityModal(false);
              handleOAuthClick();
            }}
            leftSection={<IconShield size={16} />}
          >
            Continue Securely
          </Button>
        </Group>
      </Stack>
    </Modal>
  );

  const getScopeDescription = (scope: string): string => {
    const descriptions: Record<string, string> = {
      'read': 'Read access to your files',
      'write': 'Create and modify files',
      'delete': 'Delete files and folders',
      'profile': 'Access to basic profile information',
      'email': 'Access to your email address',
      'offline_access': 'Access when you\'re not online',
    };
    
    return descriptions[scope] || 'Access to your account';
  };

  const handleCleanup = async () => {
    if (cleanupBusy) return;
    setCleanupBusy(true);
    try {
      const pendingRaw = localStorage.getItem('mwap_oauth_pending');
      if (!pendingRaw) {
        notifications.show({ title: 'Cleanup Failed', message: 'No pending integration found', color: 'red' });
        setCleanupBusy(false);
        return;
      }
      const pending = JSON.parse(pendingRaw);
      if (!pending?.tenantId || !pending?.integrationId) {
        notifications.show({ title: 'Cleanup Failed', message: 'Missing tenant or integration ID', color: 'red' });
        setCleanupBusy(false);
        return;
      }
      await api.delete(`/tenants/${pending.tenantId}/integrations/${pending.integrationId}`);
      try { localStorage.removeItem('mwap_oauth_pending'); } catch {}
      queryClient.invalidateQueries({ queryKey: ['integrations', pending.tenantId] });
      notifications.show({ title: 'Removed', message: 'Stale integration removed', color: 'green' });
      setShowCleanupModal(false);
    } catch (e: any) {
      notifications.show({ title: 'Cleanup Failed', message: e?.message || 'Unable to remove', color: 'red' });
    } finally {
      setCleanupBusy(false);
    }
  };

  return (
    <>
      <Stack gap="xs">
        <Group gap="xs">
          <Button
            size={size}
            variant={variant}
            fullWidth={fullWidth}
            disabled={isButtonDisabled || isLoading}
            loading={buttonContent.loading}
            leftSection={!buttonContent.loading ? buttonContent.icon : undefined}
            onClick={showSecurityInfo ? () => setShowSecurityModal(true) : async () => {
              // Open a placeholder popup synchronously to avoid popup blockers
              const popupWidth = 600;
              const popupHeight = 600;
              const left = (window.screen.width / 2) - (popupWidth / 2);
              const top = (window.screen.height / 2) - (popupHeight / 2);
              const popup = window.open('', 'oauthPopup', `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`);
              if (popup) {
                try {
                  popup.document.write('<!doctype html><title>Connecting…</title><p style="font-family: system-ui; padding: 16px;">Opening provider authorization…</p>');
                  popup.document.close();
                } catch {}
              }
              // Now run the original handler
              try {
                const result = await initiateOAuth(provider.id, metadata);
                if (result.success && result.authUrl) {
                  if (popup && !popup.closed) {
                    popup.location.href = result.authUrl;
                  } else {
                    notifications.show({ title: 'Popup Blocked', message: 'Redirecting in this tab.', color: 'yellow' });
                    window.location.href = result.authUrl;
                  }
                } else {
                  if (popup && !popup.closed) popup.close();
                  notifications.show({ title: 'Error', message: result.error || 'Failed to initiate', color: 'red' });
                }
              } catch (error: any) {
                if (popup && !popup.closed) popup.close();
                notifications.show({ title: 'Error', message: error?.message || 'Failed to start', color: 'red' });
              }
            }}
            color={flowState.step === 'error' ? 'red' : 
                   flowState.step === 'completion' ? 'green' : undefined}
          >
            {buttonContent.text}
          </Button>

          {showSecurityInfo && (
            <Tooltip label="View security information">
              <Button
                size={size}
                variant="subtle"
                onClick={() => setShowSecurityModal(true)}
                disabled={isButtonDisabled}
              >
                <IconInfoCircle size={16} />
              </Button>
            </Tooltip>
          )}
        </Group>

        {/* Progress Bar */}
        {showProgress && isLoading && (
          <Progress
            value={getProgressValue()}
            size="xs"
            color={getProgressColor()}
            animated
          />
        )}

        {/* Error Display */}
        {flowState.step === 'error' && flowState.error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            <Group justify="space-between">
              <Text size="sm">
                {getErrorMessage(flowState.error)}
              </Text>
              <Button
                size="xs"
                variant="subtle"
                onClick={resetFlow}
              >
                Dismiss
              </Button>
            </Group>
          </Alert>
        )}

        {/* Success Display */}
        {flowState.step === 'completion' && (
          <Alert
            icon={<IconCheck size={16} />}
            color="green"
            variant="light"
          >
            <Text size="sm">
              Successfully connected to {provider.name}!
            </Text>
          </Alert>
        )}

        {/* Provider Status Warning */}
        {!provider.isActive && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="orange"
            variant="light"
          >
            <Text size="sm">
              This provider is currently unavailable. Please try again later.
            </Text>
          </Alert>
        )}
      </Stack>

      {/* Security Information Modal */}
      {renderSecurityModal()}

      {/* Cleanup Modal shown on oauth_error */}
      <Modal opened={showCleanupModal} onClose={() => setShowCleanupModal(false)} title={
        <Group gap="sm">
          <IconAlertCircle size={20} color="var(--mantine-color-red-6)" />
          <Text fw={500}>Authorization failed</Text>
        </Group>
      }>
        <Stack gap="md">
          <Text size="sm" c="dimmed">Remove the stale integration record and try again.</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setShowCleanupModal(false)}>Cancel</Button>
            <Button color="red" loading={cleanupBusy} onClick={handleCleanup}>Remove stale integration</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};