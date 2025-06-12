import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCloudProviders } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { LoadingSpinner, ErrorDisplay, EmptyState, Pagination } from '@/components/common';
import { Button, Table, ActionIcon, Group, Badge, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react';

const CloudProviderList: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, page, setPage, totalPages } = useCloudProviders();

  const handleCreateCloudProvider = () => {
    navigate('/cloud-providers/create');
  };

  const handleEditCloudProvider = (id: string) => {
    navigate(`/cloud-providers/${id}/edit`);
  };

  if (isLoading) {
    return <LoadingSpinner size="xl" text="Loading cloud providers..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <PageHeader
          title="Cloud Providers"
          description="Manage cloud provider integrations"
          actionText="Add Cloud Provider"
          onAction={handleCreateCloudProvider}
        />
        <EmptyState
          title="No cloud providers found"
          description="Get started by adding your first cloud provider"
          actionText="Add Cloud Provider"
          onAction={handleCreateCloudProvider}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Cloud Providers"
        description="Manage cloud provider integrations"
        actionText="Add Cloud Provider"
        onAction={handleCreateCloudProvider}
      />

      <div className="mt-6">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((provider) => (
              <Table.Tr key={provider.id}>
                <Table.Td>
                  <Text weight={500}>{provider.name}</Text>
                  <Text size="xs" color="dimmed">
                    {provider.id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge>{provider.type}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={provider.active ? 'green' : 'red'}
                  >
                    {provider.active ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {new Date(provider.createdAt).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Group spacing="xs">
                    <ActionIcon
                      color="yellow"
                      onClick={() => handleEditCloudProvider(provider.id)}
                      title="Edit cloud provider"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      title="Delete cloud provider"
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

export default CloudProviderList;