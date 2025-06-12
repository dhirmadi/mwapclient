import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCloudProvider } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { ErrorDisplay } from '@/components/common';
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
    apiSecret: z.string().min(1, 'API Secret is required'),
  }),
  active: z.boolean().default(true),
});

type CloudProviderFormValues = z.infer<typeof cloudProviderSchema>;

const CloudProviderCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate, isLoading, error } = useCreateCloudProvider();

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

  const handleSubmit = (values: CloudProviderFormValues) => {
    mutate(values, {
      onSuccess: () => {
        navigate('/cloud-providers');
      },
    });
  };

  const handleBack = () => {
    navigate('/cloud-providers');
  };

  return (
    <div>
      <PageHeader
        title="Add Cloud Provider"
        description="Configure a new cloud provider integration"
      >
        <Button leftIcon={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack}>
          Back
        </Button>
      </PageHeader>

      {error && <ErrorDisplay error={error} className="mt-4" />}

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
            placeholder="Enter API secret"
            required
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
              loading={isLoading}
            >
              Save
            </Button>
          </Group>
        </form>
      </Card>
    </div>
  );
};

export default CloudProviderCreate;