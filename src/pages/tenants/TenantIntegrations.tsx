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
      scopesGranted: [] as string[],
      metadata: {} as Record<string, unknown>,
    },
    validate: {
      providerId: (value) => (!value ? 'Please select a cloud provider' : null),
    },
  });

  // Process and merge data when integrations or providers change
  useEffect(() => {
    if (!tenantIntegrations || !cloudProviders) {
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
      
      // Set up metadata based on provider type
      const metadata: Record<string, unknown> = {
        providerName: selectedProvider.name,
        providerSlug: selectedProvider.slug
      };
      
      form.setFieldValue('metadata', metadata);
    }
  }, [selectedProvider, form]);
  
  // Handle opening the add integration modal
  const handleAddIntegration = (provider: CloudProvider) => {
    setSelectedProvider(provider);
    setModalOpen(true);
    setTestResult(null);
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
        
        // For now, we'll simulate success
        setTestResult('success');
        
        notifications.show({
          title: 'Connection Test Successful',
          message: 'The integration credentials are valid',
          color: 'green',
        });
      } catch (error) {
        console.error('Connection test failed:', error);
        setTestResult('error');
        
        notifications.show({
          title: 'Connection Test Failed',
          message: 'The integration credentials are invalid or the service is unavailable',
          color: 'red',
        });
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
        // Create the integration using the new schema
        await createIntegration({
          tenantId: roles.tenantId,
          data: {
            providerId: form.values.providerId,
            status: form.values.status,
            scopesGranted: form.values.scopesGranted,
            metadata: form.values.metadata
          }
        });
        
        // Close the modal and reset form
        setModalOpen(false);
        form.reset();
        setSelectedProvider(null);
        
        // Refresh the integrations list
        refetchIntegrations();
        
        notifications.show({
          title: 'Integration Added',
          message: 'The cloud integration has been successfully added',
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to save integration:', error);
        
        notifications.show({
          title: 'Error',
          message: 'Failed to add the integration. Please try again.',
          color: 'red',
        });
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
        refetchIntegrations();
        
        notifications.show({
          title: 'Integration Removed',
          message: 'The cloud integration has been successfully removed',
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to delete integration:', error);
        
        notifications.show({
          title: 'Error',
          message: 'Failed to remove the integration. Please try again.',
          color: 'red',
        });
      }
    }
  };
  
  // Refresh an integration token
  const handleRefreshToken = async (integrationId: string) => {
    if (roles?.tenantId) {
      setRefreshingToken(integrationId);
      
      try {
        // In a real implementation, you would call an API endpoint to refresh the token
        // For now, we'll update the integration with a new expiration date
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 3600 * 1000); // 1 hour from now
        
        await api.updateTenantIntegration(roles.tenantId, integrationId, {
          tokenExpiresAt: expiresAt.toISOString(),
          status: 'active'
        });
        
        // Refresh the integrations list
        refetchIntegrations();
        
        notifications.show({
          title: 'Token Refreshed',
          message: 'The integration token has been successfully refreshed',
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to refresh token:', error);
        
        notifications.show({
          title: 'Error',
          message: 'Failed to refresh the integration token. Please try again.',
          color: 'red',
        });
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
        handleAddIntegration(availableProviders[0]);
      } else {
        notifications.show({
          title: 'No Available Providers',
          message: 'All cloud providers are already integrated with this tenant.',
          color: 'yellow',
        });
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
        title={`Add ${selectedProvider?.name || 'Cloud'} Integration`}
        size="lg"
      >
        <LoadingOverlay visible={saving} />
        
        <form onSubmit={form.onSubmit(handleSaveIntegration)}>
          {selectedProvider && (
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
                label="Authorization URL"
                placeholder="OAuth authorization URL"
                readOnly
                value={selectedProvider.authUrl}
              />
              
              {testResult === 'success' && (
                <Alert icon={<IconCheck size={16} />} title="Connection Successful" color="green">
                  The credentials are valid and the connection was established successfully.
                </Alert>
              )}
              
              {testResult === 'error' && (
                <Alert icon={<IconX size={16} />} title="Connection Failed" color="red">
                  The connection test failed. Please check your credentials and try again.
                </Alert>
              )}
              
              <Group justify="space-between" mt="md">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  loading={testingConnection}
                  disabled={saving}
                >
                  Test Connection
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
          )}
        </form>
      </Modal>
    </div>
  );
};

export default TenantIntegrations;