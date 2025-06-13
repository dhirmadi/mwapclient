import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant, useUpdateTenant } from '../../../hooks';
import { PageHeader } from '../../../components/layout';
import { LoadingSpinner, ErrorDisplay } from '../../../components/common';
import { Button, TextInput, Switch, Card, Group } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

const tenantSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  active: z.boolean(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

const TenantEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tenant, isLoading: isFetching, error: fetchError } = useTenant(id || '');
  const { updateTenant, isUpdating, error: updateError } = useUpdateTenant();

  const form = useForm<TenantFormValues>({
    initialValues: {
      name: '',
      active: true,
    },
    validate: zodResolver(tenantSchema),
  });

  useEffect(() => {
    if (tenant) {
      form.setValues({
        name: tenant.name,
        active: tenant.active,
      });
    }
  }, [tenant]);

  const handleSubmit = (values: TenantFormValues) => {
    updateTenant({ 
      id: id || '', 
      data: values 
    }, {
      onSuccess: () => {
        navigate(`/tenants/${id}`);
      },
    });
  };

  const handleBack = () => {
    navigate(`/tenants/${id}`);
  };

  if (isFetching) {
    return <LoadingSpinner size="xl" text="Loading tenant..." />;
  }

  if (fetchError) {
    return <ErrorDisplay error={fetchError} />;
  }

  if (!tenant) {
    return (
      <div>
        <PageHeader
          title="Tenant Not Found"
          description="The requested tenant could not be found"
        >
          <Button leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/tenants')}>
            Back to Tenants
          </Button>
        </PageHeader>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit Tenant: ${tenant.name}`}
        description={`Tenant ID: ${tenant.id}`}
      >
        <Button leftSection={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack}>
          Back
        </Button>
      </PageHeader>

      {updateError && <ErrorDisplay error={updateError} className="mt-4" />}

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

          <Group style={{ justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              leftSection={<IconDeviceFloppy size={16} />}
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

export default TenantEdit;