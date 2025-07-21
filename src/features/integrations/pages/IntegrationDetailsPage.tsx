import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  Paper,
  Button,
  Group,
  Stack,
  Alert,
  Container,
  Tabs,
  Badge,
  ActionIcon,
  Modal,
  Divider,
  Grid,
  Card,
  Progress,
  List,
  Tooltip,
  Avatar,
  Switch,
  TextInput,
  Textarea,
  Skeleton,
  Center,
  SimpleGrid,
  Timeline,
  Code,
  CopyButton
} from '@mantine/core';
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconTestPipe,
  IconSettings,
  IconActivity,
  IconShield,
  IconKey,
  IconCloud,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconClock,
  IconExternalLink,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconInfoCircle,
  IconChartBar,
  IconHistory,
  IconBell,
  IconToggleLeft,
  IconToggleRight
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../core/context/AuthContext';
import { 
  useIntegration, 
  useUpdateIntegration, 
  useDeleteIntegration,
  useTokenManagement 
} from '../hooks';
import { TokenStatusBadge } from '../components';
import { formatDistanceToNow, getIntegrationStatusConfig } from '../utils';

const IntegrationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTokenDetails, setShowTokenDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Data fetching
  const { 
    data: integration, 
    isLoading, 
    error, 
    refetch 
  } = useIntegration(id!);
  
  const {
    refreshToken,
    testConnection,
    tokenHealth,
    isRefreshing,
    isTesting,
    // connectionStatus,
    // lastTestResult
  } = useTokenManagement(id!);

  const { mutate: updateIntegration, isPending: isUpdating } = useUpdateIntegration();
  const { mutate: deleteIntegration, isPending: isDeleting } = useDeleteIntegration();

  // Form for editing
  const form = useForm({
    initialValues: {
      displayName: integration?.metadata?.displayName || '',
      description: integration?.metadata?.description || '',
      isActive: integration?.isActive || false,
      settings: {
        autoRefresh: (integration?.metadata as any)?.settings?.autoRefresh || true,
        notifyOnExpiration: (integration?.metadata as any)?.settings?.notifyOnExpiration || true,
      },
    },
  });

  // Update form when integration loads
  React.useEffect(() => {
    if (integration) {
      form.setValues({
        displayName: integration.metadata?.displayName || '',
        description: integration.metadata?.description || '',
        isActive: integration.isActive,
        settings: {
          autoRefresh: (integration.metadata as any)?.settings?.autoRefresh || true,
          notifyOnExpiration: (integration.metadata as any)?.settings?.notifyOnExpiration || true,
        },
      });
    }
  }, [integration]);

  // Event handlers
  const handleBack = () => {
    navigate('/integrations');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (integration) {
      form.setValues({
        displayName: integration.metadata?.displayName || '',
        description: integration.metadata?.description || '',
        isActive: integration.isActive,
        settings: {
          autoRefresh: (integration.metadata as any)?.settings?.autoRefresh || true,
          notifyOnExpiration: (integration.metadata as any)?.settings?.notifyOnExpiration || true,
        },
      });
    }
  };

  const handleSave = (values: typeof form.values) => {
    if (!integration) return;

    updateIntegration({
      integrationId: integration.id,
      data: {
        metadata: {
          ...integration.metadata,
          displayName: values.displayName,
          description: values.description,
          settings: values.settings,
        },
        isActive: values.isActive,
      },
    }, {
      onSuccess: () => {
        setIsEditing(false);
        notifications.show({
          title: 'Integration Updated',
          message: 'Your changes have been saved successfully.',
          color: 'green',
        });
      },
      onError: (error) => {
        notifications.show({
          title: 'Update Failed',
          message: error.message || 'Failed to update integration.',
          color: 'red',
        });
      },
    });
  };

  const handleDelete = () => {
    if (!integration) return;

    deleteIntegration(integration.id, {
      onSuccess: () => {
        notifications.show({
          title: 'Integration Deleted',
          message: 'The integration has been removed successfully.',
          color: 'green',
        });
        navigate('/integrations');
      },
      onError: (error) => {
        notifications.show({
          title: 'Delete Failed',
          message: error.message || 'Failed to delete integration.',
          color: 'red',
        });
      },
    });
  };

  const handleRefreshToken = async () => {
    try {
      await refreshToken(id!);
      notifications.show({
        title: 'Token Refreshed',
        message: 'Access token has been refreshed successfully.',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Refresh Failed',
        message: error.message || 'Failed to refresh token.',
        color: 'red',
      });
    }
  };

  const handleTestConnection = async () => {
    try {
      await testConnection(id!);
      notifications.show({
        title: 'Connection Test',
        message: 'Connection test completed. Check the results below.',
        color: 'blue',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Test Failed',
        message: error.message || 'Connection test failed.',
        color: 'red',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Container size="lg">
        <Stack gap="md">
          <Skeleton height={60} />
          <Skeleton height={200} />
          <Skeleton height={300} />
        </Stack>
      </Container>
    );
  }

  // Error state
  if (error || !integration) {
    return (
      <Container size="lg">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Integration Not Found"
          color="red"
          variant="light"
        >
          <Text size="sm" mb="md">
            The requested integration could not be found or you don't have permission to view it.
          </Text>
          <Button size="sm" onClick={handleBack}>
            Back to Integrations
          </Button>
        </Alert>
      </Container>
    );
  }

  // Get provider icon
  const getProviderIcon = () => {
    if (integration.provider?.metadata?.iconUrl) {
      return (
        <Avatar
          src={integration.provider.metadata.iconUrl as string}
          size="lg"
          radius="md"
        />
      );
    }
    
    return (
      <Avatar size="lg" radius="md">
        <IconCloud size={24} />
      </Avatar>
    );
  };

  // Get health percentage
  const getHealthPercentage = () => {
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
    <Container size="lg">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <ActionIcon variant="subtle" onClick={handleBack}>
            <IconArrowLeft size={16} />
          </ActionIcon>
          <div>
            <Title order={2}>Integration Details</Title>
            <Text c="dimmed">
              Manage your {integration.provider?.name} connection
            </Text>
          </div>
        </Group>
        
        <Group gap="sm">
          <Tooltip label="Test connection">
            <ActionIcon
              variant="light"
              onClick={handleTestConnection}
              loading={isTesting}
            >
              <IconTestPipe size={16} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="Refresh token">
            <ActionIcon
              variant="light"
              onClick={handleRefreshToken}
              loading={isRefreshing}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          
          <Button
            leftSection={<IconEdit size={16} />}
            onClick={handleEdit}
            disabled={isEditing}
          >
            Edit
          </Button>
          
          <Button
            color="red"
            variant="light"
            leftSection={<IconTrash size={16} />}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </Group>
      </Group>

      {/* Integration Overview Card */}
      <Paper withBorder p="lg" radius="md" mb="lg">
        <Group gap="lg" align="flex-start">
          {getProviderIcon()}
          
          <div style={{ flex: 1 }}>
            <Group justify="space-between" mb="sm">
              <div>
                <Title order={3} mb="xs">
                  {String(integration.metadata?.displayName || integration.provider?.name || 'Unnamed Integration')}
                </Title>
                <Group gap="sm" mb="xs">
                  <TokenStatusBadge
                    status={integration.status}
                    tokenHealth={tokenHealth}
                    size="sm"
                  />
                  <Badge variant="light" size="sm">
                    {integration.provider?.type}
                  </Badge>
                </Group>
              </div>
              
              <Switch
                checked={integration.isActive}
                onChange={(event) => {
                  const isActive = event.currentTarget.checked;
                  updateIntegration({
                    integrationId: integration.id,
                    data: { isActive },
                  });
                }}
                label={integration.isActive ? 'Active' : 'Inactive'}
                disabled={isUpdating}
              />
            </Group>
            
            {integration.metadata?.description ? (
              <Text c="dimmed" mb="sm">
                {String(integration.metadata.description)}
              </Text>
            ) : null}
            
            <Group gap="lg">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Created
                </Text>
                <Text size="sm">
                  {formatDistanceToNow(new Date(integration.createdAt))} ago
                </Text>
              </div>
              
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Last Updated
                </Text>
                <Text size="sm">
                  {formatDistanceToNow(new Date(integration.updatedAt))} ago
                </Text>
              </div>
              
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Provider
                </Text>
                <Text size="sm">
                  {integration.provider?.name}
                </Text>
              </div>
            </Group>
          </div>
        </Group>
      </Paper>

      {/* Token Health Card */}
      <Paper withBorder p="md" radius="md" mb="lg">
        <Group justify="space-between" mb="sm">
          <Text fw={500}>Token Health</Text>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {getHealthPercentage()}%
            </Text>
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => setShowTokenDetails(!showTokenDetails)}
            >
              {showTokenDetails ? <IconEyeOff size={14} /> : <IconEye size={14} />}
            </ActionIcon>
          </Group>
        </Group>
        
        <Progress
          value={getHealthPercentage()}
          size="md"
          color={
            getHealthPercentage() > 80 ? 'green' :
            getHealthPercentage() > 40 ? 'orange' : 'red'
          }
          mb="sm"
        />
        
        {tokenHealth && (
          <Group gap="md">
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Status
              </Text>
              <Text size="sm" tt="capitalize">
                {tokenHealth.status.replace('_', ' ')}
              </Text>
            </div>
            
            {tokenHealth.expiresAt && (
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Expires
                </Text>
                <Text size="sm">
                  {formatDistanceToNow(new Date(tokenHealth.expiresAt))}
                </Text>
              </div>
            )}
            
            {tokenHealth.lastRefreshed && (
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Last Refreshed
                </Text>
                <Text size="sm">
                  {formatDistanceToNow(new Date(tokenHealth.lastRefreshed))} ago
                </Text>
              </div>
            )}
          </Group>
        )}
        
        {showTokenDetails && tokenHealth && (
          <Stack gap="xs" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Token ID:</Text>
              <Group gap="xs">
                <Code>{integration.id.slice(0, 8)}...</Code>
                <CopyButton value={integration.id}>
                  {({ copied, copy }) => (
                    <ActionIcon size="xs" onClick={copy}>
                      <IconCopy size={12} />
                    </ActionIcon>
                  )}
                </CopyButton>
              </Group>
            </Group>
            
            {tokenHealth.scopes && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Scopes:</Text>
                <Text size="sm">{tokenHealth.scopes.join(', ')}</Text>
              </Group>
            )}
          </Stack>
        )}
      </Paper>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconInfoCircle size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
            Settings
          </Tabs.Tab>
          <Tabs.Tab value="activity" leftSection={<IconActivity size={16} />}>
            Activity
          </Tabs.Tab>
          <Tabs.Tab value="security" leftSection={<IconShield size={16} />}>
            Security
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {/* Connection Status */}
            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" mb="sm">
                <Text fw={500}>Connection Status</Text>
                <ActionIcon
                  size="sm"
                  variant="light"
                  onClick={handleTestConnection}
                  loading={isTesting}
                >
                  <IconTestPipe size={14} />
                </ActionIcon>
              </Group>
              
              {/* Connection test results would be displayed here */}
              <Text size="sm" c="dimmed">
                Connection testing functionality coming soon
              </Text>
            </Paper>

            {/* Provider Information */}
            <Paper withBorder p="md" radius="md">
              <Text fw={500} mb="sm">Provider Information</Text>
              
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Name:</Text>
                  <Text size="sm">{integration.provider?.name}</Text>
                </Group>
                
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Type:</Text>
                  <Text size="sm" tt="capitalize">{integration.provider?.type}</Text>
                </Group>
                
                {integration.provider?.description && (
                  <Group justify="space-between" align="flex-start">
                    <Text size="sm" c="dimmed">Description:</Text>
                    <Text size="sm" style={{ textAlign: 'right', maxWidth: '60%' }}>
                      {integration.provider.description}
                    </Text>
                  </Group>
                )}
                
                {integration.provider?.metadata?.supportUrl ? (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Support:</Text>
                    <Button
                      size="xs"
                      variant="subtle"
                      rightSection={<IconExternalLink size={12} />}
                      onClick={() => window.open(integration.provider?.metadata?.supportUrl as string, '_blank')}
                    >
                      Documentation
                    </Button>
                  </Group>
                ) : null}
              </Stack>
            </Paper>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="md">
          <Paper withBorder p="md" radius="md">
            {isEditing ? (
              <form onSubmit={form.onSubmit(handleSave)}>
                <Stack gap="md">
                  <TextInput
                    label="Display Name"
                    description="A friendly name for this integration"
                    {...form.getInputProps('displayName')}
                  />
                  
                  <Textarea
                    label="Description"
                    description="Optional description for this integration"
                    minRows={3}
                    {...form.getInputProps('description')}
                  />
                  
                  <Divider />
                  
                  <div>
                    <Text fw={500} mb="sm">Integration Settings</Text>
                    
                    <Stack gap="sm">
                      <Switch
                        label="Enable integration"
                        description="Integration will be active and accessible"
                        {...form.getInputProps('isActive', { type: 'checkbox' })}
                      />
                      
                      <Switch
                        label="Auto-refresh tokens"
                        description="Automatically refresh access tokens before they expire"
                        {...form.getInputProps('settings.autoRefresh', { type: 'checkbox' })}
                      />
                      
                      <Switch
                        label="Expiration notifications"
                        description="Receive notifications when tokens are about to expire"
                        {...form.getInputProps('settings.notifyOnExpiration', { type: 'checkbox' })}
                      />
                    </Stack>
                  </div>
                  
                  <Group justify="flex-end" gap="sm">
                    <Button
                      variant="subtle"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={isUpdating}
                    >
                      Save Changes
                    </Button>
                  </Group>
                </Stack>
              </form>
            ) : (
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Integration Settings</Text>
                  <Button
                    size="sm"
                    variant="light"
                    leftSection={<IconEdit size={14} />}
                    onClick={handleEdit}
                  >
                    Edit Settings
                  </Button>
                </Group>
                
                <Stack gap="sm">
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>Display Name</Text>
                      <Text size="xs" c="dimmed">Friendly name for this integration</Text>
                    </div>
                    <Text size="sm">
                      {String(integration.metadata?.displayName || 'Not set')}
                    </Text>
                  </Group>
                  
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text size="sm" fw={500}>Description</Text>
                      <Text size="xs" c="dimmed">Optional description</Text>
                    </div>
                    <Text size="sm" style={{ textAlign: 'right', maxWidth: '60%' }}>
                      {String(integration.metadata?.description || 'No description')}
                    </Text>
                  </Group>
                  
                  <Divider />
                  
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>Status</Text>
                      <Text size="xs" c="dimmed">Integration active state</Text>
                    </div>
                    <Badge color={integration.isActive ? 'green' : 'gray'}>
                      {integration.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Group>
                  
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>Auto-refresh</Text>
                      <Text size="xs" c="dimmed">Automatic token refresh</Text>
                    </div>
                    <Badge color={(integration.metadata as any)?.settings?.autoRefresh ? 'green' : 'gray'}>
                      {(integration.metadata as any)?.settings?.autoRefresh ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </Group>
                  
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>Notifications</Text>
                      <Text size="xs" c="dimmed">Expiration notifications</Text>
                    </div>
                    <Badge color={(integration.metadata as any)?.settings?.notifyOnExpiration ? 'green' : 'gray'}>
                      {(integration.metadata as any)?.settings?.notifyOnExpiration ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </Group>
                </Stack>
              </Stack>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="activity" pt="md">
          <Paper withBorder p="md" radius="md">
            <Text fw={500} mb="md">Recent Activity</Text>
            
            <Timeline active={-1} bulletSize={24} lineWidth={2}>
              <Timeline.Item
                bullet={<IconCheck size={12} />}
                title="Integration created"
                color="green"
              >
                <Text c="dimmed" size="sm">
                  {formatDistanceToNow(new Date(integration.createdAt))} ago
                </Text>
              </Timeline.Item>
              
              {integration.updatedAt !== integration.createdAt && (
                <Timeline.Item
                  bullet={<IconEdit size={12} />}
                  title="Settings updated"
                  color="blue"
                >
                  <Text c="dimmed" size="sm">
                    {formatDistanceToNow(new Date(integration.updatedAt))} ago
                  </Text>
                </Timeline.Item>
              )}
              
              {tokenHealth?.lastRefreshed && (
                <Timeline.Item
                  bullet={<IconRefresh size={12} />}
                  title="Token refreshed"
                  color="blue"
                >
                  <Text c="dimmed" size="sm">
                    {formatDistanceToNow(new Date(tokenHealth.lastRefreshed))} ago
                  </Text>
                </Timeline.Item>
              )}
              
              {/* Connection test results would be displayed here */}
            </Timeline>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="security" pt="md">
          <Stack gap="md">
            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" mb="sm">
                <Text fw={500}>OAuth Security</Text>
                <Badge color="green" variant="light">
                  PKCE Enabled
                </Badge>
              </Group>
              
              <Text size="sm" c="dimmed" mb="md">
                This integration uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) 
                for enhanced security. No passwords are stored on our servers.
              </Text>
              
              <List size="sm" spacing="xs">
                <List.Item icon={<IconCheck size={14} color="var(--mantine-color-green-6)" />}>
                  Secure token-based authentication
                </List.Item>
                <List.Item icon={<IconCheck size={14} color="var(--mantine-color-green-6)" />}>
                  PKCE protection against code interception
                </List.Item>
                <List.Item icon={<IconCheck size={14} color="var(--mantine-color-green-6)" />}>
                  State parameter CSRF protection
                </List.Item>
                <List.Item icon={<IconCheck size={14} color="var(--mantine-color-green-6)" />}>
                  Automatic token refresh
                </List.Item>
              </List>
            </Paper>
            
            <Paper withBorder p="md" radius="md">
              <Text fw={500} mb="sm">Permissions</Text>
              
              <Text size="sm" c="dimmed" mb="md">
                This integration has been granted the following permissions:
              </Text>
              
              <List size="sm" spacing="xs">
                {integration.provider?.scopes.map((scope, index) => (
                  <List.Item key={index} icon={<IconKey size={14} />}>
                    {getScopeDescription(scope)}
                  </List.Item>
                ))}
              </List>
            </Paper>
            
            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" mb="sm">
                <Text fw={500}>Token Management</Text>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconRefresh size={12} />}
                    onClick={handleRefreshToken}
                    loading={isRefreshing}
                  >
                    Refresh Token
                  </Button>
                </Group>
              </Group>
              
              <Text size="sm" c="dimmed" mb="md">
                Access tokens are automatically refreshed before expiration. 
                You can manually refresh if needed.
              </Text>
              
              {tokenHealth && (
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm">Current Status:</Text>
                    <TokenStatusBadge
                      status={integration.status}
                      tokenHealth={tokenHealth}
                      size="xs"
                    />
                  </Group>
                  
                  {tokenHealth.expiresAt && (
                    <Group justify="space-between">
                      <Text size="sm">Expires:</Text>
                      <Text size="sm">
                        {formatDistanceToNow(new Date(tokenHealth.expiresAt))}
                      </Text>
                    </Group>
                  )}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Integration"
        centered
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            <Text size="sm">
              This action cannot be undone. You will lose access to files and data 
              from this cloud provider until you reconnect.
            </Text>
          </Alert>
          
          <div>
            <Text size="sm" mb="xs">
              You are about to delete:
            </Text>
            <Paper withBorder p="sm" bg="gray.0">
              <Group gap="sm">
                {getProviderIcon()}
                <div>
                  <Text fw={500} size="sm">
                    {String(integration.metadata?.displayName || integration.provider?.name || 'Unnamed Integration')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {integration.provider?.type} • Created {formatDistanceToNow(new Date(integration.createdAt))} ago
                  </Text>
                </div>
              </Group>
            </Paper>
          </div>
          
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={isDeleting}
              leftSection={<IconTrash size={16} />}
            >
              Delete Integration
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );

  function getScopeDescription(scope: string): string {
    const descriptions: Record<string, string> = {
      'read': 'Read access to your files and folders',
      'write': 'Create and modify files and folders',
      'delete': 'Delete files and folders',
      'profile': 'Access to basic profile information',
      'email': 'Access to your email address',
      'offline_access': 'Access when you\'re not actively using the app',
    };
    
    return descriptions[scope] || `Access to ${scope}`;
  }
};

export default IntegrationDetailsPage;