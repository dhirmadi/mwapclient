import React, { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { 
  Button, 
  Paper, 
  Title, 
  Text, 
  Group, 
  Select, 
  TextInput, 
  Textarea, 
  Card, 
  Badge, 
  ActionIcon, 
  Modal, 
  LoadingOverlay,
  Tooltip,
  Alert,
  SimpleGrid,
  Stack,
  Divider,
  Box
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconPlus, 
  IconTrash, 
  IconEdit, 
  IconRefresh, 
  IconCheck, 
  IconX, 
  IconAlertCircle, 
  IconInfoCircle, 
  IconCloud,
  IconArrowLeft
} from '@tabler/icons-react';
import { PageHeader, Breadcrumbs } from '../../components/layout';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCloudProviders } from '../../hooks/useCloudProviders';
import { useTenants } from '../../hooks/useTenants';
import { 
  CloudProvider, 
  CloudProviderIntegration, 
  CloudProviderIntegrationCreate 
} from '../../types/cloud-provider';
import { LoadingSpinner, ErrorDisplay } from '../../components/common';
import api from '../../utils/api';
import { getOAuthRedirectUri, createOAuthState } from '../../utils/oauth';

const TenantIntegrations: React.FC = () => {
  const { roles } = useAuth();
  const { 
    cloudProviders, 
    isLoading: loadingProviders,
    createIntegration,
    deleteIntegration,
    isCreatingIntegration,
    isDeletingIntegration
  } = useCloudProviders();
  
  const { useTenant, useTenantIntegrations } = useTenants();
  const { data: tenant, isLoading: loadingTenant } = useTenant(roles?.tenantId);
  const { 
    data: tenantIntegrations, 
    isLoading: loadingIntegrations,
    refetch: refetchIntegrations,
    error: integrationsError
  } = useTenantIntegrations(roles?.tenantId);
  
  const [integrations, setIntegrations] = useState<CloudProviderIntegration[]>([]);
  const loading = loadingProviders || loadingTenant || loadingIntegrations;
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [refreshingToken, setRefreshingToken] = useState<string | null>(null);

  // Track which providers already have integrations
  const [usedProviderIds, setUsedProviderIds] = useState<string[]>([]);

  const form = useForm({
    initialValues: {
      providerId: '',
      status: 'active' as const,
      name: '',
      description: '',
      scopesGranted: [] as string[],
      metadata: {} as Record<string, unknown>,
    },
    validate: {
      providerId: (value) => (!value ? 'Please select a cloud provider' : null),
      name: (value) => (!value ? 'Please provide a name for this integration' : null),
      description: (value) => (!value ? 'Please provide a description for this integration' : null),
    },
  });

  // Process and merge data when integrations or providers change
  useEffect(() => {
    // Always set a default empty array if data is not available
    if (!cloudProviders) {
      setIntegrations([]);
      setUsedProviderIds([]);
      return;
    }
    
    // Ensure tenantIntegrations is an array
    const integrationsArray = Array.isArray(tenantIntegrations) 
      ? tenantIntegrations 
      : tenantIntegrations?.data && Array.isArray(tenantIntegrations.data) 
        ? tenantIntegrations.data 
        : [];
    
    console.log('Tenant integrations data:', tenantIntegrations);
    console.log('Cloud providers data:', cloudProviders);
    console.log('Processed integrations array:', integrationsArray);
    
    // Map integrations to include provider information
    const processedIntegrations = integrationsArray.map(integration => {
      const provider = Array.isArray(cloudProviders) 
        ? cloudProviders.find(p => p._id === integration.providerId)
        : undefined;
      return {
        ...integration,
        provider
      };
    });
    
    // Track which providers are already used
    const usedIds = integrationsArray.map(integration => integration.providerId);
    
    // Update state without comparison to avoid infinite loops
    setIntegrations(processedIntegrations);
    setUsedProviderIds(usedIds);
  }, [tenantIntegrations, cloudProviders]);
  
  // Update form fields when selected provider changes
  useEffect(() => {
    if (selectedProvider) {
      form.setFieldValue('providerId', selectedProvider._id);
      form.setFieldValue('scopesGranted', selectedProvider.scopes || []);
      form.setFieldValue('name', `${selectedProvider.name} Integration`);
      form.setFieldValue('description', `Integration with ${selectedProvider.name} for cloud storage access.`);
      
      
      // Set up metadata based on provider type
      const metadata: Record<string, unknown> = {
        providerName: selectedProvider.name,
        providerSlug: selectedProvider.slug,
        providerType: selectedProvider.slug,
        clientId: selectedProvider.clientId,
        grantType: selectedProvider.grantType || 'authorization_code'
      };
      
      form.setFieldValue('metadata', metadata);
    }
  }, [selectedProvider, form]);
  
  // Handle opening the add integration modal
  const handleAddIntegration = (provider: CloudProvider) => {
    if (provider.authUrl && provider.tokenUrl) {
      // For OAuth providers, initiate OAuth flow
      initiateOAuthFlow(provider);
    } else {
      // For non-OAuth providers, open the modal
      setSelectedProvider(provider);
      setModalOpen(true);
      setTestResult(null);
    }
  };
  
  // Initiate OAuth flow - simplified implementation
  const initiateOAuthFlow = async (provider: CloudProvider) => {
    if (!roles?.tenantId) {
      setTimeout(() => {
        notifications.show({
          title: 'Error',
          message: 'Tenant ID is required to initiate OAuth flow',
          color: 'red',
          autoClose: 5000
        });
      }, 100);
      return;
    }
    
    try {
      // Create the integration entry with minimal required fields
      const integrationData: CloudProviderIntegrationCreate = {
        providerId: provider._id,
        // Use 'active' as the default status per API docs
        metadata: {
          providerName: provider.name,
          providerSlug: provider.slug,
          displayName: `${provider.name} Integration`,
          description: `Integration with ${provider.name} for cloud storage access.`
        }
      };
      
      console.log('Creating integration with data:', integrationData);
      const integration = await api.createTenantIntegration(roles.tenantId, integrationData);
      console.log('Integration created:', integration);
      
      // Check if the integration has an _id property
      if (!integration._id) {
        console.error('Integration response is missing _id property:', integration);
        throw new Error('Integration response is missing _id property');
      }
      
      console.log('Integration ID for OAuth state:', integration._id);
      
      // Create state parameter with tenant and integration info
      const state = createOAuthState(roles.tenantId, integration._id);
      
      // Build OAuth URL
      const authUrl = new URL(provider.authUrl);
      
      // Add required OAuth parameters
      authUrl.searchParams.append('client_id', provider.clientId);
      authUrl.searchParams.append('response_type', 'code');
      
      // Use the configured redirect URI
      const redirectUri = getOAuthRedirectUri();
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('state', state);
      
      // Add scopes if available
      if (provider.scopes && provider.scopes.length > 0) {
        authUrl.searchParams.append('scope', provider.scopes.join(' '));
      }
      
      // Redirect to OAuth provider
      window.location.href = authUrl.toString();
    } catch (error: any) {
      console.error('Failed to initiate OAuth flow:', error);
      
      setTimeout(() => {
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to initiate OAuth authentication. Please try again.',
          color: 'red',
          autoClose: 5000
        });
      }, 100);
    }
  };
  
  // Test the integration connection
  const handleTestConnection = async () => {
    if (!form.validate().hasErrors) {
      setTestingConnection(true);
      setTestResult(null);
      
      try {
        // Simulate testing the connection
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real implementation, you would call an API endpoint to test the connection
        // const response = await api.testIntegrationConnection({
        //   providerId: form.values.cloudProviderId,
        //   credentials: form.values.credentials
        // });
        
        // For now, we'll simulate success based on having valid name and description
        if (form.values.name && form.values.description) {
          setTestResult('success');
          
          setTimeout(() => {
            notifications.show({
              title: 'Validation Successful',
              color: 'green',
              message: 'The integration information is valid',
              autoClose: 3000
            });
          }, 100);
        } else {
          setTestResult('error');
          
          setTimeout(() => {
            notifications.show({
              title: 'Validation Failed',
              message: 'Please provide a name and description for the integration',
              color: 'red',
              autoClose: 5000
            });
          }, 100);
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        setTestResult('error');
        
        setTimeout(() => {
          notifications.show({
            title: 'Connection Test Failed',
            message: 'The integration credentials are invalid or the service is unavailable',
            color: 'red',
            autoClose: 5000
          });
        }, 100);
      } finally {
        setTestingConnection(false);
      }
    }
  };
  
  // Save the integration
  const handleSaveIntegration = async () => {
    if (!form.validate().hasErrors && roles?.tenantId) {
      setSaving(true);
      
      try {
        // First check if an integration already exists for this provider
        const exists = await api.checkIntegrationExists(roles.tenantId, form.values.providerId);
        if (exists) {
          setTimeout(() => {
            notifications.show({
              title: 'Integration Exists',
              message: 'An integration for this provider already exists.',
              color: 'yellow',
              autoClose: 5000
            });
          }, 100);
          setSaving(false);
          return;
        }
        
        // Create the integration with minimal required fields
        await createIntegration({
          tenantId: roles.tenantId,
          data: {
            providerId: form.values.providerId,
            metadata: {
              // Only include the required metadata fields
              providerName: selectedProvider?.name || 'Custom Provider',
              providerSlug: selectedProvider?.slug || 'custom',
              displayName: form.values.name || `Integration (${new Date().toLocaleDateString()})`,
              description: form.values.description || 'Manually created integration'
            }
          }
        });
        
        // Close the modal and reset form
        setModalOpen(false);
        form.reset();
        setSelectedProvider(null);
        
        // Refresh the integrations list
        await refetchIntegrations();
        
        setTimeout(() => {
          notifications.show({
            title: 'Integration Added',
            message: 'The cloud integration has been successfully added',
            color: 'green',
            autoClose: 3000
          });
        }, 100);
      } catch (error: any) {
        console.error('Failed to save integration:', error);
        
        // Handle specific error for duplicate integrations
        if (error.message && error.message.includes('already exists')) {
          setTimeout(() => {
            notifications.show({
              title: 'Duplicate Integration',
              message: 'An integration for this provider already exists.',
              color: 'yellow',
              autoClose: 5000
            });
          }, 100);
        } else {
          setTimeout(() => {
            notifications.show({
              title: 'Error',
              message: error.message || 'Failed to add the integration. Please try again.',
              color: 'red',
              autoClose: 5000
            });
          }, 100);
        }
      } finally {
        setSaving(false);
      }
    }
  };
  
  // Delete an integration
  const handleDeleteIntegration = async (integrationId: string) => {
    if (roles?.tenantId) {
      try {
        await deleteIntegration({
          tenantId: roles.tenantId,
          integrationId
        });
        
        // Refresh the integrations list
        await refetchIntegrations();
        
        // Use setTimeout to ensure the notification is shown after the state is updated
        setTimeout(() => {
          notifications.show({
            title: 'Integration Removed',
            message: 'The cloud integration has been successfully removed',
            color: 'green',
            autoClose: 3000
          });
        }, 100);
      } catch (error) {
        console.error('Failed to delete integration:', error);
        
        // Use setTimeout to ensure the notification is shown after the state is updated
        setTimeout(() => {
          notifications.show({
            title: 'Error',
            message: 'Failed to remove the integration. Please try again.',
            color: 'red',
            autoClose: 5000
          });
        }, 100);
      }
    }
  };
  
  // Refresh an integration token
  const handleRefreshToken = async (integrationId: string) => {
    if (roles?.tenantId) {
      setRefreshingToken(integrationId);
      
      try {
        // Use the dedicated token refresh endpoint
        await api.refreshIntegrationToken(roles.tenantId, integrationId);
        
        // Refresh the integrations list
        await refetchIntegrations();
        
        // Use setTimeout to ensure the notification is shown after the state is updated
        setTimeout(() => {
          notifications.show({
            title: 'Token Refreshed',
            message: 'The integration token has been successfully refreshed',
            color: 'green',
            autoClose: 3000
          });
        }, 100);
      } catch (error: any) {
        console.error('Failed to refresh token:', error);
        
        // Use setTimeout to ensure the notification is shown after the state is updated
        setTimeout(() => {
          notifications.show({
            title: 'Error',
            message: error.message || 'Failed to refresh the integration token. Please try again.',
            color: 'red',
            autoClose: 5000
          });
        }, 100);
      } finally {
        setRefreshingToken(null);
      }
    }
  };

  // Open modal with a specific provider
  const openAddIntegrationModal = () => {
    // If there are available providers (not already used), select the first one
    if (Array.isArray(cloudProviders) && cloudProviders.length > 0) {
      const availableProviders = cloudProviders.filter(
        provider => !usedProviderIds.includes(provider._id)
      );
      
      if (availableProviders.length > 0) {
        // If there's only one available provider, use it directly
        if (availableProviders.length === 1) {
          handleAddIntegration(availableProviders[0]);
        } else {
          // If there are multiple providers, open a selection modal
          setModalOpen(true);
          // Don't set a selected provider yet - user will choose
        }
      } else {
        setTimeout(() => {
          notifications.show({
            title: 'No Available Providers',
            message: 'All cloud providers are already integrated with this tenant.',
            color: 'yellow',
            autoClose: 5000
          });
        }, 100);
      }
    }
  };

  // Render the UI
  return (
    <div>
      <Breadcrumbs 
        items={[
          { title: 'Dashboard', href: '/' },
          { title: 'Cloud Integrations' }
        ]}
      />
      
      <Group mb="md">
        <Button 
          component={Link} 
          to="/" 
          variant="subtle" 
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Dashboard
        </Button>
      </Group>
      
      <PageHeader 
        title="Cloud Integrations" 
        description="Manage cloud storage integrations for your tenant"
      >
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={openAddIntegrationModal}
          disabled={loading || !cloudProviders || (Array.isArray(cloudProviders) && cloudProviders.length === 0)}
        >
          Add Integration
        </Button>
      </PageHeader>
      
      <Paper shadow="sm" p="md" mb="xl">
        <Text mb="md">
          Connect your tenant to cloud storage providers to enable file storage for your projects.
          Each cloud provider can have one integration per tenant.
        </Text>
        
        {integrationsError && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error loading integrations" 
            color="red" 
            mb="md"
          >
            {integrationsError.message || 'Failed to load integrations. Please try again.'}
          </Alert>
        )}
        
        {loading ? (
          <LoadingSpinner text="Loading cloud integrations..." />
        ) : (
          <>
            {/* Current Integrations */}
            <Title order={3} mb="md">Current Integrations</Title>
            
            {!Array.isArray(integrations) || integrations.length === 0 ? (
              <Alert 
                icon={<IconInfoCircle size={16} />} 
                title="No integrations" 
                color="blue" 
                mb="xl"
              >
                You haven't set up any cloud integrations yet. Add an integration below to get started.
              </Alert>
            ) : (
              <SimpleGrid cols={2} spacing="md" mb="xl" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                {integrations.map(integration => (
                  <Card key={integration._id} shadow="sm" p="md" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Text weight={500}>
                        {integration.provider?.name || integration.metadata?.providerName || 'Cloud'} Integration
                      </Text>
                      <Badge 
                        color={
                          integration.status === 'active' ? 'green' : 
                          integration.status === 'error' ? 'red' : 
                          integration.status === 'expired' ? 'orange' :
                          integration.status === 'revoked' ? 'red' : 'gray'
                        }
                      >
                        {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                      </Badge>
                    </Group>
                    
                    <Text size="sm" color="dimmed" mb="md">
                      Provider: {integration.provider?.name || integration.metadata?.providerName || 'Unknown'}
                    </Text>
                    
                    {integration.tokenExpiresAt && (
                      <Text size="sm" color={
                        new Date(integration.tokenExpiresAt) < new Date() ? 'red' : 'dimmed'
                      } mb="xs">
                        Token expires: {new Date(integration.tokenExpiresAt).toLocaleString()}
                      </Text>
                    )}
                    
                    <Text size="sm" mb="md">
                      Connected on {integration.connectedAt ? 
                        new Date(integration.connectedAt).toLocaleDateString() : 
                        integration.createdAt ? 
                          new Date(integration.createdAt).toLocaleDateString() : 
                          'Unknown date'
                      }
                    </Text>
                    
                    <Group justify="flex-end" spacing="xs">
                      <Tooltip label="Refresh Token">
                        <ActionIcon 
                          color="blue" 
                          onClick={() => handleRefreshToken(integration._id)}
                          loading={refreshingToken === integration._id}
                        >
                          <IconRefresh size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete Integration">
                        <ActionIcon 
                          color="red" 
                          onClick={() => handleDeleteIntegration(integration._id)}
                          loading={isDeletingIntegration}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Card>
                ))}
              </SimpleGrid>
            )}
            
            {/* Available Cloud Providers */}
            <Title order={3} mb="md">Available Cloud Providers</Title>
            
            {!cloudProviders || (Array.isArray(cloudProviders) && cloudProviders.length === 0) ? (
              <Alert 
                icon={<IconInfoCircle size={16} />} 
                title="No cloud providers" 
                color="yellow" 
                mb="md"
              >
                No cloud providers are available. Please contact your administrator.
              </Alert>
            ) : (
              <SimpleGrid cols={3} spacing="md" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                {Array.isArray(cloudProviders) ? cloudProviders.map(provider => {
                  const isUsed = Array.isArray(usedProviderIds) && usedProviderIds.includes(provider._id);
                  
                  return (
                    <Card key={provider._id} shadow="sm" p="md" radius="md" withBorder>
                      <Group justify="space-between" mb="xs">
                        <Text weight={500}>{provider.name}</Text>
                        {isUsed && <Badge color="green">Connected</Badge>}
                      </Group>
                      
                      <Text size="sm" color="dimmed" mb="xs">
                        Type: {provider.slug}
                      </Text>
                      
                      <Text size="sm" color="dimmed" mb="xs">
                        OAuth Grant Type: {provider.grantType || "authorization_code"}
                      </Text>
                      
                      <Text size="sm" color="dimmed" mb="md">
                        Scopes: {provider.scopes.join(', ')}
                      </Text>
                      
                      <Button 
                        fullWidth 
                        variant={isUsed ? "outline" : "filled"} 
                        color={isUsed ? "gray" : "blue"}
                        leftSection={isUsed ? <IconCheck size={16} /> : <IconPlus size={16} />}
                        onClick={() => !isUsed && handleAddIntegration(provider)}
                        disabled={isUsed}
                      >
                        {isUsed ? 'Already Connected' : 'Add Integration'}
                      </Button>
                    </Card>
                  );
                }) : null}
              </SimpleGrid>
            )}
          </>
        )}
      </Paper>
      
      {/* Add Integration Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedProvider ? `Add ${selectedProvider.name} Integration` : 'Select Cloud Provider'}
        size="lg"
      >
        <LoadingOverlay visible={saving} />
        
        {!selectedProvider ? (
          // Provider selection UI
          <Stack spacing="md">
            <Text>
              Select a cloud provider to integrate with your tenant:
            </Text>
            
            <SimpleGrid cols={2} spacing="md" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
              {Array.isArray(cloudProviders) && cloudProviders
                .filter(provider => !usedProviderIds.includes(provider._id))
                .map(provider => (
                  <Card 
                    key={provider._id} 
                    shadow="sm" 
                    p="md" 
                    radius="md" 
                    withBorder
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleAddIntegration(provider)}
                  >
                    <Group justify="space-between" mb="xs">
                      <Text weight={500}>{provider.name}</Text>
                      <Badge color="blue">{provider.slug}</Badge>
                    </Group>
                    
                    <Text size="sm" color="dimmed" mb="md">
                      {provider.authUrl && provider.tokenUrl 
                        ? 'OAuth Authentication' 
                        : 'Manual Authentication'}
                    </Text>
                    
                    <Button 
                      fullWidth 
                      variant="light"
                      leftSection={<IconPlus size={16} />}
                    >
                      Select Provider
                    </Button>
                  </Card>
                ))
              }
            </SimpleGrid>
          </Stack>
        ) : (
          // Integration form
          <form onSubmit={form.onSubmit(handleSaveIntegration)}>
            <Stack spacing="md">
              <Text>
                You are about to create an integration with <strong>{selectedProvider.name}</strong>.
              </Text>
              
              <Alert icon={<IconInfoCircle size={16} />} color="blue">
                This integration will allow your tenant to connect to {selectedProvider.name} 
                for cloud storage access. The following scopes will be requested:
                <ul>
                  {selectedProvider.scopes.map(scope => (
                    <li key={scope}>{scope}</li>
                  ))}
                </ul>
              </Alert>
              
              <Divider my="md" label="OAuth Information" labelPosition="center" />
              
              <TextInput
                label="Client ID"
                placeholder="Enter the OAuth client ID"
                readOnly
                value={selectedProvider.clientId}
              />
              
              <TextInput
                label="Client Secret"
                placeholder="OAuth client secret"
                readOnly
                value="••••••••••••••••" // Masked for security
              />
              
              <TextInput
                label="Authorization URL"
                placeholder="OAuth authorization URL"
                readOnly
                value={selectedProvider.authUrl}
              />
              
              <TextInput
                label="Token URL"
                placeholder="OAuth token URL"
                readOnly
                value={selectedProvider.tokenUrl}
              />
              
              <TextInput
                label="Grant Type"
                placeholder="OAuth grant type"
                readOnly
                value={selectedProvider.grantType || 'authorization_code'}
              />
              
              <TextInput
                label="Integration Name"
                placeholder="Enter a name for this integration"
                required
                {...form.getInputProps('name')}
              />
              
              <Textarea
                label="Description"
                placeholder="Enter a description for this integration"
                required
                {...form.getInputProps('description')}
              />
              
              {testResult === 'success' && (
                <Alert icon={<IconCheck size={16} />} title="Validation Successful" color="green">
                  The integration information is valid. You can now save this integration.
                </Alert>
              )}
              
              {testResult === 'error' && (
                <Alert icon={<IconX size={16} />} title="Validation Failed" color="red">
                  Please provide a valid name and description for this integration.
                </Alert>
              )}
              
              <Group justify="space-between" mt="md">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  loading={testingConnection}
                  disabled={saving}
                >
                  Validate Information
                </Button>
                
                <Group spacing="xs">
                  <Button variant="subtle" onClick={() => setModalOpen(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={saving} disabled={testingConnection}>
                    Save Integration
                  </Button>
                </Group>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default TenantIntegrations;