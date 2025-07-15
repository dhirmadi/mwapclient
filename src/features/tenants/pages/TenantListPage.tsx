import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Title, 
  Text, 
  Paper, 
  Button, 
  Group, 
  Table, 
  Badge, 
  ActionIcon, 
  Tooltip, 
  LoadingOverlay,
  Alert,
  Modal,
  Stack,
  Switch,
  Skeleton
} from '@mantine/core';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye,
  IconAlertCircle,
  IconArchive,
  IconArchiveOff,
  IconSettings,
  IconUsers
} from '@tabler/icons-react';
import { useTenants } from '../hooks/useTenants';
import { Tenant } from '../types';

const TenantListPage: React.FC = () => {
  const navigate = useNavigate();
  const [includeArchived, setIncludeArchived] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  
  const { 
    tenants, 
    isLoading, 
    error, 
    deleteTenant, 
    isDeleting, 
    deleteError,
    updateTenant,
    isUpdating,
    updateError
  } = useTenants(includeArchived);

  const handleCreate = () => {
    navigate('/admin/tenants/create');
  };

  const handleView = (id: string) => {
    navigate(`/admin/tenants/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/tenants/${id}/edit`);
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
  };

  const handleDeleteConfirm = async () => {
    if (tenantToDelete) {
      try {
        await deleteTenant(tenantToDelete.id);
        setTenantToDelete(null);
      } catch (error) {
        console.error('Failed to delete tenant:', error);
      }
    }
  };

  const handleArchiveToggle = async (tenant: Tenant) => {
    try {
      await updateTenant({
        id: tenant.id,
        data: { archived: !tenant.archived }
      });
    } catch (error) {
      console.error('Failed to toggle tenant archive status:', error);
    }
  };

  const handleDeleteCancel = () => {
    setTenantToDelete(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <Group justify="space-between" mb="md">
          <div>
            <Skeleton height={32} width={200} mb="xs" />
            <Skeleton height={20} width={300} />
          </div>
          <Skeleton height={36} width={120} />
        </Group>

        <Paper withBorder p="md" radius="md">
          <Skeleton height={24} width={150} mb="md" />
          <Stack gap="sm">
            {[...Array(5)].map((_, i) => (
              <Group key={i} justify="space-between">
                <Skeleton height={20} width="60%" />
                <Skeleton height={20} width={100} />
              </Group>
            ))}
          </Stack>
        </Paper>
      </div>
    );
  }

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Tenant Management</Title>
          <Text c="dimmed">Manage all tenants in the system</Text>
        </div>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={handleCreate}
        >
          Create Tenant
        </Button>
      </Group>

      {(error || deleteError || updateError) && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
          mb="md"
        >
          {error instanceof Error ? error.message : 
           deleteError instanceof Error ? deleteError.message :
           updateError instanceof Error ? updateError.message :
           'An error occurred'}
        </Alert>
      )}

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isDeleting || isUpdating} />
        
        <Group justify="space-between" mb="md">
          <Title order={3}>
            {includeArchived ? 'All Tenants' : 'Active Tenants'} 
            {tenants && ` (${tenants.length})`}
          </Title>
          <Switch
            label="Include Archived"
            checked={includeArchived}
            onChange={(event) => setIncludeArchived(event.currentTarget.checked)}
          />
        </Group>

        {tenants && tenants.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Owner ID</Table.Th>
                <Table.Th>Settings</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tenants.map((tenant: Tenant) => (
                <Table.Tr key={tenant.id}>
                  <Table.Td>
                    <Text fw={500}>{tenant.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" style={{ fontFamily: 'monospace' }}>
                      {tenant.ownerId}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">Max Projects:</Text>
                        <Badge size="xs" variant="light">
                          {tenant.settings.maxProjects}
                        </Badge>
                      </Group>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">Public Projects:</Text>
                        <Badge 
                          size="xs" 
                          color={tenant.settings.allowPublicProjects ? 'green' : 'gray'}
                          variant="light"
                        >
                          {tenant.settings.allowPublicProjects ? 'Allowed' : 'Disabled'}
                        </Badge>
                      </Group>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      color={tenant.archived ? 'gray' : 'green'} 
                      variant="light"
                    >
                      {tenant.archived ? 'Archived' : 'Active'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="View Details">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleView(tenant.id)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Edit Tenant">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEdit(tenant.id)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={tenant.archived ? "Unarchive Tenant" : "Archive Tenant"}>
                        <ActionIcon
                          variant="subtle"
                          color={tenant.archived ? "green" : "orange"}
                          onClick={() => handleArchiveToggle(tenant)}
                        >
                          {tenant.archived ? <IconArchiveOff size={16} /> : <IconArchive size={16} />}
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete Tenant">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteClick(tenant)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <IconUsers size={48} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed" mt="md">
              {includeArchived ? 'No tenants found' : 'No active tenants found'}
            </Text>
            <Button 
              mt="md"
              leftSection={<IconPlus size={16} />}
              onClick={handleCreate}
            >
              Create Your First Tenant
            </Button>
          </div>
        )}
      </Paper>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!tenantToDelete}
        onClose={handleDeleteCancel}
        title="Delete Tenant"
        centered
      >
        <Stack gap="md">
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Warning" 
            color="red"
          >
            This action cannot be undone. Deleting a tenant will permanently remove:
          </Alert>
          
          <Stack gap="xs" ml="md">
            <Text size="sm">• All tenant data and settings</Text>
            <Text size="sm">• All associated projects</Text>
            <Text size="sm">• All cloud provider integrations</Text>
            <Text size="sm">• All project files and resources</Text>
          </Stack>

          {tenantToDelete && (
            <Paper withBorder p="sm" bg="gray.0">
              <Text size="sm">
                <strong>Tenant:</strong> {tenantToDelete.name}
              </Text>
              <Text size="sm" c="dimmed">
                <strong>Owner:</strong> {tenantToDelete.ownerId}
              </Text>
            </Paper>
          )}

          <Group justify="flex-end" mt="md">
            <Button 
              variant="default" 
              onClick={handleDeleteCancel}
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={handleDeleteConfirm}
              loading={isDeleting}
            >
              Delete Tenant
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default TenantListPage;