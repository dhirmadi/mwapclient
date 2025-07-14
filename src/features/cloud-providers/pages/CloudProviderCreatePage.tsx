import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { 
  TextInput, 
  Textarea, 
  Select, 
  Button, 
  Paper, 
  Group, 
  LoadingOverlay, 
  Alert,
  Divider,
  Title,
  Text,
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconDeviceFloppy, 
  IconArrowLeft,
  IconCloud,
} from '@tabler/icons-react';
import { useCloudProviders } from '../hooks/useCloudProviders';
import { CloudProviderCreate as CloudProviderCreateType } from '../types';

/**
 * Cloud Provider Create Component
 * Form for creating a new cloud provider
 */
const CloudProviderCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createCloudProvider, isCreating, createError } = useCloudProviders();
  const [selectedProviderType, setSelectedProviderType] = useState<string>('dropbox');
  const [formError, setFormError] = useState<string | null>(null);

  // Form for cloud provider creation
  const form = useForm<CloudProviderCreateType>({
    initialValues: {
      name: '',
      slug: selectedProviderType,
      scopes: ['read', 'write'],
      authUrl: '',
      tokenUrl: '',
      clientId: '',
      clientSecret: '',
      grantType: 'authorization_code',
      tokenMethod: 'POST',
      metadata: {}
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
      slug: (value) => (!value ? 'Slug is required' : null),
      authUrl: (value) => (!value ? 'Auth URL is required' : null),
      tokenUrl: (value) => (!value ? 'Token URL is required' : null),
      clientId: (value) => (!value ? 'Client ID is required' : null),
      clientSecret: (value) => (!value ? 'Client Secret is required' : null),
    },
  });

  // No need for notification check anymore
  
  // Update form values when provider type changes
  useEffect(() => {
    if (selectedProviderType) {
      // Set slug based on provider type
      form.setFieldValue('slug', selectedProviderType);
      
      // Set default OAuth values
      form.setFieldValue('grantType', 'authorization_code');
      form.setFieldValue('tokenMethod', 'POST');
      
      // Set metadata based on provider type
      const metadata: Record<string, unknown> = {
        providerType: selectedProviderType
      };
      
      // Add provider-specific metadata
      if (selectedProviderType === 'google_drive') {
        metadata.apiBaseUrl = 'https://www.googleapis.com/drive/v3';
      } else if (selectedProviderType === 'dropbox') {
        metadata.apiBaseUrl = 'https://api.dropboxapi.com/2';
      } else if (selectedProviderType === 'onedrive') {
        metadata.apiBaseUrl = 'https://graph.microsoft.com/v1.0/me/drive';
      }
      
      form.setFieldValue('metadata', metadata);
      
      // Clear any previous errors
      setFormError(null);
    }
  }, [selectedProviderType]);

  // Handle form submission
  const handleSubmit = async (values: CloudProviderCreateType) => {
    try {
      setFormError(null);
      
      // Update slug based on provider type if not set
      if (!values.slug) {
        values.slug = selectedProviderType;
      }
      
      // Create cloud provider
      await createCloudProvider(values);
      
      // Store success message for next page
      console.log('Cloud provider created successfully');
      
      // Navigate back to list
      navigate('/admin/cloud-providers');
      
    } catch (error) {
      console.error('Failed to create cloud provider:', error);
      
      // Set form error
      setFormError('Failed to create cloud provider. Please try again.');
      
      // Show error message directly on the form
      form.setErrors({ name: 'Failed to create cloud provider. Please try again.' });
    }
  };

  // Navigation handler
  const handleBack = () => navigate('/admin/cloud-providers');

  // Get icon for selected provider
  const renderProviderIcon = () => {
    return <IconCloud size={16} />;
  };

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Add Cloud Provider</Title>
          <Text c="dimmed">Configure a new cloud storage provider integration</Text>
        </div>
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
        
        {formError && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {formError}
          </Alert>
        )}
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          {/* General Information */}
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
            data={[
              { value: 'dropbox', label: 'Dropbox' },
              { value: 'google-drive', label: 'Google Drive' },
              { value: 'onedrive', label: 'OneDrive' },
              { value: 'custom', label: 'Custom' }
            ]}
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
          
          <Divider my="lg" label="OAuth Configuration" labelPosition="center" />
          
          <TextInput
            label="Client ID"
            placeholder="Enter OAuth client ID"
            required
            mb="md"
            {...form.getInputProps('clientId')}
          />
          
          <TextInput
            label="Client Secret"
            placeholder="Enter OAuth client secret"
            required
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
            title="OAuth Configuration" 
            color="blue" 
            mb="md"
          >
            These settings define how the OAuth flow will work. The client ID and client secret will be used by the system to authenticate with the provider.
          </Alert>
          
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