import React, { useState, useEffect } from 'react';
import { 
  Title, 
  Text, 
  Paper, 
  Button, 
  Group, 
  Table, 
  Badge, 
  ActionIcon, 
  Tooltip, 
  LoadingOverlay,
  Alert,
  Modal,
  Stack,
  Skeleton,
  Select,
  TextInput,
  PasswordInput,
  Textarea
} from '@mantine/core';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconRefresh,
  IconAlertCircle,
  IconCloud,
  IconKey,
  IconInfoCircle,
  IconCheck,
  IconX,
  IconExternalLink
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useSearchParams } from 'react-router-dom';
import { useTenants } from '../hooks/useTenants';
import { CloudProviderIntegrationCreate } from '../../cloud-providers/types';
import { buildOAuthUrl, getOAuthCallbackUri } from '../../../shared/utils/oauth';
import { useCloudProviders } from '../../cloud-providers/hooks/useCloudProviders';

interface CloudProviderIntegration {
  id: string;
  tenantId: string;
  providerId: string;
  provider?: {
    id: string;
    name: string;
    type: string;
  };
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  scopesGranted?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const TenantIntegrationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [integrationToDelete, setIntegrationToDelete] = useState<CloudProviderIntegration | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { 
    currentTenant, 
    isLoadingCurrentTenant,
    getTenantIntegrations,
    createTenantIntegration,
    updateTenantIntegration,
    deleteTenantIntegration,
    refreshIntegrationToken,
    isCreatingIntegration,
    isUpdatingIntegration,
    isDeletingIntegration,
    isRefreshingToken,
    createIntegrationError,
    updateIntegrationError,
    deleteIntegrationError,
    refreshTokenError
  } = useTenants();

  const { cloudProviders, isLoading: isLoadingProviders } = useCloudProviders();

  // Get tenant integrations
  const { 
    data: integrations, 
    isLoading: isLoadingIntegrations, 
    error: integrationsError 
  } = getTenantIntegrations(currentTenant?.id);

