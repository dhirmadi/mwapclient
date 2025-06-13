import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectTypes } from '../../hooks/useProjectTypes';
import { PageHeader } from '../../components/layout';
import { LoadingSpinner } from '../../components/common';
import { Button, Table, ActionIcon, Group, Badge, Text, Paper, Modal, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { ProjectType } from '../../types/project-type';

const ProjectTypeList: React.FC = () => {
  const navigate = useNavigate();
  const { projectTypes, isLoading, error, refetch, deleteProjectType } = useProjectTypes();
  
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (projectTypes) {
      setTypes(projectTypes);
      setLoading(false);
    }
  }, [projectTypes]);

  const handleCreateProjectType = () => {
    navigate('/admin/project-types/create');
  };

  const handleEditProjectType = (id: string) => {
    navigate(`/admin/project-types/${id}/edit`);
  };

  const openDeleteModal = (projectType: ProjectType) => {
    setSelectedType(projectType);
    setDeleteModalOpen(true);
    setConfirmText('');
  };

  const handleDeleteProjectType = async () => {
    if (!selectedType) return;
    
    try {
      await deleteProjectType(selectedType._id);
      
      // Remove from local state
      setTypes(prev => prev.filter(p => p._id !== selectedType._id));
      
      notifications.show({
        title: 'Success',
        message: `${selectedType.name} has been deleted`,
        color: 'green',
      });
      
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete project type:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete project type',
        color: 'red',
      });
    }
  };

  if (loading || isLoading) {
    return <LoadingSpinner />;
  }

  if (types.length === 0) {
    return (
      <div>
        <PageHeader
          title="Project Types"
          description="Manage project templates"
        />
        
        <Paper withBorder p="xl" radius="md" mt="md">
          <Text ta="center" c="dimmed" mb="md">
            No project types found
          </Text>
          <Group justify="center">
            <Button 
              leftSection={<IconPlus size={16} />} 
              onClick={handleCreateProjectType}
            >
              Create Project Type
            </Button>
          </Group>
        </Paper>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Project Types"
        description="Manage project templates"
      />

      <Group justify="flex-end" mb="md">
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={handleCreateProjectType}
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
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {types.map((projectType) => (
              <Table.Tr key={projectType._id}>
                <Table.Td>
                  <Text fw={500}>{projectType.name}</Text>
                  <Text size="xs" c="dimmed">
                    {projectType._id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text>{projectType.description || 'No description'}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={projectType.isActive ? 'green' : 'red'}
                  >
                    {projectType.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {new Date(projectType.createdAt).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEditProjectType(projectType._id)}
                      title="Edit project type"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      title="Delete project type"
                      onClick={() => openDeleteModal(projectType)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project Type"
      >
        {selectedType && (
          <>
            <Text mb="md">
              Are you sure you want to delete <strong>{selectedType.name}</strong>? This action cannot be undone.
            </Text>
            
            <Text mb="md" size="sm" c="dimmed">
              This will remove the project type from the system. Any projects using this type will be affected.
            </Text>
            
            <Text mb="md" fw={500}>
              Type <strong>{selectedType.name}</strong> to confirm:
            </Text>
            
            <TextInput
              value={confirmText}
              onChange={(e) => setConfirmText(e.currentTarget.value)}
              placeholder={selectedType.name}
              mb="xl"
            />
            
            <Group justify="flex-end">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                color="red" 
                onClick={handleDeleteProjectType}
                disabled={confirmText !== selectedType.name}
              >
                Delete
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProjectTypeList;