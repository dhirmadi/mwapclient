import React, { useState } from 'react';
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
  IconExternalLink
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useTenants } from '../hooks/useTenants';
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
  const [integrationToDelete, setIntegrationToDelete] = useState<CloudProviderIntegration | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { 
    currentTenant, 
    isLoadingCurrentTenant,
    getTenantIntegrations,
    updateTenantIntegration,
    refreshIntegrationToken,
    isUpdatingIntegration,
    isRefreshingToken,
    updateIntegrationError,
    refreshTokenError
  } = useTenants();

  const { cloudProviders, isLoading: isLoadingProviders } = useCloudProviders();

  // Get tenant integrations
  const { 
    data: integrations, 
    isLoading: isLoadingIntegrations, 
    error: integrationsError 
  } = getTenantIntegrations(currentTenant?.id);

  // Form for creating new integration
  const createForm = useForm({
    initialValues: {
      providerId: '',
      clientId: '',
      clientSecret: '',
      scopes: '',
    },
    validate: {
      providerId: (value) => (!value ? 'Please select a cloud provider' : null),
      clientId: (value) => (!value ? 'Client ID is required' : null),
      clientSecret: (value) => (!value ? 'Client Secret is required' : null),
    },
  });

  const handleCreateIntegration = async (values: typeof createForm.values) => {
    if (!currentTenant) return;
    
    try {
      // This would typically create a new integration
      // For now, we'll just close the modal
      console.log('Creating integration:', values);
      setShowCreateModal(false);
      createForm.reset();
    } catch (error) {
      console.error('Failed to create integration:', error);
    }
  };

  const handleDeleteClick = (integration: CloudProviderIntegration) => {
    setIntegrationToDelete(integration);
  };

  const handleDeleteConfirm = async () => {
    if (integrationToDelete && currentTenant) {
      try {
        // This would typically delete the integration
        console.log('Deleting integration:', integrationToDelete.id);
        setIntegrationToDelete(null);
      } catch (error) {
        console.error('Failed to delete integration:', error);
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
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  };

  const handleToggleActive = async (integration: CloudProviderIntegration) => {
    if (!currentTenant) return;
    
    try {
      await updateTenantIntegration({
        tenantId: currentTenant.id,
        integrationId: integration.id,
        data: { isActive: !integration.isActive }
      });
    } catch (error) {
      console.error('Failed to toggle integration status:', error);
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

      {(integrationsError || updateIntegrationError || refreshTokenError) && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
          mb="md"
        >
          {integrationsError instanceof Error ? integrationsError.message : 
           updateIntegrationError instanceof Error ? updateIntegrationError.message :
           refreshTokenError instanceof Error ? refreshTokenError.message :
           'An error occurred'}
        </Alert>
      )}

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isUpdatingIntegration || isRefreshingToken} />
        
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
                      color={integration.isActive ? 'green' : 'gray'} 
                      variant="light"
                    >
                      {integration.isActive ? 'Active' : 'Inactive'}
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
                      <Tooltip label={integration.isActive ? "Deactivate" : "Activate"}>
                        <ActionIcon
                          variant="subtle"
                          color={integration.isActive ? "orange" : "green"}
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
              title="OAuth Setup Required" 
              color="blue"
            >
              You'll need to configure OAuth credentials in your cloud provider's developer console first.
            </Alert>

            <Select
              label="Cloud Provider"
              placeholder="Select a cloud provider"
              data={cloudProviders?.map((provider: any) => ({
                value: provider.id,
                label: `${provider.name} (${provider.type})`
              })) || []}
              {...createForm.getInputProps('providerId')}
            />

            <TextInput
              label="Client ID"
              placeholder="Enter OAuth client ID"
              {...createForm.getInputProps('clientId')}
            />

            <PasswordInput
              label="Client Secret"
              placeholder="Enter OAuth client secret"
              {...createForm.getInputProps('clientSecret')}
            />

            <Textarea
              label="Scopes (Optional)"
              placeholder="Enter OAuth scopes, one per line"
              minRows={3}
              {...createForm.getInputProps('scopes')}
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
                leftSection={<IconPlus size={16} />}
              >
                Create Integration
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