  // Handle OAuth callback notifications
  useEffect(() => {
    const oauthStatus = searchParams.get('oauth');
    const error = searchParams.get('error');
    
    if (oauthStatus === 'success') {
      notifications.show({
        title: 'Integration Successful',
        message: 'Your cloud provider has been connected successfully!',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } else if (oauthStatus === 'error') {
      notifications.show({
        title: 'Integration Failed',
        message: error || 'Failed to connect cloud provider',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  }, [searchParams]);

  // Form for creating new integration
  const createForm = useForm({
    initialValues: {
      providerId: '',
      metadata: {
        displayName: ''
      }
    },
    validate: {
      providerId: (value) => (!value ? 'Please select a cloud provider' : null),
      'metadata.displayName': (value) => (!value ? 'Display name is required' : null),
    },
  });

  const handleCreateIntegration = async (values: typeof createForm.values) => {
    if (!currentTenant) return;
    
    try {
      // Find the selected cloud provider
      const selectedProvider = cloudProviders?.find(p => p.id === values.providerId);
      if (!selectedProvider) {
        notifications.show({
          title: 'Error',
          message: 'Selected cloud provider not found',
          color: 'red',
          icon: <IconX size={16} />,
        });
        return;
      }

      // Create the integration first
      const integrationData: CloudProviderIntegrationCreate = {
        providerId: values.providerId,
        status: 'active',
        metadata: values.metadata
      };

      const newIntegration = await createTenantIntegration({
        tenantId: currentTenant.id,
        data: integrationData
      });

      // Build OAuth URL and redirect
      const oauthUrl = buildOAuthUrl(
        selectedProvider,
        newIntegration,
        getOAuthCallbackUri()
      );

      // Close modal and redirect to OAuth
      setShowCreateModal(false);
      createForm.reset();
      
      notifications.show({
        title: 'Redirecting to OAuth',
        message: 'You will be redirected to authorize the integration',
        color: 'blue',
        icon: <IconInfoCircle size={16} />,
      });

      // Redirect to OAuth authorization
      window.location.href = oauthUrl;

    } catch (error) {
      console.error('Failed to create integration:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create integration',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleDeleteClick = (integration: CloudProviderIntegration) => {
    setIntegrationToDelete(integration);
  };

  const handleDeleteConfirm = async () => {
    if (integrationToDelete && currentTenant) {
      try {
        await deleteTenantIntegration({
          tenantId: currentTenant.id,
          integrationId: integrationToDelete.id
        });
        
        notifications.show({
          title: 'Integration Deleted',
          message: 'Cloud provider integration has been removed successfully',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        
        setIntegrationToDelete(null);
      } catch (error) {
        console.error('Failed to delete integration:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete integration',
          color: 'red',
          icon: <IconX size={16} />,
        });
      }
    }
  };

  const handleRefreshToken = async (integration: CloudProviderIntegration) => {
    if (!currentTenant) return;
    
    try {
      await refreshIntegrationToken({
        tenantId: currentTenant.id,
        integrationId: integration.id
      });
      
      notifications.show({
        title: 'Token Refreshed',
        message: 'OAuth token has been refreshed successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Failed to refresh token:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to refresh OAuth token',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleToggleActive = async (integration: CloudProviderIntegration) => {
    if (!currentTenant) return;
    
    try {
      const newStatus = integration.status === 'active' ? 'revoked' : 'active';
      await updateTenantIntegration({
        tenantId: currentTenant.id,
        integrationId: integration.id,
        data: { status: newStatus }
      });
      
      notifications.show({
        title: 'Integration Updated',
        message: `Integration has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Failed to toggle integration status:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update integration status',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  // Loading state
  if (isLoadingCurrentTenant || isLoadingIntegrations) {
    return (
      <div>
        <Group justify="space-between" mb="md">
          <div>
            <Skeleton height={32} width={200} mb="xs" />
            <Skeleton height={20} width={300} />
          </div>
          <Skeleton height={36} width={150} />
        </Group>

        <Paper withBorder p="md" radius="md">
          <Skeleton height={24} width={150} mb="md" />
          <Stack gap="sm">
            {[...Array(3)].map((_, i) => (
              <Group key={i} justify="space-between">
                <Skeleton height={20} width="60%" />
                <Skeleton height={20} width={100} />
              </Group>
            ))}
          </Stack>
        </Paper>
      </div>
    );
  }

  // Error state
  if (!currentTenant) {
    return (
      <div>
        <Title order={2} mb="md">Cloud Provider Integrations</Title>
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
        >
          Unable to load tenant information
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Cloud Provider Integrations</Title>
          <Text c="dimmed">Manage your cloud storage connections</Text>
        </div>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={() => setShowCreateModal(true)}
        >
          Add Integration
        </Button>
      </Group>

      {(integrationsError || createIntegrationError || updateIntegrationError || deleteIntegrationError || refreshTokenError) && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
          mb="md"
        >
          {integrationsError instanceof Error ? integrationsError.message : 
           createIntegrationError instanceof Error ? createIntegrationError.message :
           updateIntegrationError instanceof Error ? updateIntegrationError.message :
           deleteIntegrationError instanceof Error ? deleteIntegrationError.message :
           refreshTokenError instanceof Error ? refreshTokenError.message :
           'An error occurred'}
        </Alert>
      )}

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isCreatingIntegration || isUpdatingIntegration || isDeletingIntegration || isRefreshingToken} />
        
        <Title order={3} mb="md">
          Active Integrations {integrations && ` (${integrations.length})`}
        </Title>

        {integrations && integrations.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Provider</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Token Status</Table.Th>
                <Table.Th>Scopes</Table.Th>
                <Table.Th>Last Updated</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {integrations.map((integration: CloudProviderIntegration) => (
                <Table.Tr key={integration.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <IconCloud size={20} />
                      <div>
                        <Text fw={500}>
                          {integration.provider?.name || 'Unknown Provider'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {integration.provider?.type}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      color={integration.status === 'active' ? 'green' : 
                             integration.status === 'expired' ? 'yellow' :
                             integration.status === 'error' ? 'red' : 'gray'} 
                      variant="light"
                    >
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {integration.tokenExpiresAt ? (
                      <div>
                        <Badge 
                          color={new Date(integration.tokenExpiresAt) > new Date() ? 'green' : 'red'}
                          variant="light"
                          size="sm"
                        >
                          {new Date(integration.tokenExpiresAt) > new Date() ? 'Valid' : 'Expired'}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          Expires: {new Date(integration.tokenExpiresAt).toLocaleDateString()}
                        </Text>
                      </div>
                    ) : (
                      <Badge color="gray" variant="light" size="sm">
                        No Token
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {integration.scopesGranted && integration.scopesGranted.length > 0 ? (
                      <Stack gap="xs">
                        {integration.scopesGranted.slice(0, 2).map((scope: string) => (
                          <Badge key={scope} size="xs" variant="outline">
                            {scope}
                          </Badge>
                        ))}
                        {integration.scopesGranted.length > 2 && (
                          <Text size="xs" c="dimmed">
                            +{integration.scopesGranted.length - 2} more
                          </Text>
                        )}
                      </Stack>
                    ) : (
                      <Text size="sm" c="dimmed">No scopes</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(integration.updatedAt).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Refresh Token">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleRefreshToken(integration)}
                          disabled={!integration.refreshToken}
                        >
                          <IconRefresh size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={integration.status === 'active' ? "Deactivate" : "Activate"}>
                        <ActionIcon
                          variant="subtle"
                          color={integration.status === 'active' ? "orange" : "green"}
                          onClick={() => handleToggleActive(integration)}
                        >
                          <IconKey size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete Integration">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteClick(integration)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <IconCloud size={48} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed" mt="md">
              No cloud provider integrations configured
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              Connect to cloud storage providers to enable file management
            </Text>
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={() => setShowCreateModal(true)}
            >
              Add Your First Integration
            </Button>
          </div>
        )}
      </Paper>

      {/* Create Integration Modal */}
      <Modal
        opened={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Cloud Provider Integration"
        size="md"
      >
        <form onSubmit={createForm.onSubmit(handleCreateIntegration)}>
          <Stack gap="md">
            <Alert 
              icon={<IconInfoCircle size={16} />} 
              title="OAuth Integration" 
              color="blue"
            >
              After selecting a provider, you'll be redirected to authorize the integration with your cloud provider account.
            </Alert>

            <Select
              label="Cloud Provider"
              placeholder="Select a cloud provider"
              data={cloudProviders?.map((provider: any) => ({
                value: provider.id,
                label: `${provider.name}`
              })) || []}
              {...createForm.getInputProps('providerId')}
            />

            <TextInput
              label="Display Name"
              placeholder="Enter a name for this integration"
              description="This name will help you identify this integration"
              {...createForm.getInputProps('metadata.displayName')}
            />

            <Group justify="flex-end" mt="md">
              <Button 
                variant="default" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                leftSection={<IconExternalLink size={16} />}
                loading={isCreatingIntegration}
              >
                Connect Provider
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!integrationToDelete}
        onClose={() => setIntegrationToDelete(null)}
        title="Delete Integration"
        centered
      >
        <Stack gap="md">
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Warning" 
            color="red"
          >
            This action cannot be undone. Deleting this integration will:
          </Alert>
          
          <Stack gap="xs" ml="md">
            <Text size="sm">• Remove access to cloud storage files</Text>
            <Text size="sm">• Disable file synchronization</Text>
            <Text size="sm">• Revoke all OAuth tokens</Text>
          </Stack>

          {integrationToDelete && (
            <Paper withBorder p="sm" bg="gray.0">
              <Text size="sm">
                <strong>Provider:</strong> {integrationToDelete.provider?.name}
              </Text>
              <Text size="sm" c="dimmed">
                <strong>Type:</strong> {integrationToDelete.provider?.type}
              </Text>
            </Paper>
          )}

          <Group justify="flex-end" mt="md">
            <Button 
              variant="default" 
              onClick={() => setIntegrationToDelete(null)}
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={handleDeleteConfirm}
            >
              Delete Integration
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default TenantIntegrationsPage;