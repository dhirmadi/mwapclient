import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stack,
  Text
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconAlertCircle, 
  IconCheck, 
  IconDeviceFloppy, 
  IconArrowLeft,
  IconCloud
} from '@tabler/icons-react';
import { PageHeader } from '../../components/layout';
import { useCloudProviders } from '../../hooks/useCloudProviders';
import { CloudProviderCreate as CloudProviderCreateType } from '../../types/cloud-provider';
import { 
  AUTH_TYPES, 
  PROVIDER_TYPES, 
  DEFAULT_SCHEMAS, 
  AUTH_TYPE_FIELDS,
  PROVIDER_OAUTH_DEFAULTS,
  getProviderIcon
} from './CloudProviderConstants';

const CloudProviderCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createCloudProvider, isCreating } = useCloudProviders();
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [selectedProviderType, setSelectedProviderType] = useState<string>('dropbox');
  const [selectedAuthType, setSelectedAuthType] = useState<string>('oauth2');
  const [requiredCredentials, setRequiredCredentials] = useState<Array<{ key: string, label: string, type: string }>>(AUTH_TYPE_FIELDS.oauth2);

  // Form for cloud provider creation
  const form = useForm<CloudProviderCreateType>({
    initialValues: {
      name: '',
      slug: selectedProviderType,
      scopes: ['read', 'write'],
      authUrl: '',
      tokenUrl: ''
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
      slug: (value) => (!value ? 'Slug is required' : null),
      authUrl: (value) => (!value ? 'Auth URL is required' : null),
      tokenUrl: (value) => (!value ? 'Token URL is required' : null),
    },
  });

  // Schema editor state
  const [schemaJson, setSchemaJson] = useState<string>(JSON.stringify(DEFAULT_SCHEMAS.dropbox, null, 2));

  // Update form values when provider type changes
  useEffect(() => {
    if (selectedProviderType) {
      // Set slug based on provider type
      form.setFieldValue('slug', selectedProviderType);
      
      // Set OAuth defaults if available
      const oauthDefaults = PROVIDER_OAUTH_DEFAULTS[selectedProviderType] || PROVIDER_OAUTH_DEFAULTS.custom;
      form.setFieldValue('authUrl', oauthDefaults.authUrl);
      form.setFieldValue('tokenUrl', oauthDefaults.tokenUrl);
      form.setFieldValue('scopes', oauthDefaults.scopes);
      
      // Set appropriate auth type based on provider
      let authType = 'oauth2';
      if (['aws_s3', 'gcp_storage', 'azure_blob'].includes(selectedProviderType)) {
        authType = 'api_key';
      }
      setSelectedAuthType(authType);
    }
  }, [selectedProviderType]);

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
  const handleSubmit = async (values: CloudProviderCreateType) => {
    try {
      // Update slug based on provider type if not set
      if (!values.slug) {
        values.slug = selectedProviderType;
      }
      
      // Log the values being submitted
      console.log('Submitting cloud provider data:', values);
      
      // Create cloud provider
      await createCloudProvider(values);
      
      notifications.show({
        title: 'Success',
        message: 'Cloud provider created successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      // Navigate back to list
      navigate('/admin/cloud-providers');
    } catch (error) {
      console.error('Failed to create cloud provider:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      notifications.show({
        title: 'Error',
        message: 'Failed to create cloud provider. See console for details.',
        color: 'red',
      });
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

  return (
    <div>
      <PageHeader
        title="Add Cloud Provider"
        description="Configure a new cloud storage provider integration"
      />

      <Group justify="flex-start" mb="md">
        <Button 
          variant="outline" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleBack}
        >
          Back to Cloud Providers
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isCreating} />
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="md">
              <Tabs.Tab value="general">General Information</Tabs.Tab>
              <Tabs.Tab value="auth">Authentication</Tabs.Tab>
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
                onChange={(value) => {
                  setSelectedProviderType(value || 'dropbox');
                  form.setFieldValue('slug', value || 'dropbox');
                }}
                required
                mb="md"
              />
              
              <TextInput
                label="Slug"
                placeholder="Enter provider slug (e.g., dropbox, gdrive)"
                required
                mb="md"
                {...form.getInputProps('slug')}
              />
            </Tabs.Panel>

            <Tabs.Panel value="auth">
              <Title order={3} mb="md">Authentication Configuration</Title>
              
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
              
              <Divider mb="md" label="OAuth Scopes" labelPosition="center" />
              
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
                title="OAuth Configuration" 
                color="blue" 
                mb="md"
              >
                These settings define how the OAuth flow will work. Client ID and Client Secret will be provided by tenant owners when they integrate with this provider.
              </Alert>
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
              loading={isCreating}
              disabled={!!schemaError}
            >
              Create Cloud Provider
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
};

export default CloudProviderCreate;