import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Divider
} from '@mantine/core';
import { 
  IconDeviceFloppy, 
  IconArrowLeft,
  IconAlertCircle,
  IconInfoCircle,
  IconSettings,
  IconShield
} from '@tabler/icons-react';
import { useTenants } from '../hooks/useTenants';
import { TenantCreate } from '../types';

const TenantCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>('general');
  
  const { createTenant, isCreating, createError } = useTenants();

  // Form for tenant creation
  const form = useForm<TenantCreate>({
    initialValues: {
      name: '',
      settings: {
        allowPublicProjects: false,
        maxProjects: 10,
      },
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
      settings: {
        maxProjects: (value) => (value && (value < 1 || value > 100) ? 'Max projects must be between 1 and 100' : null),
      },
    },
  });

  // Handle form submission
  const handleSubmit = async (values: TenantCreate) => {
    try {
      await createTenant(values);
      
      console.log('Tenant created successfully');
      
      // Navigate back to tenant list
      navigate('/admin/tenants');
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
  };

  const handleBack = () => {
    navigate('/admin/tenants');
  };

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Create New Tenant</Title>
          <Text c="dimmed">Set up a new tenant organization</Text>
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

      {createError && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
          mb="md"
        >
          {createError instanceof Error ? createError.message : 'An error occurred while creating the tenant'}
        </Alert>
      )}

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isCreating} />
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="md">
              <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
                General Information
              </Tabs.Tab>
              <Tabs.Tab value="settings" leftSection={<IconShield size={16} />}>
                Initial Settings
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general">
              <Title order={3} mb="md">General Information</Title>
              
              <Alert 
                icon={<IconInfoCircle size={16} />} 
                title="Tenant Creation" 
                color="blue" 
                mb="md"
              >
                A tenant represents an organization or group that can manage projects and resources independently.
              </Alert>
              
              <TextInput
                label="Tenant Name"
                placeholder="Enter tenant organization name"
                description="This will be the display name for the tenant organization"
                required
                mb="xl"
                {...form.getInputProps('name')}
              />
            </Tabs.Panel>

            <Tabs.Panel value="settings">
              <Title order={3} mb="md">Initial Settings</Title>
              
              <Alert 
                icon={<IconInfoCircle size={16} />} 
                title="Default Configuration" 
                color="blue" 
                mb="md"
              >
                These settings can be modified later by the tenant owner or system administrators.
              </Alert>
              
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
              
              <Divider my="xl" />
              
              <Title order={4} mb="md">Project Permissions</Title>
              
              <Switch
                label="Allow Public Projects"
                description="When enabled, projects in this tenant can be made publicly accessible"
                checked={form.values.settings?.allowPublicProjects}
                mb="xl"
                {...form.getInputProps('settings.allowPublicProjects', { type: 'checkbox' })}
              />
              
              <Paper withBorder p="md" bg="gray.0">
                <Title order={5} mb="sm">Configuration Summary</Title>
                <Stack gap="xs">
                  <Group>
                    <Text size="sm" fw={500}>Tenant Name:</Text>
                    <Text size="sm">{form.values.name || 'Not specified'}</Text>
                  </Group>
                  <Group>
                    <Text size="sm" fw={500}>Max Projects:</Text>
                    <Text size="sm">{form.values.settings?.maxProjects}</Text>
                  </Group>
                  <Group>
                    <Text size="sm" fw={500}>Public Projects:</Text>
                    <Text size="sm">
                      {form.values.settings?.allowPublicProjects ? 'Allowed' : 'Disabled'}
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            </Tabs.Panel>
          </Tabs>
          
          <Group justify="flex-end" mt="xl">
            <Button 
              variant="default" 
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              leftSection={<IconDeviceFloppy size={16} />}
              loading={isCreating}
              disabled={!form.isValid()}
            >
              Create Tenant
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
};

export default TenantCreatePage;