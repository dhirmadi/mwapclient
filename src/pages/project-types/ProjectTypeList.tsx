import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectTypes } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { LoadingSpinner, ErrorDisplay, EmptyState, Pagination } from '@/components/common';
import { Button, Table, ActionIcon, Group, Badge, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react';

const ProjectTypeList: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, page, setPage, totalPages } = useProjectTypes();

  const handleCreateProjectType = () => {
    navigate('/project-types/create');
  };

  const handleEditProjectType = (id: string) => {
    navigate(`/project-types/${id}/edit`);
  };

  if (isLoading) {
    return <LoadingSpinner size="xl" text="Loading project types..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <PageHeader
          title="Project Types"
          description="Manage project templates"
          actionText="Create Project Type"
          onAction={handleCreateProjectType}
        />
        <EmptyState
          title="No project types found"
          description="Get started by creating your first project type"
          actionText="Create Project Type"
          onAction={handleCreateProjectType}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Project Types"
        description="Manage project templates"
        actionText="Create Project Type"
        onAction={handleCreateProjectType}
      />

      <div className="mt-6">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((projectType) => (
              <Table.Tr key={projectType.id}>
                <Table.Td>
                  <Text weight={500}>{projectType.name}</Text>
                  <Text size="xs" color="dimmed">
                    {projectType.id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text>{projectType.description || 'No description'}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={projectType.active ? 'green' : 'red'}
                  >
                    {projectType.active ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {new Date(projectType.createdAt).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Group spacing="xs">
                    <ActionIcon
                      color="yellow"
                      onClick={() => handleEditProjectType(projectType.id)}
                      title="Edit project type"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      title="Delete project type"
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

export default ProjectTypeList;