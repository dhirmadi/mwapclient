import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTenant } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { ErrorDisplay } from '@/components/common';
import { Button, TextInput, Switch, Card, Group } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

const tenantSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  active: z.boolean().default(true),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

const TenantCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate, isLoading, error } = useCreateTenant();

  const form = useForm<TenantFormValues>({
    initialValues: {
      name: '',
      active: true,
    },
    validate: zodResolver(tenantSchema),
  });

  const handleSubmit = (values: TenantFormValues) => {
    mutate(values, {
      onSuccess: () => {
        navigate('/tenants');
      },
    });
  };

  const handleBack = () => {
    navigate('/tenants');
  };

  return (
    <div>
      <PageHeader
        title="Create Tenant"
        description="Add a new tenant to the platform"
      >
        <Button leftIcon={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack}>
          Back
        </Button>
      </PageHeader>

      {error && <ErrorDisplay error={error} className="mt-4" />}

      <Card shadow="sm" p="lg" radius="md" withBorder className="mt-6">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Tenant Name"
            placeholder="Enter tenant name"
            required
            {...form.getInputProps('name')}
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

export default TenantCreate;