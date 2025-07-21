import React from 'react';
import {
  Card,
  Group,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Tooltip,
  Stack,
  Avatar,
  Progress,
  Alert,
  Button,
  Divider,
  Box
} from '@mantine/core';
import {
  IconDots,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconX,
  IconTestPipe,
  IconCloud,
  IconSettings
} from '@tabler/icons-react';
import { Integration } from '../types';
import { useTokenManagement } from '../hooks';
import { 
  formatDistanceToNow, 
  getIntegrationStatusConfig,
  isTokenExpired,
  isTokenExpiringSoon,
  getTimeUntilExpiration
} from '../utils';
import { TokenStatusBadge } from './TokenStatusBadge';

interface IntegrationCardProps {
  integration: Integration;
  onRefresh?: (integrationId: string) => void;
  onEdit?: (integrationId: string) => void;
  onDelete?: (integrationId: string) => void;
  onTest?: (integrationId: string) => void;
  onViewDetails?: (integrationId: string) => void;
  isLoading?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = React.memo(({
  integration,
  onRefresh,
  onEdit,
  onDelete,
  onTest,
  onViewDetails,
  isLoading = false,
  showActions = true,
  compact = false,
}) => {
  const {
    refreshToken,
    testConnection,
    tokenHealth,
    isRefreshing,
    isTesting,
    needsRefresh,
    isExpired,
    isExpiringSoon,
    expirationTime
  } = useTokenManagement(integration.id);

  const handleRefresh = async () => {
    try {
      await refreshToken(integration.id);
      onRefresh?.(integration.id);
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  };

  const handleTest = async () => {
    try {
      await testConnection(integration.id);
      onTest?.(integration.id);
    } catch (error) {
      console.error('Failed to test connection:', error);
    }
  };

  const getProviderIcon = () => {
    if (integration.provider?.metadata?.iconUrl) {
      return (
        <Avatar
          src={integration.provider.metadata.iconUrl as string}
          size="sm"
          radius="sm"
        />
      );
    }
    
    return (
      <Avatar size="sm" radius="sm">
        <IconCloud size={16} />
      </Avatar>
    );
  };

  const getStatusAlert = () => {
    if (isExpired) {
      return (
        <Alert
          icon={<IconX size={16} />}
          color="red"
          variant="light"
          p="xs"
        >
          <Text size="xs">Token expired - refresh required</Text>
        </Alert>
      );
    }

    if (isExpiringSoon && expirationTime) {
      const timeLeft = formatDistanceToNow(new Date(Date.now() + expirationTime));
      return (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="orange"
          variant="light"
          p="xs"
        >
          <Text size="xs">Token expires in {timeLeft}</Text>
        </Alert>
      );
    }

    if (integration.status === 'error') {
      return (
        <Alert
          icon={<IconX size={16} />}
          color="red"
          variant="light"
          p="xs"
        >
          <Text size="xs">Connection error - check configuration</Text>
        </Alert>
      );
    }

    return null;
  };

  const getHealthProgress = () => {
    if (!tokenHealth) return 0;
    
    switch (tokenHealth.status) {
      case 'active': return 100;
      case 'expiring_soon': return 60;
      case 'expired': return 0;
      case 'error': return 0;
      default: return 50;
    }
  };

  return (
    <Card
      shadow="sm"
      padding={compact ? "sm" : "md"}
      radius="md"
      withBorder
      style={{
        position: 'relative',
        opacity: isLoading ? 0.6 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Progress size="sm" value={50} style={{ width: '60%' }} />
        </Box>
      )}

      {/* Header */}
      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          {getProviderIcon()}
          <div>
            <Text fw={500} size={compact ? "sm" : "md"} lineClamp={1}>
              {String((integration.metadata as any)?.displayName || integration.provider?.name || 'Unknown Provider')}
            </Text>
            <Text size="xs" c="dimmed">
              {integration.provider?.name} • Created {formatDistanceToNow(new Date(integration.createdAt))} ago
            </Text>
          </div>
        </Group>

        {showActions && (
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Actions</Menu.Label>
              
              {onViewDetails && (
                <Menu.Item
                  leftSection={<IconExternalLink size={14} />}
                  onClick={() => onViewDetails(integration.id)}
                >
                  View Details
                </Menu.Item>
              )}

              <Menu.Item
                leftSection={<IconTestPipe size={14} />}
                onClick={handleTest}
                disabled={isTesting}
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Menu.Item>

              <Menu.Item
                leftSection={<IconRefresh size={14} />}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
              </Menu.Item>

              {onEdit && (
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => onEdit(integration.id)}
                >
                  Edit Settings
                </Menu.Item>
              )}

              <Menu.Divider />

              {onDelete && (
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => onDelete(integration.id)}
                >
                  Delete Integration
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      {/* Status and Health */}
      <Stack gap="xs" mb="sm">
        <Group justify="space-between">
          <TokenStatusBadge
            status={integration.status}
            tokenHealth={tokenHealth}
            size={compact ? "xs" : "sm"}
          />
          
          <Text size="xs" c="dimmed">
            Last updated {formatDistanceToNow(new Date(integration.updatedAt))} ago
          </Text>
        </Group>

        {/* Health Progress Bar */}
        <div>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">Token Health</Text>
            <Text size="xs" c="dimmed">{getHealthProgress()}%</Text>
          </Group>
          <Progress
            value={getHealthProgress()}
            size="xs"
            color={
              getHealthProgress() > 80 ? 'green' :
              getHealthProgress() > 40 ? 'orange' : 'red'
            }
          />
        </div>
      </Stack>

      {/* Status Alert */}
      {getStatusAlert()}

      {/* Description */}
      {!compact && (integration.metadata as any)?.description && (
        <>
          <Divider my="sm" />
          <Text size="sm" c="dimmed" lineClamp={2}>
            {String((integration.metadata as any).description)}
          </Text>
        </>
      )}

      {/* Quick Actions */}
      {!compact && showActions && (
        <>
          <Divider my="sm" />
          <Group gap="xs">
            <Tooltip label="Refresh token">
              <Button
                variant="light"
                size="xs"
                leftSection={<IconRefresh size={12} />}
                onClick={handleRefresh}
                loading={isRefreshing}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </Tooltip>

            <Tooltip label="Test connection">
              <Button
                variant="light"
                size="xs"
                leftSection={<IconTestPipe size={12} />}
                onClick={handleTest}
                loading={isTesting}
                disabled={isLoading}
              >
                Test
              </Button>
            </Tooltip>

            {onViewDetails && (
              <Tooltip label="View details">
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconSettings size={12} />}
                  onClick={() => onViewDetails(integration.id)}
                  disabled={isLoading}
                >
                  Details
                </Button>
              </Tooltip>
            )}
          </Group>
        </>
      )}
    </Card>
  );
});

IntegrationCard.displayName = 'IntegrationCard';