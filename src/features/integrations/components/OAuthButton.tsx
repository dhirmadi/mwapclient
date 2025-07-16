import React, { useState } from 'react';
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
import { useOAuthFlow } from '../hooks';
import { buildAuthorizationUrl } from '../utils/oauthUtils';

interface OAuthButtonProps {
  provider: CloudProvider;
  metadata?: Record<string, unknown>;
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
  const {
    flowState,
    initiateOAuth,
    isLoading,
    getErrorMessage,
    resetFlow
  } = useOAuthFlow();

  const handleOAuthClick = async () => {
    try {
      const result = await initiateOAuth(provider.id, metadata);
      
      if (result.success && result.authUrl) {
        // Redirect to OAuth provider
        window.location.href = result.authUrl;
      } else {
        onError?.(result.error || 'Failed to initiate OAuth flow');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to start OAuth process';
      onError?.(errorMessage);
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

  return (
    <>
      <Stack gap="xs">
        <Group gap="xs">
          <Button
            size={size}
            variant={variant}
            fullWidth={fullWidth}
            disabled={isButtonDisabled}
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
    </>
  );
};