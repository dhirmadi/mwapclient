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
      type: 'dropbox',
      authType: 'oauth2',
      configSchema: DEFAULT_SCHEMAS.dropbox,
      isActive: true,
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
    },
  });

  // Schema editor state
  const [schemaJson, setSchemaJson] = useState<string>(JSON.stringify(DEFAULT_SCHEMAS.dropbox, null, 2));

  // Update schema when provider type changes
  useEffect(() => {
    if (selectedProviderType) {
      const defaultSchema = DEFAULT_SCHEMAS[selectedProviderType] || DEFAULT_SCHEMAS.custom;
      setSchemaJson(JSON.stringify(defaultSchema, null, 2));
      form.setFieldValue('configSchema', defaultSchema);
      form.setFieldValue('type', selectedProviderType);
      
      // Set appropriate auth type based on provider
      let authType = 'oauth2';
      if (['aws_s3', 'gcp_storage', 'azure_blob'].includes(selectedProviderType)) {
        authType = 'api_key';
      }
      setSelectedAuthType(authType);
      form.setFieldValue('authType', authType);
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
      notifications.show({
        title: 'Error',
        message: 'Failed to create cloud provider',
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
              />
              
              <Divider mb="md" label="Required Credentials" labelPosition="center" />
              
              <Stack>
                {requiredCredentials.map((field) => (
                  <div key={field.key}>
                    {field.type === 'password' ? (
                      <PasswordInput
                        label={field.label}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        required
                        mb="md"
                      />
                    ) : field.type === 'textarea' ? (
                      <Textarea
                        label={field.label}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        required
                        minRows={3}
                        mb="md"
                      />
                    ) : (
                      <TextInput
                        label={field.label}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        required
                        mb="md"
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
                Credentials are securely stored and encrypted. They will be used by tenant integrations to authenticate with the cloud provider.
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