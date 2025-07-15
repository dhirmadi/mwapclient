import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { 
  Title, 
  Text, 
  Paper, 
  Button, 
  Group, 
  TextInput,
  NumberInput,
  Switch,
  LoadingOverlay,
  Alert,
  Tabs,
  Stack,
  Divider,
  Badge,
  Code,
  Skeleton
} from '@mantine/core';
import { 
  IconDeviceFloppy, 
  IconArrowLeft,
  IconAlertCircle,
  IconInfoCircle,
  IconSettings,
  IconShield,
  IconUser
} from '@tabler/icons-react';
import { useTenants } from '../hooks/useTenants';
import { TenantUpdate } from '../types';

const TenantEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [hasChanges, setHasChanges] = useState(false);
  
  const { 
    useTenant, 
    updateTenant, 
    isUpdating, 
    updateError 
  } = useTenants();
  
  // Fetch the tenant data
  const { 
    data: tenant, 
    isLoading: isLoadingTenant, 
    error: fetchError 
  } = useTenant(id);

  // Form for tenant editing
  const form = useForm<TenantUpdate>({
    initialValues: {
      name: '',
      settings: {
        allowPublicProjects: false,
        maxProjects: 10,
      },
    },
    validate: {
      name: (value) => (value && value.length < 3 ? 'Name must be at least 3 characters' : null),
      settings: {
        maxProjects: (value) => (value && (value < 1 || value > 100) ? 'Max projects must be between 1 and 100' : null),
      },
    },
  });

  // Initialize form when tenant data is loaded
  useEffect(() => {
    if (tenant) {
      const initialValues = {
        name: tenant.name,
        settings: {
          allowPublicProjects: tenant.settings.allowPublicProjects,
          maxProjects: tenant.settings.maxProjects,
        },
      };
      
      form.setValues(initialValues);
    }
  }, [tenant]);

  // Track form changes
  useEffect(() => {
    if (tenant) {
      const currentValues = form.values;
      const originalValues = {
        name: tenant.name,
        settings: {
          allowPublicProjects: tenant.settings.allowPublicProjects,
          maxProjects: tenant.settings.maxProjects,
        },
      };
      
      const changed = (
        currentValues.name !== originalValues.name ||
        currentValues.settings?.allowPublicProjects !== originalValues.settings.allowPublicProjects ||
        currentValues.settings?.maxProjects !== originalValues.settings.maxProjects
      );
      
      setHasChanges(changed);
    }
  }, [form.values, tenant]);

  // Reset form to original values
  const resetForm = () => {
    if (tenant) {
      form.setValues({
        name: tenant.name,
        settings: {
          allowPublicProjects: tenant.settings.allowPublicProjects,
          maxProjects: tenant.settings.maxProjects,
        },
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (values: TenantUpdate) => {
    if (!id) return;
    
    try {
      // Only send changed fields
      const changedFields: TenantUpdate = {};
      
      if (tenant) {
        if (values.name !== tenant.name) changedFields.name = values.name;
        if (values.settings?.allowPublicProjects !== tenant.settings.allowPublicProjects ||
            values.settings?.maxProjects !== tenant.settings.maxProjects) {
          changedFields.settings = values.settings;
        }
      }
      
      // If no changes, just navigate back
      if (Object.keys(changedFields).length === 0) {
        navigate('/admin/tenants');
        return;
      }
      
      // Update tenant
      await updateTenant({ id, data: changedFields });
      
      console.log('Tenant updated successfully');
      
      // Navigate back to tenant list
      navigate('/admin/tenants');
    } catch (error) {
      console.error('Failed to update tenant:', error);
    }
  };

  const handleBack = () => {
    navigate('/admin/tenants');
  };

  // Loading state
  if (isLoadingTenant) {
    return (
      <div>
        <Group justify="space-between" mb="md">
          <div>
            <Skeleton height={32} width={200} mb="xs" />
            <Skeleton height={20} width={300} />
          </div>
        </Group>

        <Group justify="flex-start" mb="md">
          <Skeleton height={36} width={180} />
        </Group>

        <Paper withBorder p="md" radius="md">
          <Skeleton height={24} width={150} mb="md" />
          <Skeleton height={40} mb="md" />
          <Skeleton height={40} mb="md" />
          <Skeleton height={100} />
        </Paper>
      </div>
    );
  }

  // Error state
  if (fetchError || !tenant) {
    return (
      <div>
        <Group justify="space-between" mb="md">
          <div>
            <Title order={2}>Edit Tenant</Title>
            <Text c="dimmed">Modify tenant settings</Text>
          </div>
        </Group>

        <Group justify="flex-start" mb="md">
          <Button 
            variant="outline" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back to Tenants
          </Button>
        </Group>

        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
        >
          {fetchError instanceof Error ? fetchError.message : 'Tenant not found'}
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Group align="center" gap="sm">
            <Title order={2}>Edit Tenant</Title>
            <Badge 
              color={tenant.archived ? 'gray' : 'green'} 
              variant="light"
            >
              {tenant.archived ? 'Archived' : 'Active'}
            </Badge>
          </Group>
          <Text c="dimmed">Modify tenant settings and configuration</Text>
        </div>
      </Group>

      <Group justify="flex-start" mb="md">
        <Button 
          variant="outline" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleBack}
        >
          Back to Tenants
        </Button>
      </Group>

      {updateError && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
          mb="md"
        >
          {updateError instanceof Error ? updateError.message : 'An error occurred while updating the tenant'}
        </Alert>
      )}

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isUpdating} />
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="md">
              <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
                General Settings
              </Tabs.Tab>
              <Tabs.Tab value="permissions" leftSection={<IconShield size={16} />}>
                Project Permissions
              </Tabs.Tab>
              <Tabs.Tab value="info" leftSection={<IconUser size={16} />}>
                Tenant Information
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general">
              <Title order={3} mb="md">General Settings</Title>
              
              <TextInput
                label="Tenant Name"
                placeholder="Enter tenant name"
                description="The display name for this tenant organization"
                required
                mb="md"
                {...form.getInputProps('name')}
              />
              
              <Divider my="xl" />
              
              <Title order={4} mb="md">Project Limits</Title>
              
              <NumberInput
                label="Maximum Projects"
                placeholder="Enter maximum number of projects"
                description="The maximum number of projects that can be created in this tenant"
                min={1}
                max={100}
                mb="md"
                {...form.getInputProps('settings.maxProjects')}
              />
            </Tabs.Panel>

            <Tabs.Panel value="permissions">
              <Title order={3} mb="md">Project Permissions</Title>
              
              <Alert 
                icon={<IconInfoCircle size={16} />} 
                title="Project Visibility" 
                color="blue" 
                mb="md"
              >
                Configure how projects in this tenant can be accessed and shared.
              </Alert>
              
              <Switch
                label="Allow Public Projects"
                description="When enabled, projects in this tenant can be made publicly accessible"
                checked={form.values.settings?.allowPublicProjects}
                mb="xl"
                {...form.getInputProps('settings.allowPublicProjects', { type: 'checkbox' })}
              />
              
              <Paper withBorder p="md" bg="gray.0">
                <Title order={5} mb="sm">Current Settings Summary</Title>
                <Stack gap="xs">
                  <Group>
                    <Text size="sm" fw={500}>Max Projects:</Text>
                    <Badge variant="light">{form.values.settings?.maxProjects}</Badge>
                  </Group>
                  <Group>
                    <Text size="sm" fw={500}>Public Projects:</Text>
                    <Badge 
                      color={form.values.settings?.allowPublicProjects ? 'green' : 'gray'}
                      variant="light"
                    >
                      {form.values.settings?.allowPublicProjects ? 'Allowed' : 'Disabled'}
                    </Badge>
                  </Group>
                </Stack>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="info">
              <Title order={3} mb="md">Tenant Information</Title>
              
              <Stack gap="md">
                <Group>
                  <Text fw={500} size="sm">Tenant ID:</Text>
                  <Code>{tenant.id}</Code>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Owner ID:</Text>
                  <Code>{tenant.ownerId}</Code>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Created:</Text>
                  <Text size="sm">{new Date(tenant.createdAt).toLocaleString()}</Text>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Last Updated:</Text>
                  <Text size="sm">{new Date(tenant.updatedAt).toLocaleString()}</Text>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Status:</Text>
                  <Badge 
                    color={tenant.archived ? 'gray' : 'green'} 
                    variant="light"
                  >
                    {tenant.archived ? 'Archived' : 'Active'}
                  </Badge>
                </Group>
              </Stack>
              
              <Divider my="xl" />
              
              <Alert 
                icon={<IconInfoCircle size={16} />} 
                title="Archive Status" 
                color="blue"
              >
                To archive or unarchive this tenant, use the archive toggle in the tenant list page. 
                Archived tenants cannot create new projects or access existing resources.
              </Alert>
            </Tabs.Panel>
          </Tabs>
          
          <Group justify="space-between" mt="xl">
            <Group>
              <Button 
                variant="default" 
                onClick={handleBack}
              >
                Cancel
              </Button>
              {hasChanges && (
                <Button 
                  variant="subtle" 
                  onClick={resetForm}
                >
                  Reset Changes
                </Button>
              )}
            </Group>
            
            <Button 
              type="submit" 
              leftSection={<IconDeviceFloppy size={16} />}
              loading={isUpdating}
              disabled={!form.isValid() || !hasChanges}
            >
              {hasChanges ? 'Save Changes' : 'No Changes'}
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
};

export default TenantEditPage;