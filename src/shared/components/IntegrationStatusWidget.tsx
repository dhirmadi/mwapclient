import React from 'react';
import { Card, Group, Text, Badge, ActionIcon, Skeleton, Alert } from '@mantine/core';
import { IconPlugConnected, IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useIntegrations } from '../../features/integrations/hooks/useIntegrations';
import { useAuth } from '../../core/context/AuthContext';

/**
 * Widget component showing integration status overview for dashboard
 */
const IntegrationStatusWidget: React.FC = () => {
  const { isTenantOwner } = useAuth();
  const { data: integrations, isLoading, error } = useIntegrations();

  // Only show for tenant owners
  if (!isTenantOwner) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Skeleton height={24} width={150} />
          <Skeleton height={20} width={20} radius="xl" />
        </Group>
        <Skeleton height={16} width="80%" mb="xs" />
        <Skeleton height={16} width="60%" />
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Integration Status" 
          color="red"
          variant="light"
        >
          Unable to load integration status
        </Alert>
      </Card>
    );
  }

  const activeIntegrations = integrations?.filter(i => i.status === 'active') || [];
  const totalIntegrations = integrations?.length || 0;

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/integrations">
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <IconPlugConnected size={20} />
          <Text fw={500}>Cloud Integrations</Text>
        </Group>
        <ActionIcon 
          variant="subtle" 
          color="blue" 
          size="sm"
          component={Link}
          to="/integrations/create"
          onClick={(e) => e.stopPropagation()}
        >
          <IconPlus size={16} />
        </ActionIcon>
      </Group>

      {totalIntegrations > 0 ? (
        <div>
          <Group gap="xs" mb="xs">
            <Badge color="green" variant="light" size="sm">
              {activeIntegrations.length} Active
            </Badge>
            {totalIntegrations > activeIntegrations.length && (
              <Badge color="gray" variant="light" size="sm">
                {totalIntegrations - activeIntegrations.length} Inactive
              </Badge>
            )}
          </Group>
          <Text size="sm" c="dimmed">
            {activeIntegrations.length === 0 
              ? 'No active integrations' 
              : `${activeIntegrations.length} provider${activeIntegrations.length === 1 ? '' : 's'} connected`
            }
          </Text>
        </div>
      ) : (
        <div>
          <Text size="sm" c="dimmed" mb="xs">
            No cloud providers connected
          </Text>
          <Text size="xs" c="dimmed">
            Click to add your first integration
          </Text>
        </div>
      )}
    </Card>
  );
};

export default IntegrationStatusWidget;