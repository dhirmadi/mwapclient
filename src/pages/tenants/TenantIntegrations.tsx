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
  LoadingOverlay 
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconEdit, IconRefresh, IconCheck, IconX } from '@tabler/icons-react';
import { PageHeader } from '../../../../components/layout';
import { useAuth } from '../../../../context/AuthContext';
import { useCloudProviders } from '../../../../hooks/useCloudProviders';
import { useTenants } from '../../../../hooks/useTenants';
import { CloudProvider } from '../../../../types/cloud-provider';
import { LoadingSpinner } from '../../../../components/common';

interface TenantIntegration {
  _id: string;
  tenantId: string;
  cloudProviderId: string;
  name: string;
  credentials: Record<string, string>;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
}

const TenantIntegrations: React.FC = () => {
  const { roles } = useAuth();
  const { cloudProviders, isLoading: loadingProviders } = useCloudProviders();
  const { tenant, isLoading: loadingTenant } = useTenant(roles.tenantId);
  
  const [integrations, setIntegrations] = useState<TenantIntegration[]>([]);
  const loading = loadingProviders || loadingTenant;
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const form = useForm({
    initialValues: {
      cloudProviderId: '',
      name: '',
      credentials: {} as Record<string, string>,
    },
    validate: {
      cloudProviderId: (value) => (!value ? 'Please select a cloud provider' : null),
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load cloud providers
        const providers = await fetchCloudProviders();
        setCloudProviders(providers);
        
        // Load tenant integrations
        if (roles?.tenantId) {
          const tenantIntegrations = await fetchTenantIntegrations(roles.tenantId);
          setIntegrations(tenantIntegrations);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load cloud integrations',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [roles?.tenantId]);

  // Update form fields when selected provider changes
  useEffect(() => {
    if (selectedProvider) {
      // Reset credentials
      const initialCredentials: Record<string, string> = {};
      // Assuming requiredCredentials is an array of field names
      (selectedProvider.credentials || []).forEach((field: any) => {
        initialCredentials[field.key] = '';
      });
      
      form.setValues({
        ...form.values,
        cloudProviderId: selectedProvider._id,
        credentials: initialCredentials,
      });
    }
  }, [selectedProvider]);

  const handleProviderChange = (providerId: string) => {
    const provider = cloudProviders.find(p => p._id === providerId);
    setSelectedProvider(provider || null);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    // This would typically call an API endpoint to test the connection
    setTestingConnection(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, randomly succeed or fail
      const success = Math.random() > 0.3;
      setTestResult(success ? 'success' : 'error');
      
      if (success) {
        notifications.show({
          title: 'Success',
          message: 'Connection test successful',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Connection test failed. Please check your credentials.',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setTestResult('error');
      notifications.show({
        title: 'Error',
        message: 'Failed to test connection',
        color: 'red',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!roles?.tenantId) return;
    
    try {
      setSaving(true);
      
      // Create integration
      await createTenantIntegration(roles.tenantId, {
        cloudProviderId: values.cloudProviderId,
        name: values.name,
        credentials: values.credentials,
      });
      
      // Refresh integrations
      const updatedIntegrations = await fetchTenantIntegrations(roles.tenantId);
      setIntegrations(updatedIntegrations);
      
      // Close modal and reset form
      setModalOpen(false);
      form.reset();
      setSelectedProvider(null);
      
      notifications.show({
        title: 'Success',
        message: 'Cloud integration added successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to create integration:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to add cloud integration',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!roles?.tenantId) return;
    
    if (window.confirm('Are you sure you want to delete this integration?')) {
      try {
        await deleteTenantIntegration(roles.tenantId, integrationId);
        
        // Refresh integrations
        const updatedIntegrations = await fetchTenantIntegrations(roles.tenantId);
        setIntegrations(updatedIntegrations);
        
        notifications.show({
          title: 'Success',
          message: 'Cloud integration deleted successfully',
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to delete integration:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete cloud integration',
          color: 'red',
        });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Cloud Integrations"
        description="Manage your organization's cloud provider connections"
      />

      <Group justify="flex-end" mb="md">
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={() => setModalOpen(true)}
        >
          Add Integration
        </Button>
      </Group>

      {integrations.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text ta="center" c="dimmed" mb="md">
            No cloud integrations found
          </Text>
          <Group justify="center">
            <Button 
              variant="outline" 
              leftSection={<IconPlus size={16} />} 
              onClick={() => setModalOpen(true)}
            >
              Add Your First Integration
            </Button>
          </Group>
        </Paper>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => {
            const provider = cloudProviders.find(p => p._id === integration.cloudProviderId);
            
            return (
              <Card key={integration._id} withBorder padding="lg" radius="md">
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>{integration.name}</Text>
                  <Badge 
                    color={
                      integration.status === 'active' ? 'green' : 
                      integration.status === 'error' ? 'red' : 'gray'
                    }
                  >
                    {integration.status}
                  </Badge>
                </Group>
                
                <Text size="sm" c="dimmed" mb="md">
                  {provider?.name || 'Unknown Provider'}
                </Text>
                
                <Text size="xs" c="dimmed">
                  Last updated: {new Date(integration.updatedAt).toLocaleDateString()}
                </Text>
                
                <Group mt="md" justify="flex-end">
                  <ActionIcon variant="subtle" color="gray">
                    <IconRefresh size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="blue">
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon 
                    variant="subtle" 
                    color="red"
                    onClick={() => handleDeleteIntegration(integration._id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Integration Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          form.reset();
          setSelectedProvider(null);
          setTestResult(null);
        }}
        title="Add Cloud Integration"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={saving} />
          
          <Select
            label="Cloud Provider"
            placeholder="Select a cloud provider"
            data={cloudProviders.map(provider => ({
              value: provider._id,
              label: provider.name,
            }))}
            required
            mb="md"
            {...form.getInputProps('cloudProviderId')}
            onChange={(value) => handleProviderChange(value || '')}
          />
          
          <TextInput
            label="Integration Name"
            placeholder="Enter a name for this integration"
            required
            mb="md"
            {...form.getInputProps('name')}
          />
          
          {selectedProvider && (
            <>
              <Title order={4} mt="lg" mb="md">Credentials</Title>
              
              {(selectedProvider.credentials || []).map((field: any) => (
                <TextInput
                  key={field.key}
                  label={field.label}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required
                  mb="md"
                  type={field.type === 'password' ? 'password' : 'text'}
                  {...form.getInputProps(`credentials.${field.key}`)}
                />
              ))}
              
              <Group mb="xl">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  loading={testingConnection}
                  leftSection={
                    testResult === 'success' ? <IconCheck size={16} /> :
                    testResult === 'error' ? <IconX size={16} /> :
                    undefined
                  }
                  color={
                    testResult === 'success' ? 'green' :
                    testResult === 'error' ? 'red' :
                    'blue'
                  }
                >
                  Test Connection
                </Button>
                
                {testResult && (
                  <Text
                    c={testResult === 'success' ? 'green' : 'red'}
                    size="sm"
                  >
                    {testResult === 'success' ? 'Connection successful' : 'Connection failed'}
                  </Text>
                )}
              </Group>
            </>
          )}
          
          <Group justify="flex-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setModalOpen(false);
                form.reset();
                setSelectedProvider(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={testResult === 'error'}>
              Add Integration
            </Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
};

export default TenantIntegrations;