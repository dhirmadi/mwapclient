import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateTenant } from '../../hooks';
import { PageHeader } from '../../components/layout';
import { ErrorDisplay, LoadingSpinner } from '../../components/common';
import { Button, TextInput, Card, Group, Title, Text, Paper, Container } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconArrowLeft, IconDeviceFloppy, IconBuildingSkyscraper } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useTenants } from '../../hooks/useTenants';

const tenantSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

const TenantCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const { currentTenant, isLoadingCurrentTenant } = useTenants();
  const { createTenant, isCreating, error, isSuccess } = useCreateTenant();

  const form = useForm<TenantFormValues>({
    initialValues: {
      name: '',
    },
    validate: zodResolver(tenantSchema),
  });

  // Check if user already has a tenant or is a super admin
  React.useEffect(() => {
    if (!isLoadingCurrentTenant && !isCreating) {
      if (currentTenant && !isSuperAdmin) {
        // User already has a tenant, redirect to home
        navigate('/');
      }
    }
    
    if (isSuccess) {
      // Redirect to home after successful creation
      navigate('/');
    }
  }, [currentTenant, isLoadingCurrentTenant, isCreating, isSuccess, isSuperAdmin, navigate]);

  const handleSubmit = (values: TenantFormValues) => {
    createTenant(values, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isLoadingCurrentTenant) {
    return <LoadingSpinner />;
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    navigate('/login', { state: { from: location } });
    return null;
  }

  return (
    <Container size="md" py="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder mb="xl">
        <Group mb="md">
          <IconBuildingSkyscraper size={32} color="teal" />
          <Title order={1} color="teal">Create Your Tenant</Title>
        </Group>
        <Text size="lg" mb="xl" color="dimmed">
          A tenant is your organization's workspace on the platform. Create your tenant to get started.
        </Text>
      </Paper>

      {error && <ErrorDisplay error={error} className="mt-4" />}

      <Card shadow="sm" p="lg" radius="md" withBorder className="mt-6">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Organization Name"
            description="Enter the name of your organization or team"
            placeholder="e.g., Acme Corporation, My Team, etc."
            required
            size="lg"
            {...form.getInputProps('name')}
            className="mb-6"
          />

          <Group style={{ justifyContent: 'space-between' }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              leftSection={<IconArrowLeft size={16} />}
            >
              Back to Home
            </Button>
            <Button
              type="submit"
              leftSection={<IconDeviceFloppy size={16} />}
              loading={isCreating}
              size="lg"
              color="teal"
            >
              Create Tenant
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
};

export default TenantCreate;