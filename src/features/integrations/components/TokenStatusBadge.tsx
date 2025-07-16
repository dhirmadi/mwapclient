import React from 'react';
import { Badge, Tooltip, Group, Text, Stack, Divider } from '@mantine/core';
import {
  IconCheck,
  IconClock,
  IconX,
  IconAlertTriangle,
  IconRefresh,
  IconQuestionMark,
  IconShield,
  IconCalendar,
  IconActivity
} from '@tabler/icons-react';
import { IntegrationStatus, TokenHealth, TokenStatus } from '../types';
import { formatDistanceToNow, getTimeUntilExpiration } from '../utils';

interface TokenStatusBadgeProps {
  status: IntegrationStatus;
  tokenHealth?: TokenHealth | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTooltip?: boolean;
  variant?: 'filled' | 'light' | 'outline' | 'dot';
}

export const TokenStatusBadge: React.FC<TokenStatusBadgeProps> = React.memo(({
  status,
  tokenHealth,
  size = 'sm',
  showTooltip = true,
  variant = 'light',
}) => {
  const getStatusConfig = () => {
    // Primary status based on integration status
    switch (status) {
      case 'active':
        // Check token health for more specific status
        if (tokenHealth) {
          switch (tokenHealth.status) {
            case 'active':
              return {
                color: 'green',
                icon: <IconCheck size={12} />,
                label: 'Active',
                description: 'Integration is working properly'
              };
            case 'expiring_soon':
              return {
                color: 'orange',
                icon: <IconClock size={12} />,
                label: 'Expiring Soon',
                description: 'Token will expire soon'
              };
            case 'expired':
              return {
                color: 'red',
                icon: <IconX size={12} />,
                label: 'Expired',
                description: 'Token has expired and needs refresh'
              };
            case 'error':
              return {
                color: 'red',
                icon: <IconAlertTriangle size={12} />,
                label: 'Error',
                description: 'Token validation failed'
              };
            case 'refreshing':
              return {
                color: 'blue',
                icon: <IconRefresh size={12} />,
                label: 'Refreshing',
                description: 'Token is being refreshed'
              };
            default:
              return {
                color: 'gray',
                icon: <IconQuestionMark size={12} />,
                label: 'Unknown',
                description: 'Token status unknown'
              };
          }
        }
        
        return {
          color: 'green',
          icon: <IconCheck size={12} />,
          label: 'Active',
          description: 'Integration is active'
        };

      case 'pending':
        return {
          color: 'yellow',
          icon: <IconClock size={12} />,
          label: 'Pending',
          description: 'Integration setup in progress'
        };

      case 'error':
        return {
          color: 'red',
          icon: <IconX size={12} />,
          label: 'Error',
          description: 'Integration has errors'
        };

      case 'inactive':
        return {
          color: 'gray',
          icon: <IconX size={12} />,
          label: 'Inactive',
          description: 'Integration is disabled'
        };

      default:
        return {
          color: 'gray',
          icon: <IconQuestionMark size={12} />,
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const config = getStatusConfig();

  const getTooltipContent = () => {
    if (!showTooltip) return null;

    return (
      <Stack gap="xs" style={{ maxWidth: 250 }}>
        {/* Status Information */}
        <Group gap="xs">
          {config.icon}
          <Text size="sm" fw={500}>
            {config.label}
          </Text>
        </Group>
        
        <Text size="xs" c="dimmed">
          {config.description}
        </Text>

        {/* Token Health Details */}
        {tokenHealth && (
          <>
            <Divider />
            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">Token Status:</Text>
                <Text size="xs" fw={500}>
                  {tokenHealth.status.replace('_', ' ').toUpperCase()}
                </Text>
              </Group>

              {tokenHealth.expiresAt && (
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Expires:</Text>
                  <Text size="xs">
                    {formatDistanceToNow(new Date(tokenHealth.expiresAt))}
                  </Text>
                </Group>
              )}

              {tokenHealth.lastRefreshed && (
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Last Refreshed:</Text>
                  <Text size="xs">
                    {formatDistanceToNow(new Date(tokenHealth.lastRefreshed))} ago
                  </Text>
                </Group>
              )}

              {tokenHealth.isExpired && (
                <Group gap="xs">
                  <IconAlertTriangle size={12} color="red" />
                  <Text size="xs" c="red">
                    Token has expired
                  </Text>
                </Group>
              )}

              {tokenHealth.isExpiringSoon && !tokenHealth.isExpired && (
                <Group gap="xs">
                  <IconClock size={12} color="orange" />
                  <Text size="xs" c="orange">
                    Token expires soon
                  </Text>
                </Group>
              )}

              {tokenHealth.needsRefresh && (
                <Group gap="xs">
                  <IconRefresh size={12} color="blue" />
                  <Text size="xs" c="blue">
                    Refresh recommended
                  </Text>
                </Group>
              )}
            </Stack>
          </>
        )}

        {/* Additional Status Details */}
        {status === 'error' && (
          <>
            <Divider />
            <Group gap="xs">
              <IconAlertTriangle size={12} color="red" />
              <Text size="xs" c="red">
                Check integration configuration
              </Text>
            </Group>
          </>
        )}

        {status === 'pending' && (
          <>
            <Divider />
            <Group gap="xs">
              <IconClock size={12} color="yellow" />
              <Text size="xs" c="yellow">
                OAuth authorization may be required
              </Text>
            </Group>
          </>
        )}
      </Stack>
    );
  };

  const badge = (
    <Badge
      color={config.color}
      variant={variant}
      size={size}
      leftSection={config.icon}
    >
      {config.label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip
      label={getTooltipContent()}
      multiline
      withArrow
      position="bottom"
      offset={5}
    >
      {badge}
    </Tooltip>
  );
});

TokenStatusBadge.displayName = 'TokenStatusBadge';