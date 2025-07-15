import React, { useState, useEffect } from 'react';
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
  IconSettings, 
  IconDeviceFloppy, 
  IconAlertCircle,
  IconInfoCircle,
  IconUser,
  IconShield
} from '@tabler/icons-react';
import { useTenants } from '../hooks/useTenants';
import { TenantUpdate } from '../types';

const TenantSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [hasChanges, setHasChanges] = useState(false);
  
  const { 
    currentTenant, 
    isLoadingCurrentTenant, 
    currentTenantError,
    updateTenant, 
    isUpdating, 
    updateError 
  } = useTenants();

  // Form for tenant settings
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
    if (currentTenant) {
      const initialValues = {
        name: currentTenant.name,
        settings: {
          allowPublicProjects: currentTenant.settings.allowPublicProjects,
          maxProjects: currentTenant.settings.maxProjects,
        },
      };
      
      form.setValues(initialValues);
    }
  }, [currentTenant]);

  // Track form changes
  useEffect(() => {
    if (currentTenant) {
      const currentValues = form.values;
      const originalValues = {
        name: currentTenant.name,
        settings: {
          allowPublicProjects: currentTenant.settings.allowPublicProjects,
          maxProjects: currentTenant.settings.maxProjects,
        },
      };
      
      const changed = (
        currentValues.name !== originalValues.name ||
        currentValues.settings?.allowPublicProjects !== originalValues.settings.allowPublicProjects ||
        currentValues.settings?.maxProjects !== originalValues.settings.maxProjects
      );
      
      setHasChanges(changed);
    }
  }, [form.values, currentTenant]);

  // Reset form to original values
  const resetForm = () => {
    if (currentTenant) {
      form.setValues({
        name: currentTenant.name,
        settings: {
          allowPublicProjects: currentTenant.settings.allowPublicProjects,
          maxProjects: currentTenant.settings.maxProjects,
        },
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (values: TenantUpdate) => {
    if (!currentTenant) return;
    
    try {
      // Only send changed fields
      const changedFields: TenantUpdate = {};
      
      if (values.name !== currentTenant.name) {
        changedFields.name = values.name;
      }
      
      if (values.settings?.allowPublicProjects !== currentTenant.settings.allowPublicProjects ||
          values.settings?.maxProjects !== currentTenant.settings.maxProjects) {
        changedFields.settings = values.settings;
      }
      
      // If no changes, just return
      if (Object.keys(changedFields).length === 0) {
        return;
      }
      
      // Update tenant
      await updateTenant({ id: currentTenant.id, data: changedFields });
      
      console.log('Tenant settings updated successfully');
    } catch (error) {
      console.error('Failed to update tenant settings:', error);
    }
  };

  // Loading state
  if (isLoadingCurrentTenant) {
    return (
      <div>
        <Group justify="space-between" mb="md">
          <div>
            <Skeleton height={32} width={200} mb="xs" />
            <Skeleton height={20} width={300} />
          </div>
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
  if (currentTenantError || !currentTenant) {
    return (
      <div>
        <Group justify="space-between" mb="md">
          <div>
            <Title order={2}>Tenant Settings</Title>
            <Text c="dimmed">Manage your tenant configuration</Text>
          </div>
        </Group>

        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
        >
          {currentTenantError instanceof Error ? currentTenantError.message : 'Failed to load tenant data'}
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Group align="center" gap="sm">
            <Title order={2}>Tenant Settings</Title>
            <Badge 
              color={currentTenant.archived ? 'gray' : 'green'} 
              variant="light"
            >
              {currentTenant.archived ? 'Archived' : 'Active'}
            </Badge>
          </Group>
          <Text c="dimmed">Manage your tenant configuration and preferences</Text>
        </div>
      </Group>

      {updateError && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
          mb="md"
        >
          {updateError instanceof Error ? updateError.message : 'An error occurred while updating settings'}
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
                description="The display name for your tenant organization"
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
                Configure how projects in your tenant can be accessed and shared.
              </Alert>
              
              <Switch
                label="Allow Public Projects"
                description="When enabled, projects can be made publicly accessible without authentication"
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
                  <Code>{currentTenant.id}</Code>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Owner ID:</Text>
                  <Code>{currentTenant.ownerId}</Code>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Created:</Text>
                  <Text size="sm">{new Date(currentTenant.createdAt).toLocaleString()}</Text>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Last Updated:</Text>
                  <Text size="sm">{new Date(currentTenant.updatedAt).toLocaleString()}</Text>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Status:</Text>
                  <Badge 
                    color={currentTenant.archived ? 'gray' : 'green'} 
                    variant="light"
                  >
                    {currentTenant.archived ? 'Archived' : 'Active'}
                  </Badge>
                </Group>
              </Stack>
              
              <Divider my="xl" />
              
              <Alert 
                icon={<IconInfoCircle size={16} />} 
                title="Need Help?" 
                color="blue"
              >
                If you need to modify advanced settings or have questions about your tenant configuration, 
                please contact your system administrator.
              </Alert>
            </Tabs.Panel>
          </Tabs>
          
          <Group justify="space-between" mt="xl">
            <Group>
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

export default TenantSettingsPage;