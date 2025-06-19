import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { 
  TextInput, 
  Textarea, 
  Select, 
  Switch, 
  Button, 
  Paper, 
  Title, 
  Group, 
  LoadingOverlay, 
  Tabs, 
  Code, 
  Alert,
  PasswordInput,
  Divider,
  Stack
} from '@mantine/core';
import { storeSuccess, showError } from '../../utils/notificationService';
import { 
  IconAlertCircle, 
  IconCheck, 
  IconDeviceFloppy, 
  IconArrowLeft,
  IconBrandDrops,
  IconBrandGoogleDrive,
  IconBrandOnedrive,
  IconBrandAmazon,
  IconBrandGoogle,
  IconBrandMinecraft,
  IconCloud
} from '@tabler/icons-react';
import { PageHeader } from '../../components/layout';
import { useCloudProviders } from '../../hooks/useCloudProviders';
import { CloudProvider, CloudProviderUpdate } from '../../types/cloud-provider';
import { LoadingSpinner } from '../../components/common';

// Import constants from CloudProviderCreate
import { 
  AUTH_TYPES, 
  PROVIDER_TYPES, 
  DEFAULT_SCHEMAS, 
  AUTH_TYPE_FIELDS,
  PROVIDER_OAUTH_DEFAULTS,
  getProviderIcon
} from './CloudProviderConstants';

const CloudProviderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useCloudProvider, updateCloudProvider, isUpdating } = useCloudProviders();
  const { data: cloudProvider, isLoading, error } = useCloudProvider(id);
  
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [selectedProviderType, setSelectedProviderType] = useState<string>('dropbox');
  const [selectedAuthType, setSelectedAuthType] = useState<string>('oauth2');
  const [requiredCredentials, setRequiredCredentials] = useState<Array<{ key: string, label: string, type: string }>>(AUTH_TYPE_FIELDS.oauth2);
  
  // No need for notification check anymore

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
      slug: (value) => (!value ? 'Slug is required' : null),
      authUrl: (value) => (!value ? 'Auth URL is required' : null),
      tokenUrl: (value) => (!value ? 'Token URL is required' : null),
      clientId: (value) => (!value ? 'Client ID is required' : null),
    },
  });

  // Schema editor state
  const [schemaJson, setSchemaJson] = useState<string>('{}');

  // Load cloud provider data
  useEffect(() => {
    if (cloudProvider) {
      form.setValues({
        name: cloudProvider.name,
        slug: cloudProvider.slug,
        scopes: cloudProvider.scopes || [],
        authUrl: cloudProvider.authUrl,
        tokenUrl: cloudProvider.tokenUrl,
        clientId: cloudProvider.clientId || '',
        clientSecret: '', // Don't load the secret, it will be updated only if provided
        grantType: cloudProvider.grantType || 'authorization_code',
        tokenMethod: cloudProvider.tokenMethod || 'POST',
        metadata: cloudProvider.metadata || {}
      });
      
      // Set selected provider type based on slug
      setSelectedProviderType(cloudProvider.slug);
      
      // If there's a schema, set it
      if (cloudProvider.configSchema) {
        setSchemaJson(JSON.stringify(cloudProvider.configSchema, null, 2));
      }
    }
  }, [cloudProvider]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error loading cloud provider:', error);
      showError('Failed to load cloud provider');
    }
  }, [error]);

  // Update required credentials when auth type changes
  useEffect(() => {
    if (selectedAuthType) {
      setRequiredCredentials(AUTH_TYPE_FIELDS[selectedAuthType] || []);
      form.setFieldValue('authType', selectedAuthType);
    }
  }, [selectedAuthType]);

  // Handle schema changes
  const handleSchemaChange = (value: string) => {
    setSchemaJson(value);
    setSchemaError(null);
    
    try {
      const parsed = JSON.parse(value);
      form.setFieldValue('configSchema', parsed);
    } catch (error) {
      if (error instanceof Error) {
        setSchemaError(error.message);
      } else {
        setSchemaError('Invalid JSON');
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (values: CloudProviderUpdate) => {
    if (!id) return;
    
    try {
      // Update cloud provider
      await updateCloudProvider({ id, data: values });
      
      // Store success message for next page
      storeSuccess('Cloud provider updated successfully');
      
      // Navigate back to list
      navigate('/admin/cloud-providers');
      
    } catch (error) {
      console.error('Failed to update cloud provider:', error);
      
      // Show error message directly on the form
      form.setErrors({ name: 'Failed to update cloud provider. Please try again.' });
      
      // Also show error notification
      showError('Failed to update cloud provider');
    }
  };

  const handleBack = () => {
    navigate('/admin/cloud-providers');
  };

  // Get icon for selected provider
  const renderProviderIcon = () => {
    const provider = PROVIDER_TYPES.find(p => p.value === selectedProviderType);
    return getProviderIcon(provider?.iconType || 'custom');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Error"
          description="Failed to load cloud provider"
        >
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back to Cloud Providers
          </Button>
        </PageHeader>
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
        >
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </Alert>
      </div>
    );
  }

  if (!cloudProvider) {
    return (
      <div>
        <PageHeader
          title="Cloud Provider Not Found"
          description="The requested cloud provider could not be found"
        >
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back to Cloud Providers
          </Button>
        </PageHeader>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit Cloud Provider: ${cloudProvider.name}`}
        description={`Provider ID: ${cloudProvider._id}`}
      >
        <Button 
          variant="outline" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleBack}
        >
          Back to Cloud Providers
        </Button>
      </PageHeader>

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isUpdating} />
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="md">
              <Tabs.Tab value="general">General Information</Tabs.Tab>
              <Tabs.Tab value="auth">Authentication</Tabs.Tab>
              <Tabs.Tab value="metadata">Metadata</Tabs.Tab>
              <Tabs.Tab value="schema">Configuration Schema</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general">
              <Title order={3} mb="md">General Information</Title>
              
              <TextInput
                label="Provider Name"
                placeholder="Enter provider name"
                required
                mb="md"
                leftSection={renderProviderIcon()}
                {...form.getInputProps('name')}
              />
              
              <Select
                label="Provider Type"
                placeholder="Select provider type"
                data={PROVIDER_TYPES.map(type => ({
                  value: type.value,
                  label: type.label,
                  leftSection: getProviderIcon(type.iconType)
                }))}
                value={selectedProviderType}
                onChange={(value) => setSelectedProviderType(value || 'dropbox')}
                required
                mb="md"
                disabled // Prevent changing provider type after creation
              />
              
              <Textarea
                label="Description"
                placeholder="Enter provider description"
                minRows={3}
                mb="md"
              />
              
              <Switch
                label="Active"
                description="Inactive providers cannot be used for new integrations"
                checked={form.values.isActive}
                mb="xl"
                {...form.getInputProps('isActive', { type: 'checkbox' })}
              />
            </Tabs.Panel>

            <Tabs.Panel value="auth">
              <Title order={3} mb="md">OAuth Configuration</Title>
              
              <TextInput
                label="Client ID"
                placeholder="Enter OAuth client ID"
                required
                mb="md"
                {...form.getInputProps('clientId')}
              />
              
              <PasswordInput
                label="Client Secret"
                placeholder="Enter new client secret or leave blank to keep existing"
                mb="md"
                {...form.getInputProps('clientSecret')}
              />
              
              <TextInput
                label="Auth URL"
                placeholder="Enter OAuth authorization URL"
                required
                mb="md"
                {...form.getInputProps('authUrl')}
              />
              
              <TextInput
                label="Token URL"
                placeholder="Enter OAuth token URL"
                required
                mb="md"
                {...form.getInputProps('tokenUrl')}
              />
              
              <Select
                label="Grant Type"
                placeholder="Select OAuth grant type"
                data={[
                  { value: 'authorization_code', label: 'Authorization Code' },
                  { value: 'client_credentials', label: 'Client Credentials' },
                  { value: 'password', label: 'Password' },
                  { value: 'implicit', label: 'Implicit' }
                ]}
                mb="md"
                {...form.getInputProps('grantType')}
              />
              
              <Select
                label="Token Method"
                placeholder="Select token request method"
                data={[
                  { value: 'POST', label: 'POST' },
                  { value: 'GET', label: 'GET' }
                ]}
                mb="md"
                {...form.getInputProps('tokenMethod')}
              />
              
              <Textarea
                label="Scopes"
                placeholder="Enter OAuth scopes, one per line"
                required
                minRows={3}
                mb="md"
                value={form.values.scopes.join('\n')}
                onChange={(e) => {
                  const scopesText = e.currentTarget.value;
                  const scopesArray = scopesText.split('\n').filter(s => s.trim() !== '');
                  form.setFieldValue('scopes', scopesArray);
                }}
              />
              
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Credential Security" 
                color="blue" 
                mb="md"
              >
                Credentials are securely stored and encrypted. Leave the client secret field blank to keep the existing value.
              </Alert>
            </Tabs.Panel>
            
            <Tabs.Panel value="metadata">
              <Title order={3} mb="md">Provider Metadata</Title>
              
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Metadata" 
                color="blue" 
                mb="md"
              >
                Metadata contains additional configuration for the cloud provider. This is stored as a JSON object.
              </Alert>
              
              {schemaError && (
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  title="Metadata Error" 
                  color="red" 
                  mb="md"
                >
                  {schemaError}
                </Alert>
              )}
              
              <TextInput
                label="API Base URL"
                placeholder="Enter API base URL for this provider"
                mb="md"
                value={form.values.metadata?.apiBaseUrl as string || ''}
                onChange={(e) => {
                  const metadata = { ...form.values.metadata, apiBaseUrl: e.currentTarget.value };
                  form.setFieldValue('metadata', metadata);
                }}
              />
              
              <TextInput
                label="Documentation URL"
                placeholder="Enter documentation URL for this provider"
                mb="md"
                value={form.values.metadata?.documentationUrl as string || ''}
                onChange={(e) => {
                  const metadata = { ...form.values.metadata, documentationUrl: e.currentTarget.value };
                  form.setFieldValue('metadata', metadata);
                }}
              />
              
              <Textarea
                label="Additional Metadata (JSON)"
                placeholder="Enter additional metadata as JSON"
                minRows={5}
                mb="md"
                value={JSON.stringify(form.values.metadata || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const metadata = JSON.parse(e.currentTarget.value);
                    form.setFieldValue('metadata', metadata);
                    setSchemaError(null);
                  } catch (error) {
                    if (error instanceof Error) {
                      setSchemaError(error.message);
                    } else {
                      setSchemaError('Invalid JSON');
                    }
                  }
                }}
                styles={{ input: { fontFamily: 'monospace' } }}
              />
            </Tabs.Panel>

            <Tabs.Panel value="schema">
              <Title order={3} mb="md">Configuration Schema</Title>
              
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="JSON Schema" 
                color="blue" 
                mb="md"
              >
                Define the configuration schema for this cloud provider using JSON Schema format. 
                This schema will be used to validate tenant integrations.
              </Alert>
              
              {schemaError && (
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  title="Schema Error" 
                  color="red" 
                  mb="md"
                >
                  {schemaError}
                </Alert>
              )}
              
              <Textarea
                placeholder="Enter JSON schema"
                minRows={10}
                value={schemaJson}
                onChange={(e) => handleSchemaChange(e.currentTarget.value)}
                mb="md"
                styles={{ input: { fontFamily: 'monospace' } }}
              />
              
              <Title order={4} mb="md">Schema Preview</Title>
              <Code block mb="xl">
                {schemaError ? 'Invalid JSON' : JSON.stringify(form.values.configSchema, null, 2)}
              </Code>
            </Tabs.Panel>
          </Tabs>
          
          <Group justify="flex-end" mt="xl">
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
              disabled={!!schemaError}
            >
              Save Changes
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
};

export default CloudProviderEdit;