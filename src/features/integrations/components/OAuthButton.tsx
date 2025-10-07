import React, { useState, useEffect, useRef } from 'react';
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
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    const allowedOrigins = [
      window.location.origin, // Current origin (could be localhost or production)
      'https://mwapps.shibari.photo', // Frontend production
      'https://mwapss.shibari.photo', // Backend production
      'http://localhost:3001', // Backend dev
      'http://localhost:5173', // Frontend dev
      'https://localhost:5173', // Frontend dev (https)
    ];
    
    // Poll localStorage for OAuth result (fallback for when postMessage fails)
    const checkLocalStorageForResult = async () => {
      try {
        const resultRaw = localStorage.getItem('mwap_oauth_result');
        if (!resultRaw) return;
        
        const result = JSON.parse(resultRaw);
        console.log('[Opener] Found OAuth result in localStorage:', result);
        
        // Clear it immediately to prevent re-processing
        localStorage.removeItem('mwap_oauth_result');
        
        // Process as if it came from postMessage
        if (result.type === 'oauth_success') {
          await handleOAuthSuccess(result.integrationId, result.tenantId);
        } else if (result.type === 'oauth_error') {
          handleOAuthError(result.description);
        }
      } catch (e) {
        console.error('[Opener] Error checking localStorage:', e);
      }
    };
    
    // Check localStorage on mount and periodically while flow is active
    const interval = setInterval(() => {
      if (isLoading) {
        checkLocalStorageForResult();
      }
    }, 500); // Check every 500ms while loading
    
    // Also check immediately
    checkLocalStorageForResult();
    
    const handleMessage = async (event: MessageEvent) => {
      console.log('[Opener] Received postMessage:', { origin: event.origin, data: event.data });
      // Temporarily accept all origins for debugging; TODO: re-enable strict validation
      // if (!allowedOrigins.includes(event.origin)) {
      //   console.warn('[Opener] Message from disallowed origin:', event.origin);
      //   return;
      // }
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
        await handleOAuthSuccess(event.data.integrationId, event.data.tenantId);
      } else if (event.data.type === 'oauth_error') {
        handleOAuthError(event.data.description);
      }
    };
    // Cleanup function
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
    
    // Helper functions for handling success/error
    async function handleOAuthSuccess(integrationId: string, tenantId: string) {
      console.log('[Opener] ✅ Processing oauth_success');
      try { if (popupRef.current && !popupRef.current.closed) { popupRef.current.close(); } } catch {}
      popupRef.current = null;
      
      if (!currentTenant) {
        console.error('[Opener] ❌ No current tenant');
        notifications.show({ title: 'Error', message: 'No current tenant', color: 'red' });
        resetFlow();
        return;
      }
      
      console.log('[Opener] Verifying integration:', integrationId);
      const verification = await verifyIntegration(currentTenant, integrationId);
      console.log('[Opener] Verification result:', verification);
      console.log('[Opener] Verification result type:', typeof verification);
      console.log('[Opener] Verification has .success?', 'success' in verification);
      console.log('[Opener] Verification has .data?', 'data' in verification);
      console.log('[Opener] Verification has .status?', 'status' in verification);
      
      // Check if verification returned the integration directly or wrapped in {success, data}
      const integrationData = verification.success ? verification.data : verification;
      const status = integrationData?.status;
      
      console.log('[Opener] Integration status:', status);
      
      if (status === 'active') {
        console.log('[Opener] ✅ Integration verified and active');
        queryClient.invalidateQueries({ queryKey: ['integrations', currentTenant] });
        notifications.show({ title: 'Integration Verified', message: `Successfully connected to ${provider.name}`, color: 'green' });
        resetFlow();
        console.log('[Opener] Flow reset, calling onSuccess callback');
        onSuccess?.(integrationId);
        console.log('[Opener] Navigating to /integrations');
        navigate('/integrations');
      } else {
        console.error('[Opener] ❌ Verification failed or status not active. Status:', status);
        notifications.show({ title: 'Verification Failed', message: `Integration status: ${status || 'unknown'}`, color: 'red' });
        onError?.('Verification failed');
        resetFlow();
        setShowCleanupModal(true);
      }
    }
    
    function handleOAuthError(description: string) {
      console.log('[Opener] ❌ Processing oauth_error');
      try { if (popupRef.current && !popupRef.current.closed) { popupRef.current.close(); } } catch {}
      popupRef.current = null;
      notifications.show({ title: 'Integration Failed', message: description || 'OAuth failed', color: 'red' });
      onError?.(description);
      resetFlow();
      setShowCleanupModal(true);
    }
  }, [queryClient, currentTenant, provider.name, onSuccess, onError, navigate, verifyIntegration, resetFlow, isLoading]);

  const handleOAuthClick = async () => {
    if (isLoading) return; // Prevent multiple clicks
    
    // Open a placeholder popup synchronously to avoid popup blockers
    const popupWidth = 600;
    const popupHeight = 600;
    const left = (window.screen.width / 2) - (popupWidth / 2);
    const top = (window.screen.height / 2) - (popupHeight / 2);
    const popup = window.open('', 'oauthPopup', `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`);
    if (popup) {
      popupRef.current = popup;
      try {
        popup.document.write('<!doctype html><title>Connecting…</title><p style="font-family: system-ui; padding: 16px;">Opening provider authorization…</p>');
        popup.document.close();
      } catch {}
    }
    
    // Now run the OAuth initiation
    try {
      const result = await initiateOAuth(provider.id, metadata);
      if (result.success && result.authUrl) {
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.location.href = result.authUrl;
        } else {
          notifications.show({ title: 'Popup Blocked', message: 'Redirecting in this tab.', color: 'yellow' });
          window.location.href = result.authUrl;
        }
      } else {
        try { if (popupRef.current && !popupRef.current.closed) { popupRef.current.close(); } } catch {}
        popupRef.current = null;
        notifications.show({ title: 'Error', message: result.error || 'Failed to initiate', color: 'red' });
      }
    } catch (error: any) {
      try { if (popupRef.current && !popupRef.current.closed) { popupRef.current.close(); } } catch {}
      popupRef.current = null;
      notifications.show({ title: 'Error', message: error?.message || 'Failed to start', color: 'red' });
    }
  };

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
            onClick={showSecurityInfo ? () => setShowSecurityModal(true) : handleOAuthClick}
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