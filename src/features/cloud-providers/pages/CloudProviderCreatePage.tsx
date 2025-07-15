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
  
  // Provider templates with pre-configured values
  const getProviderTemplate = (providerType: string) => {
    const templates = {
      'dropbox': {
        name: 'Dropbox',
        slug: 'dropbox',
        scopes: ['files.content.read', 'files.content.write', 'files.metadata.read'],
        authUrl: 'https://www.dropbox.com/oauth2/authorize',
        tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
        grantType: 'authorization_code',
        tokenMethod: 'POST',
        metadata: {
          providerType: 'dropbox',
          apiBaseUrl: 'https://api.dropboxapi.com/2',
          supportedFeatures: ['read', 'write', 'metadata']
        }
      },
      'google-drive': {
        name: 'Google Drive',
        slug: 'google-drive',
        scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file'],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        grantType: 'authorization_code',
        tokenMethod: 'POST',
        metadata: {
          providerType: 'google-drive',
          apiBaseUrl: 'https://www.googleapis.com/drive/v3',
          supportedFeatures: ['read', 'write', 'metadata']
        }
      },
      'onedrive': {
        name: 'OneDrive',
        slug: 'onedrive',
        scopes: ['Files.Read', 'Files.ReadWrite', 'Files.Read.All'],
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        grantType: 'authorization_code',
        tokenMethod: 'POST',
        metadata: {
          providerType: 'onedrive',
          apiBaseUrl: 'https://graph.microsoft.com/v1.0/me/drive',
          supportedFeatures: ['read', 'write', 'metadata']
        }
      },
      'custom': {
        name: '',
        slug: 'custom',
        scopes: ['read', 'write'],
        authUrl: '',
        tokenUrl: '',
        grantType: 'authorization_code',
        tokenMethod: 'POST',
        metadata: {
          providerType: 'custom'
        }
      }
    };

    return templates[providerType as keyof typeof templates] || templates.custom;
  };

  // Update form values when provider type changes
  useEffect(() => {
    if (selectedProviderType) {
      const template = getProviderTemplate(selectedProviderType);
      
      // Update form with template values
      form.setValues({
        name: template.name,
        slug: template.slug,
        scopes: template.scopes,
        authUrl: template.authUrl,
        tokenUrl: template.tokenUrl,
        clientId: form.values.clientId, // Keep existing client credentials
        clientSecret: form.values.clientSecret,
        grantType: template.grantType,
        tokenMethod: template.tokenMethod,
        metadata: template.metadata
      });
      
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
            <Text size="sm" mb="xs">
              These settings define how the OAuth flow will work. The client ID and client secret will be used by the system to authenticate with the provider.
            </Text>
            {selectedProviderType !== 'custom' && (
              <Text size="xs" c="dimmed">
                Pre-configured values have been loaded for {selectedProviderType}. 
                You only need to provide your client ID and client secret.
              </Text>
            )}
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