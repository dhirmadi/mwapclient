import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { LoadingSpinner, ErrorDisplay, EmptyState, Pagination } from '@/components/common';
import { Button, Table, ActionIcon, Group, Badge, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, page, setPage, totalPages } = useProjects();

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleViewProject = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const handleEditProject = (id: string) => {
    navigate(`/projects/${id}/edit`);
  };

  if (isLoading) {
    return <LoadingSpinner size="xl" text="Loading projects..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <PageHeader
          title="Projects"
          description="Manage your projects"
          actionText="Create Project"
          onAction={handleCreateProject}
        />
        <EmptyState
          title="No projects found"
          description="Get started by creating your first project"
          actionText="Create Project"
          onAction={handleCreateProject}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage your projects"
        actionText="Create Project"
        onAction={handleCreateProject}
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
            {data.map((project) => (
              <Table.Tr key={project.id}>
                <Table.Td>
                  <Text weight={500}>{project.name}</Text>
                  <Text size="xs" color="dimmed">
                    {project.id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {project.projectType ? (
                    <Text>{project.projectType.name}</Text>
                  ) : (
                    <Text color="dimmed">Custom</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={project.status === 'ACTIVE' ? 'green' : 
                           project.status === 'ARCHIVED' ? 'gray' : 
                           project.status === 'PENDING' ? 'yellow' : 'red'}
                  >
                    {project.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {new Date(project.createdAt).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Group spacing="xs">
                    <ActionIcon
                      color="blue"
                      onClick={() => handleViewProject(project.id)}
                      title="View project"
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="yellow"
                      onClick={() => handleEditProject(project.id)}
                      title="Edit project"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      title="Delete project"
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

export default ProjectList;