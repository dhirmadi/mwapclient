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
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconDeviceFloppy, 
  IconArrowLeft,
} from '@tabler/icons-react';
import { PageHeader } from '../../components/layout';
import { useCloudProviders } from '../../hooks/useCloudProviders';
import { CloudProviderCreate as CloudProviderCreateType } from '../../types/cloud-provider';
import { 
  PROVIDER_TYPES, 
  PROVIDER_OAUTH_DEFAULTS,
  getProviderIcon
} from './CloudProviderConstants';
import { storeSuccess } from '../../utils/notificationService';

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
      tokenUrl: ''
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
      slug: (value) => (!value ? 'Slug is required' : null),
      authUrl: (value) => (!value ? 'Auth URL is required' : null),
      tokenUrl: (value) => (!value ? 'Token URL is required' : null),
    },
  });

  // No need for notification check anymore
  
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
      storeSuccess('Cloud provider created successfully');
      
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
    const provider = PROVIDER_TYPES.find(p => p.value === selectedProviderType);
    return getProviderIcon(provider?.iconType || 'custom');
  };

  return (
    <div>
      <PageHeader
        title="Add Cloud Provider"
        description="Configure a new cloud storage provider integration"
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
          
          <Divider my="lg" label="Authentication Configuration" labelPosition="center" />
          
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