import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Paper, 
  Title, 
  Group, 
  Text,
  Table,
  Badge,
  ActionIcon
} from '@mantine/core';
import { 
  IconPlus,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import { useProjectTypes } from '../hooks/useProjectTypes';

const ProjectTypeList: React.FC = () => {
  const navigate = useNavigate();
  const { projectTypes, isLoading, error } = useProjectTypes();

  const handleCreate = () => {
    navigate('/admin/project-types/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/project-types/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    console.log('Delete project type:', id);
  };

  if (isLoading) {
    return <Text>Loading project types...</Text>;
  }

  if (error) {
    return <Text c="red">Error loading project types</Text>;
  }

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Project Types</Title>
          <Text c="dimmed">Manage project templates and configurations</Text>
        </div>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={handleCreate}
        >
          Create Project Type
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {projectTypes?.map((projectType) => (
              <Table.Tr key={projectType._id}>
                <Table.Td>
                  <Text fw={500}>{projectType.name}</Text>
                  <Text size="xs" c="dimmed">
                    {projectType._id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{projectType.description}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge 
                    color={projectType.isActive ? 'green' : 'gray'}
                    variant="light"
                  >
                    {projectType.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEdit(projectType._id)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(projectType._id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
};

export default ProjectTypeList;