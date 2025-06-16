import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectTypes } from '../../hooks/useProjectTypes';
import { PageHeader } from '../../components/layout';
import { LoadingSpinner } from '../../components/common';
import { 
  Button, 
  Table, 
  ActionIcon, 
  Group, 
  Badge, 
  Text, 
  Paper, 
  Modal, 
  TextInput, 
  Alert,
  Skeleton,
  Box,
  Stack,
  Code
} from '@mantine/core';
import { showSuccess, showError } from '../../utils/notificationService';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconAlertCircle, 
  IconRefresh,
  IconInfoCircle
} from '@tabler/icons-react';
import { ProjectType } from '../../types/project-type';

const ProjectTypeList: React.FC = () => {
  const navigate = useNavigate();
  const { projectTypes, isLoading, error, refetch, deleteProjectType, isDeleting } = useProjectTypes();
  
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    console.log('ProjectTypeList - projectTypes:', projectTypes);
    if (projectTypes) {
      setTypes(Array.isArray(projectTypes) ? projectTypes : []);
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
      
      showSuccess(`${selectedType.name} has been deleted`);
      
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete project type:', error);
      showError(error instanceof Error ? error.message : 'Failed to delete project type');
    }
  };

  const handleRetry = () => {
    refetch();
  };

  // Loading state
  if (loading || isLoading) {
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
            disabled={isLoading}
          >
            Create Project Type
          </Button>
        </Group>
        
        <Paper withBorder p="md" radius="md">
          <Skeleton height={40} mb="md" width="100%" />
          <Skeleton height={60} mb="sm" width="100%" />
          <Skeleton height={60} mb="sm" width="100%" />
          <Skeleton height={60} width="100%" />
        </Paper>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <PageHeader
          title="Project Types"
          description="Manage project templates"
        />
        
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error loading project types" 
          color="red" 
          mb="md"
        >
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </Alert>
        
        <Group>
          <Button 
            leftSection={<IconRefresh size={16} />} 
            onClick={handleRetry}
          >
            Retry
          </Button>
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={handleCreateProjectType}
          >
            Create Project Type
          </Button>
        </Group>
      </div>
    );
  }

  // Empty state
  if (!types || types.length === 0) {
    return (
      <div>
        <PageHeader
          title="Project Types"
          description="Manage project templates"
        />
        
        <Paper withBorder p="xl" radius="md" mt="md">
          <Stack align="center" gap="md">
            <IconInfoCircle size={48} color="var(--mantine-color-blue-6)" />
            <Text ta="center" fw={500} size="lg">
              No project types found
            </Text>
            <Text ta="center" c="dimmed" size="sm" maw={500}>
              Project types define the configuration schema for different kinds of projects.
              Create your first project type to get started.
            </Text>
            <Button 
              leftSection={<IconPlus size={16} />} 
              onClick={handleCreateProjectType}
              mt="md"
            >
              Create Project Type
            </Button>
          </Stack>
        </Paper>
      </div>
    );
  }

  // Normal state with data
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
              <Table.Th>Config Schema</Table.Th>
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
                  <Box maw={200}>
                    <Code block fz="xs" style={{ maxHeight: '80px', overflow: 'auto' }}>
                      {JSON.stringify(projectType.configSchema, null, 2)}
                    </Code>
                  </Box>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={projectType.isActive ? 'green' : 'red'}
                    variant="filled"
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
                      loading={isDeleting && selectedType?._id === projectType._id}
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
        centered
      >
        {selectedType && (
          <>
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              title="Warning" 
              color="red" 
              mb="md"
            >
              This action cannot be undone.
            </Alert>
            
            <Text mb="md">
              Are you sure you want to delete <strong>{selectedType.name}</strong>?
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
              data-autofocus
            />
            
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                color="red" 
                onClick={handleDeleteProjectType}
                disabled={confirmText !== selectedType.name}
                loading={isDeleting}
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