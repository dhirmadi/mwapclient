import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenants } from '../../../hooks';
import { PageHeader } from '../../../components/layout';
import { LoadingSpinner, ErrorDisplay, EmptyState, Pagination } from '../../../components/common';
import { Button, Table, ActionIcon, Group, Badge, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react';

const TenantList: React.FC = () => {
  const navigate = useNavigate();
  const { tenants, isLoading, error } = useTenants();
  const [page, setPage] = React.useState(1);
  const totalPages = Math.ceil((tenants?.length || 0) / 10);

  const handleCreateTenant = () => {
    navigate('/tenants/create');
  };

  const handleViewTenant = (id: string) => {
    navigate(`/tenants/${id}`);
  };

  const handleEditTenant = (id: string) => {
    navigate(`/tenants/${id}/edit`);
  };

  if (isLoading) {
    return <LoadingSpinner size="xl" text="Loading tenants..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <PageHeader
          title="Tenants"
          description="Manage platform tenants"
          actionText="Create Tenant"
          onAction={handleCreateTenant}
        />
        <EmptyState
          title="No tenants found"
          description="Get started by creating your first tenant"
          actionText="Create Tenant"
          onAction={handleCreateTenant}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="Manage platform tenants"
        actionText="Create Tenant"
        onAction={handleCreateTenant}
      />

      <div className="mt-6">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Owner</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tenants?.map((tenant: any) => (
              <Table.Tr key={tenant.id}>
                <Table.Td>
                  <Text fw={500}>{tenant.name}</Text>
                  <Text size="xs" color="dimmed">
                    {tenant.id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {tenant.owner ? (
                    <div>
                      <Text>{tenant.owner.firstName} {tenant.owner.lastName}</Text>
                      <Text size="xs" color="dimmed">
                        {tenant.owner.email}
                      </Text>
                    </div>
                  ) : (
                    <Text color="dimmed">No owner assigned</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={tenant.active ? 'green' : 'red'}
                  >
                    {tenant.active ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      color="blue"
                      onClick={() => handleViewTenant(tenant.id)}
                      title="View tenant"
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="yellow"
                      onClick={() => handleEditTenant(tenant.id)}
                      title="Edit tenant"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      title="Delete tenant"
                      disabled
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantList;