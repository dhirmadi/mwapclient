import React, { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Textarea, Button, Paper, Title, Text, Group, Switch, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../../../components/layout';
import { useAuth } from '../../../../context/AuthContext';
import { useTenants } from '../../../../hooks/useTenants';
import { Tenant } from '../../../../types/tenant';
import { LoadingSpinner } from '../../../../components/common';

const TenantSettings: React.FC = () => {
  const { roles } = useAuth();
  const tenantId = roles.tenantId;
  const { updateTenant } = useUpdateTenant();
  const { tenant, isLoading: loading } = useTenant(tenantId);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      isActive: true,
      settings: {
        allowExternalSharing: false,
        enforceStrongPasswords: true,
        defaultStorageQuota: 5,
      },
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
      contactEmail: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  useEffect(() => {
    const loadTenant = async () => {
      try {
        setLoading(true);
        const tenantData = await fetchTenant();
        setTenant(tenantData);
        
        // Update form values
        form.setValues({
          name: tenantData.name,
          description: tenantData.description || '',
          contactEmail: tenantData.contactEmail || '',
          contactPhone: tenantData.contactPhone || '',
          website: tenantData.website || '',
          isActive: tenantData.isActive,
          settings: {
            allowExternalSharing: tenantData.settings?.allowExternalSharing || false,
            enforceStrongPasswords: tenantData.settings?.enforceStrongPasswords || true,
            defaultStorageQuota: tenantData.settings?.defaultStorageQuota || 5,
          },
        });
      } catch (error) {
        console.error('Failed to load tenant:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load tenant settings',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    if (roles?.tenantId) {
      loadTenant();
    }
  }, [roles?.tenantId]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!tenant || !roles?.tenantId) return;
    
    try {
      setSaving(true);
      await updateTenant({ id: tenantId, data: values });
      
      notifications.show({
        title: 'Success',
        message: 'Tenant settings updated successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to update tenant:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update tenant settings',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Tenant Settings"
        description="Manage your organization's settings"
      />

      <Paper withBorder p="md" mt="md" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={saving} />
          
          <Title order={3} mb="md">General Information</Title>
          
          <TextInput
            label="Tenant Name"
            placeholder="Enter tenant name"
            required
            mb="md"
            {...form.getInputProps('name')}
          />
          
          <Textarea
            label="Description"
            placeholder="Enter tenant description"
            mb="md"
            {...form.getInputProps('description')}
          />
          
          <TextInput
            label="Contact Email"
            placeholder="contact@example.com"
            required
            mb="md"
            {...form.getInputProps('contactEmail')}
          />
          
          <TextInput
            label="Contact Phone"
            placeholder="+1 (123) 456-7890"
            mb="md"
            {...form.getInputProps('contactPhone')}
          />
          
          <TextInput
            label="Website"
            placeholder="https://example.com"
            mb="md"
            {...form.getInputProps('website')}
          />
          
          <Switch
            label="Active"
            description="Deactivating will suspend all tenant operations"
            checked={form.values.isActive}
            mb="xl"
            {...form.getInputProps('isActive', { type: 'checkbox' })}
          />
          
          <Title order={3} mb="md">Security Settings</Title>
          
          <Switch
            label="Allow External Sharing"
            description="Enable sharing files with users outside your organization"
            mb="md"
            {...form.getInputProps('settings.allowExternalSharing', { type: 'checkbox' })}
          />
          
          <Switch
            label="Enforce Strong Passwords"
            description="Require complex passwords for all users"
            mb="xl"
            {...form.getInputProps('settings.enforceStrongPasswords', { type: 'checkbox' })}
          />
          
          <TextInput
            label="Default Storage Quota (GB)"
            type="number"
            mb="xl"
            {...form.getInputProps('settings.defaultStorageQuota')}
          />
          
          <Group justify="flex-end">
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
};

export default TenantSettings;