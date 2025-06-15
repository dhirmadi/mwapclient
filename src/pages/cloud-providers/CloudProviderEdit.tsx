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
import { notifications } from '@mantine/notifications';
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

  // Form for cloud provider editing
  const form = useForm<CloudProviderUpdate>({
    initialValues: {
      name: '',
      type: '',
      authType: '',
      configSchema: {},
      isActive: true,
      credentials: {}
    },
    validate: {
      name: (value) => (value && value.length < 3 ? 'Name must be at least 3 characters' : null),
    },
  });

  // Schema editor state
  const [schemaJson, setSchemaJson] = useState<string>('{}');

  // Load cloud provider data
  useEffect(() => {
    if (cloudProvider) {
      // Extract credentials from configSchema if they exist
      const credentials = cloudProvider.configSchema.credentials || {};
      
      form.setValues({
        name: cloudProvider.name,
        type: cloudProvider.type,
        authType: cloudProvider.authType,
        configSchema: cloudProvider.configSchema,
        isActive: cloudProvider.isActive,
        credentials
      });
      
      // Set selected provider type and auth type
      setSelectedProviderType(cloudProvider.type);
      setSelectedAuthType(cloudProvider.authType);
      
      // Set schema JSON
      setSchemaJson(JSON.stringify(cloudProvider.configSchema || {}, null, 2));
    }
  }, [cloudProvider]);

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
      // Validate schema JSON
      if (schemaError) {
        notifications.show({
          title: 'Error',
          message: 'Please fix the schema errors before submitting',
          color: 'red',
        });
        setActiveTab('schema');
        return;
      }
      
      // Extract credentials from form values
      const { credentials, ...providerData } = values;
      
      // Create the provider data object in the format expected by the API
      const apiData = {
        ...providerData,
        // Store credentials in the configSchema
        configSchema: {
          ...providerData.configSchema,
          credentials: credentials || {}
        }
      };
      
      console.log('Updating cloud provider data:', apiData);
      
      // Update cloud provider
      await updateCloudProvider({ id, data: apiData });
      
      notifications.show({
        title: 'Success',
        message: 'Cloud provider updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      // Navigate back to list
      navigate('/admin/cloud-providers');
    } catch (error) {
      console.error('Failed to update cloud provider:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      notifications.show({
        title: 'Error',
        message: 'Failed to update cloud provider. See console for details.',
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Error"
          description="Failed to load cloud provider"
        />
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
          mt="md"
        >
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </Alert>
        <Group mt="xl">
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back to Cloud Providers
          </Button>
        </Group>
      </div>
    );
  }

  if (!cloudProvider) {
    return (
      <div>
        <PageHeader
          title="Cloud Provider Not Found"
          description="The requested cloud provider could not be found"
        />
        <Group mt="md">
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back to Cloud Providers
          </Button>
        </Group>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit Cloud Provider: ${cloudProvider.name}`}
        description={`Provider ID: ${cloudProvider._id}`}
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
        <LoadingOverlay visible={isUpdating} />
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="md">
              <Tabs.Tab value="general">General Information</Tabs.Tab>
              <Tabs.Tab value="auth">Authentication</Tabs.Tab>
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
              <Title order={3} mb="md">Authentication Configuration</Title>
              
              <Select
                label="Authentication Type"
                placeholder="Select authentication type"
                data={AUTH_TYPES}
                value={selectedAuthType}
                onChange={(value) => setSelectedAuthType(value || 'oauth2')}
                required
                mb="xl"
                disabled // Prevent changing auth type after creation
              />
              
              <Divider mb="md" label="Required Credentials" labelPosition="center" />
              
              <Stack>
                {requiredCredentials.map((field) => (
                  <div key={field.key}>
                    {field.type === 'password' ? (
                      <PasswordInput
                        label={field.label}
                        placeholder={`Enter new ${field.label.toLowerCase()} or leave blank to keep existing`}
                        mb="md"
                        {...form.getInputProps(`credentials.${field.key}`)}
                      />
                    ) : field.type === 'textarea' ? (
                      <Textarea
                        label={field.label}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        minRows={3}
                        mb="md"
                        {...form.getInputProps(`credentials.${field.key}`)}
                      />
                    ) : (
                      <TextInput
                        label={field.label}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        mb="md"
                        {...form.getInputProps(`credentials.${field.key}`)}
                      />
                    )}
                  </div>
                ))}
              </Stack>
              
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Credential Security" 
                color="blue" 
                mb="md"
              >
                Credentials are securely stored and encrypted. Leave password fields blank to keep existing values.
              </Alert>
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