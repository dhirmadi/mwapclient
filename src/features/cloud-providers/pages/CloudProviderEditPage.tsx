import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { 
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  TextInput,
  Textarea,
  Select,
  LoadingOverlay,
  Alert,
  Divider,
  Badge,
  Stack,
  ActionIcon,
  Modal,
  Tabs,
} from '@mantine/core';
import { 
  IconArrowLeft,
  IconDeviceFloppy,
  IconAlertCircle,
  IconCloud,
  IconTrash,
  IconRefresh,
  IconCheck,
  IconX,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useCloudProviders } from '../hooks/useCloudProviders';
import { CloudProviderUpdate } from '../types';

const CloudProviderEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    useCloudProvider, 
    updateCloudProvider, 
    deleteCloudProvider,
    isUpdating, 
    isDeleting,
    updateError,
    deleteError 
  } = useCloudProviders();

  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch cloud provider data
  const { data: cloudProvider, isLoading, error } = useCloudProvider(id);

  // Form for cloud provider editing
  const form = useForm<CloudProviderUpdate>({
    initialValues: {
      name: '',
      slug: '',
      scopes: [],
      authUrl: '',
      tokenUrl: '',
      clientId: '',
      clientSecret: '',
      grantType: 'authorization_code',
      tokenMethod: 'POST',
      metadata: {}
    },
    validate: {
      name: (value) => (value && value.length < 3 ? 'Name must be at least 3 characters' : null),
      slug: (value) => (value && value.length < 2 ? 'Slug must be at least 2 characters' : null),
      authUrl: (value) => (value && !value.startsWith('https://') ? 'Auth URL must start with https://' : null),
      tokenUrl: (value) => (value && !value.startsWith('https://') ? 'Token URL must start with https://' : null),
    },
  });

  // Update form when cloud provider data is loaded
  useEffect(() => {
    if (cloudProvider) {
      form.setValues({
        name: cloudProvider.name,
        slug: cloudProvider.slug,
        scopes: cloudProvider.scopes,
        authUrl: cloudProvider.authUrl,
        tokenUrl: cloudProvider.tokenUrl,
        clientId: cloudProvider.clientId,
        clientSecret: '', // Don't populate for security
        grantType: cloudProvider.grantType,
        tokenMethod: cloudProvider.tokenMethod,
        metadata: cloudProvider.metadata || {}
      });
    }
  }, [cloudProvider]);

  // Handle form submission
  const handleSubmit = async (values: CloudProviderUpdate) => {
    if (!id) return;

    try {
      setFormError(null);
      
      // Prepare update data - include all fields that might have changed
      const updateData: CloudProviderUpdate = {
        name: values.name,
        slug: values.slug,
        scopes: values.scopes || [],
        authUrl: values.authUrl,
        tokenUrl: values.tokenUrl,
        clientId: values.clientId,
        grantType: values.grantType,
        tokenMethod: values.tokenMethod,
        metadata: values.metadata || {}
      };

      // Only include clientSecret if it was provided (not empty)
      if (values.clientSecret && values.clientSecret.trim() !== '') {
        updateData.clientSecret = values.clientSecret;
      }

      console.log('Submitting cloud provider update:', updateData);
      await updateCloudProvider({ id, data: updateData });
      
      console.log('Cloud provider updated successfully');
      navigate('/admin/cloud-providers');
      
    } catch (error) {
      console.error('Failed to update cloud provider:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to update cloud provider. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;

    try {
      console.log('Deleting cloud provider:', id);
      await deleteCloudProvider(id);
      console.log('Cloud provider deleted successfully');
      setDeleteModalOpen(false);
      navigate('/admin/cloud-providers');
    } catch (error) {
      console.error('Failed to delete cloud provider:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to delete cloud provider. Please try again.');
      setDeleteModalOpen(false);
    }
  };

  const handleBack = () => navigate('/admin/cloud-providers');

  // Loading state
  if (isLoading) {
    return (
      <Container size="md">
        <Paper withBorder p="md" radius="md" pos="relative">
          <LoadingOverlay visible />
          <Text>Loading cloud provider...</Text>
        </Paper>
      </Container>
    );
  }

  // Error state
  if (error || !cloudProvider) {
    return (
      <Container size="md">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error instanceof Error ? error.message : 'Cloud provider not found'}
        </Alert>
        <Group justify="center" mt="md">
          <Button onClick={handleBack}>Back to Cloud Providers</Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Edit Cloud Provider</Title>
          <Text c="dimmed">Modify cloud provider configuration</Text>
        </div>
        <Group>
          <Button 
            variant="outline" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back to Cloud Providers
          </Button>
          <ActionIcon
            color="red"
            variant="outline"
            onClick={() => setDeleteModalOpen(true)}
            loading={isDeleting}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {(formError || updateError || deleteError) && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
          {formError || (updateError instanceof Error ? updateError.message : 'An error occurred') || 
           (deleteError instanceof Error ? deleteError.message : 'An error occurred')}
        </Alert>
      )}

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isUpdating} />
        
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            <Tabs.Tab value="general" leftSection={<IconCloud size={16} />}>
              General
            </Tabs.Tab>
            <Tabs.Tab value="oauth" leftSection={<IconInfoCircle size={16} />}>
              OAuth Configuration
            </Tabs.Tab>
            <Tabs.Tab value="metadata" leftSection={<IconInfoCircle size={16} />}>
              Metadata
            </Tabs.Tab>
          </Tabs.List>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Tabs.Panel value="general">
              <Stack gap="md">
                <TextInput
                  label="Provider Name"
                  placeholder="Enter provider name"
                  leftSection={<IconCloud size={16} />}
                  {...form.getInputProps('name')}
                />
                
                <TextInput
                  label="Slug"
                  placeholder="Enter provider slug"
                  description="Unique identifier for this provider"
                  {...form.getInputProps('slug')}
                />

                <div>
                  <Text size="sm" fw={500} mb="xs">Provider Information</Text>
                  <Group gap="xs" mb="md">
                    <Badge color="blue">ID: {cloudProvider.id}</Badge>
                    <Badge color="green">Created: {new Date(cloudProvider.createdAt).toLocaleDateString()}</Badge>
                    <Badge color="orange">Updated: {new Date(cloudProvider.updatedAt).toLocaleDateString()}</Badge>
                  </Group>
                </div>

                <Textarea
                  label="Scopes"
                  placeholder="Enter OAuth scopes, one per line"
                  minRows={3}
                  value={form.values.scopes?.join('\n') || ''}
                  onChange={(e) => {
                    const scopesText = e.currentTarget.value;
                    const scopesArray = scopesText.split('\n').filter(s => s.trim() !== '');
                    form.setFieldValue('scopes', scopesArray);
                  }}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="oauth">
              <Stack gap="md">
                <TextInput
                  label="Client ID"
                  placeholder="Enter OAuth client ID"
                  {...form.getInputProps('clientId')}
                />
                
                <TextInput
                  label="Client Secret"
                  type="password"
                  placeholder="Enter new client secret (leave empty to keep current)"
                  description="Leave empty to keep the current secret"
                  {...form.getInputProps('clientSecret')}
                />
                
                <TextInput
                  label="Authorization URL"
                  placeholder="Enter OAuth authorization URL"
                  {...form.getInputProps('authUrl')}
                />
                
                <TextInput
                  label="Token URL"
                  placeholder="Enter OAuth token URL"
                  {...form.getInputProps('tokenUrl')}
                />
                
                <Select
                  label="Grant Type"
                  data={[
                    { value: 'authorization_code', label: 'Authorization Code' },
                    { value: 'client_credentials', label: 'Client Credentials' },
                    { value: 'password', label: 'Password' },
                    { value: 'implicit', label: 'Implicit' }
                  ]}
                  {...form.getInputProps('grantType')}
                />
                
                <Select
                  label="Token Method"
                  data={[
                    { value: 'POST', label: 'POST' },
                    { value: 'GET', label: 'GET' }
                  ]}
                  {...form.getInputProps('tokenMethod')}
                />

                <Alert icon={<IconInfoCircle size={16} />} color="blue">
                  OAuth configuration changes may affect existing integrations. 
                  Test thoroughly before applying changes.
                </Alert>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="metadata">
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  Provider-specific metadata and configuration options
                </Text>
                
                <Textarea
                  label="Metadata (JSON)"
                  placeholder="Enter metadata as JSON"
                  minRows={6}
                  value={JSON.stringify(form.values.metadata || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const metadata = JSON.parse(e.currentTarget.value);
                      form.setFieldValue('metadata', metadata);
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  styles={{ input: { fontFamily: 'monospace' } }}
                />

                <Alert icon={<IconInfoCircle size={16} />} color="blue">
                  Metadata should be valid JSON. This information is used for provider-specific configurations.
                </Alert>
              </Stack>
            </Tabs.Panel>

            <Divider my="xl" />

            <Group justify="flex-end">
              <Button 
                variant="outline" 
                onClick={handleBack}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                leftSection={<IconDeviceFloppy size={16} />}
                loading={isUpdating}
              >
                Update Cloud Provider
              </Button>
            </Group>
          </form>
        </Tabs>
      </Paper>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Cloud Provider"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            <Text fw={500}>This action cannot be undone!</Text>
            <Text size="sm">
              Deleting this cloud provider will remove it permanently and may affect 
              existing tenant integrations.
            </Text>
          </Alert>
          
          <Text>
            Are you sure you want to delete the cloud provider "{cloudProvider.name}"?
          </Text>
          
          <Group justify="flex-end">
            <Button 
              variant="outline" 
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              leftSection={<IconTrash size={16} />}
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete Provider
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default CloudProviderEditPage;