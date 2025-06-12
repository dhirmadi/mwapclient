import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCloudProvider, useUpdateCloudProvider } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { LoadingSpinner, ErrorDisplay } from '@/components/common';
import { Button, TextInput, Textarea, Select, Switch, Card, Group, PasswordInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

const cloudProviderSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['AWS', 'AZURE', 'GCP', 'DIGITAL_OCEAN', 'OTHER']),
  description: z.string().optional(),
  credentials: z.object({
    apiKey: z.string().min(1, 'API Key is required'),
    apiSecret: z.string().optional(), // Optional on edit to allow keeping existing secret
  }),
  active: z.boolean(),
});

type CloudProviderFormValues = z.infer<typeof cloudProviderSchema>;

const CloudProviderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: provider, isLoading: isFetching, error: fetchError } = useCloudProvider(id || '');
  const { mutate, isLoading: isUpdating, error: updateError } = useUpdateCloudProvider(id || '');

  const form = useForm<CloudProviderFormValues>({
    initialValues: {
      name: '',
      type: 'AWS',
      description: '',
      credentials: {
        apiKey: '',
        apiSecret: '',
      },
      active: true,
    },
    validate: zodResolver(cloudProviderSchema),
  });

  useEffect(() => {
    if (provider) {
      form.setValues({
        name: provider.name,
        type: provider.type,
        description: provider.description || '',
        credentials: {
          apiKey: provider.credentials.apiKey,
          apiSecret: '', // Don't show existing secret
        },
        active: provider.active,
      });
    }
  }, [provider]);

  const handleSubmit = (values: CloudProviderFormValues) => {
    // If secret is empty, don't update it
    const updatedValues = {
      ...values,
      credentials: {
        ...values.credentials,
        apiSecret: values.credentials.apiSecret || undefined,
      },
    };

    mutate(updatedValues, {
      onSuccess: () => {
        navigate('/cloud-providers');
      },
    });
  };

  const handleBack = () => {
    navigate('/cloud-providers');
  };

  if (isFetching) {
    return <LoadingSpinner size="xl" text="Loading cloud provider..." />;
  }

  const error = fetchError || updateError;

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!provider) {
    return (
      <div>
        <PageHeader
          title="Cloud Provider Not Found"
          description="The requested cloud provider could not be found"
        >
          <Button leftIcon={<IconArrowLeft size={16} />} onClick={() => navigate('/cloud-providers')}>
            Back to Cloud Providers
          </Button>
        </PageHeader>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit Cloud Provider: ${provider.name}`}
        description={`Provider ID: ${provider.id}`}
      >
        <Button leftIcon={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack}>
          Back
        </Button>
      </PageHeader>

      <Card shadow="sm" p="lg" radius="md" withBorder className="mt-6">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Provider Name"
            placeholder="Enter provider name"
            required
            {...form.getInputProps('name')}
            className="mb-4"
          />

          <Select
            label="Provider Type"
            placeholder="Select provider type"
            data={[
              { value: 'AWS', label: 'Amazon Web Services (AWS)' },
              { value: 'AZURE', label: 'Microsoft Azure' },
              { value: 'GCP', label: 'Google Cloud Platform (GCP)' },
              { value: 'DIGITAL_OCEAN', label: 'Digital Ocean' },
              { value: 'OTHER', label: 'Other' },
            ]}
            required
            {...form.getInputProps('type')}
            className="mb-4"
          />

          <Textarea
            label="Description"
            placeholder="Enter provider description"
            {...form.getInputProps('description')}
            className="mb-4"
          />

          <TextInput
            label="API Key"
            placeholder="Enter API key"
            required
            {...form.getInputProps('credentials.apiKey')}
            className="mb-4"
          />

          <PasswordInput
            label="API Secret"
            placeholder="Leave blank to keep existing secret"
            {...form.getInputProps('credentials.apiSecret')}
            className="mb-4"
          />

          <Switch
            label="Active"
            {...form.getInputProps('active', { type: 'checkbox' })}
            className="mb-6"
          />

          <Group position="right">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              leftIcon={<IconDeviceFloppy size={16} />}
              loading={isUpdating}
            >
              Save
            </Button>
          </Group>
        </form>
      </Card>
    </div>
  );
};

export default CloudProviderEdit;