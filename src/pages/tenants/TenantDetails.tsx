import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant } from '../../hooks';
import { PageHeader } from '../../components/layout';
import { LoadingSpinner, ErrorDisplay } from '../../components/common';
import { Button, Card, Group, Text, Badge, Tabs } from '@mantine/core';
import { IconEdit, IconArrowLeft, IconUsers, IconSettings } from '@tabler/icons-react';

const TenantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tenant, isLoading, error } = useTenant(id || '');
  
  // Debug logging
  React.useEffect(() => {
    console.log('TenantDetails - ID:', id);
    console.log('TenantDetails - Tenant data:', tenant);
    console.log('TenantDetails - Loading:', isLoading);
    console.log('TenantDetails - Error:', error);
  }, [id, tenant, isLoading, error]);

  const handleBack = () => {
    navigate('/admin/tenants');
  };

  const handleEdit = () => {
    navigate(`/admin/tenants/${id}/edit`);
  };

  if (isLoading) {
    return <LoadingSpinner size="xl" text="Loading tenant details..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!tenant) {
    return (
      <div>
        <PageHeader
          title="Tenant Not Found"
          description="The requested tenant could not be found"
        >
          <Button leftSection={<IconArrowLeft size={16} />} onClick={handleBack}>
            Back to Tenants
          </Button>
        </PageHeader>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={tenant.name}
        description={`Tenant ID: ${tenant.id || tenant._id}`}
      >
        <Button leftSection={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack} className="mr-2">
          Back
        </Button>
        <Button leftSection={<IconEdit size={16} />} onClick={handleEdit}>
          Edit
        </Button>
      </PageHeader>

      <div className="mt-6">
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Group style={{ justifyContent: 'space-between' }} mb="md">
            <div>
              <Text fw={500} size="lg">Tenant Information</Text>
            </div>
            <Badge color={tenant.active === false || tenant.archived === true ? 'red' : 'green'}>
              {tenant.active === false || tenant.archived === true ? 'Inactive' : 'Active'}
            </Badge>
          </Group>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text size="sm" color="dimmed">Name</Text>
              <Text>{tenant.name}</Text>
            </div>
            <div>
              <Text size="sm" color="dimmed">Created</Text>
              <Text>{new Date(tenant.createdAt).toLocaleString()}</Text>
            </div>
            {tenant.updatedAt && (
              <div>
                <Text size="sm" color="dimmed">Last Updated</Text>
                <Text>{new Date(tenant.updatedAt).toLocaleString()}</Text>
              </div>
            )}
            <div>
              <Text size="sm" color="dimmed">Owner ID</Text>
              <Text>{tenant.ownerId || 'No owner assigned'}</Text>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <Tabs defaultValue="users">
            <Tabs.List>
              <Tabs.Tab value="users" leftSection={<IconUsers size={14} />}>Users</Tabs.Tab>
              <Tabs.Tab value="settings" leftSection={<IconSettings size={14} />}>Settings</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="users" pt="xs">
              <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                <Text>Tenant users will be displayed here</Text>
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="settings" pt="xs">
              <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                <Text>Tenant settings will be displayed here</Text>
              </Card>
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TenantDetails;