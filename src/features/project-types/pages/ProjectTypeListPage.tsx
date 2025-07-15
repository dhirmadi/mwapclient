import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Paper, 
  Title, 
  Group, 
  Text,
  Table,
  Badge,
  ActionIcon,
  Modal,
  Alert,
  Stack,
  Tooltip,
  LoadingOverlay
} from '@mantine/core';
import { 
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle
} from '@tabler/icons-react';
import { useProjectTypes } from '../hooks/useProjectTypes';
import { ProjectType } from '../types';

const ProjectTypeList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    projectTypes, 
    isLoading, 
    error,
    deleteProjectType,
    isDeleting,
    deleteError
  } = useProjectTypes();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<ProjectType | null>(null);

  const handleCreate = () => {
    navigate('/admin/project-types/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/project-types/${id}/edit`);
  };

  const handleDeleteClick = (projectType: ProjectType) => {
    setTypeToDelete(projectType);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!typeToDelete) return;

    try {
      await deleteProjectType(typeToDelete._id);
      console.log('Project type deleted successfully');
      setDeleteModalOpen(false);
      setTypeToDelete(null);
    } catch (error) {
      console.error('Failed to delete project type:', error);
      // Error is handled by the hook and displayed in the modal
    }
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

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isLoading} />
        
        {projectTypes && projectTypes.length > 0 ? (
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
              {projectTypes.map((projectType: ProjectType) => (
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
                      <Tooltip label="Edit Project Type">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEdit(projectType._id)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete Project Type">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteClick(projectType)}
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
            <Text c="dimmed">No project types configured</Text>
            <Button 
              mt="md"
              leftSection={<IconPlus size={16} />}
              onClick={handleCreate}
            >
              Create Your First Project Type
            </Button>
          </div>
        )}
      </Paper>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project Type"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            <Text fw={500}>This action cannot be undone!</Text>
            <Text size="sm">
              Deleting this project type will remove it permanently. 
              Existing projects using this type may be affected.
            </Text>
          </Alert>
          
          {deleteError && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {deleteError instanceof Error ? deleteError.message : 'Failed to delete project type'}
            </Alert>
          )}
          
          <Text>
            Are you sure you want to delete the project type "{typeToDelete?.name}"?
          </Text>
          
          <Group justify="flex-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteModalOpen(false);
                setTypeToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              leftSection={<IconTrash size={16} />}
              onClick={handleDeleteConfirm}
              loading={isDeleting}
            >
              Delete Project Type
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default ProjectTypeList;