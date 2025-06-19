import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateTenant } from '../../hooks';
import { PageHeader } from '../../components/layout';
import { ErrorDisplay, LoadingSpinner } from '../../components/common';
import { Button, TextInput, Card, Group, Title, Text, Paper, Container, Select, Stack, Alert } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconArrowLeft, IconDeviceFloppy, IconBuildingSkyscraper, IconAlertCircle, IconCloud } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useTenants } from '../../hooks/useTenants';
import { useCloudProvider } from '../../context/CloudProviderContext';
import { Permission, usePermissions } from '../../utils/permissions';
import { useLoadingState } from '../../hooks/useLoadingState';

// Enhanced tenant schema with optional cloud provider
const tenantSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  cloudProviderId: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

const TenantCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, roles } = useAuth();
  const permissions = usePermissions(roles);
  const { currentTenant, isLoadingCurrentTenant } = useTenants();
  const { createTenant, isCreating, error, isSuccess } = useCreateTenant();
  const { cloudProviders, isLoadingProviders } = useCloudProvider();
  const loadingState = useLoadingState();

  const isSuperAdmin = permissions.isSuperAdmin();
  
  // Prepare cloud provider options for the select input
  const cloudProviderOptions = React.useMemo(() => {
    return cloudProviders.map(provider => ({
      value: provider._id || provider.id || '',
      label: provider.name,
    }));
  }, [cloudProviders]);

  const form = useForm<TenantFormValues>({
    initialValues: {
      name: '',
      cloudProviderId: '',
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

  const handleSubmit = async (values: TenantFormValues) => {
    try {
      loadingState.startLoading();
      
      // Create the tenant
      await createTenant(values, {
        onSuccess: () => {
          loadingState.setSuccess();
          navigate('/');
        },
        onError: (error) => {
          loadingState.setError(error instanceof Error ? error : new Error('Failed to create tenant'));
        }
      });
    } catch (error) {
      loadingState.setError(error instanceof Error ? error : new Error('Failed to create tenant'));
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isLoadingCurrentTenant || isLoadingProviders) {
    return <LoadingSpinner />;
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    navigate('/login', { state: { from: location } });
    return null;
  }
  
  // Check if user has permission to create tenants
  const canCreateTenant = isSuperAdmin || 
    permissions.can(Permission.MANAGE_TENANTS) || 
    (!currentTenant && permissions.can(Permission.CREATE_PROJECTS));

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

      {!canCreateTenant && (
        <Alert icon={<IconAlertCircle size={16} />} title="Permission Denied" color="red" mb="xl">
          You do not have permission to create a tenant. Please contact your administrator.
        </Alert>
      )}

      {error && <ErrorDisplay error={error} className="mt-4" />}
      {loadingState.isError && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="xl">
          {loadingState.error?.message || 'An error occurred while creating the tenant.'}
        </Alert>
      )}

      {canCreateTenant && (
        <Card shadow="sm" p="lg" radius="md" withBorder className="mt-6">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="md">
              <TextInput
                label="Organization Name"
                description="Enter the name of your organization or team"
                placeholder="e.g., Acme Corporation, My Team, etc."
                required
                size="lg"
                {...form.getInputProps('name')}
              />

              <Select
                label="Cloud Provider"
                description="Select a cloud provider for your tenant (optional)"
                placeholder="Select a cloud provider"
                icon={<IconCloud size={16} />}
                data={cloudProviderOptions}
                clearable
                searchable
                {...form.getInputProps('cloudProviderId')}
              />

              {cloudProviderOptions.length === 0 && (
                <Alert icon={<IconAlertCircle size={16} />} title="No Cloud Providers" color="yellow">
                  No cloud providers are available. You can still create a tenant and add a cloud provider later.
                </Alert>
              )}
            </Stack>

            <Group style={{ justifyContent: 'space-between' }} mt="xl">
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
                loading={isCreating || loadingState.isLoading}
                size="lg"
                color="teal"
              >
                Create Tenant
              </Button>
            </Group>
          </form>
        </Card>
      )}
    </Container>
  );
};

export default TenantCreate;