import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCloudProviders } from '../hooks/useCloudProviders';
import { 
  Button, 
  Table, 
  ActionIcon, 
  Group, 
  Badge, 
  Text, 
  Paper, 
  Title,
  Container,
  LoadingOverlay,
  Modal,
  Alert,
  Stack,
  Tooltip
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconAlertCircle,
  IconEye,
  IconCloud
} from '@tabler/icons-react';
import { CloudProvider } from '../types';

const CloudProviderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cloudProviders, 
    isLoading, 
    deleteCloudProvider, 
    isDeleting,
    deleteError 
  } = useCloudProviders();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<CloudProvider | null>(null);

  const handleEdit = (id: string) => {
    navigate(`/admin/cloud-providers/${id}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`/admin/cloud-providers/${id}/edit`);
  };

  const handleDeleteClick = (provider: CloudProvider) => {
    setProviderToDelete(provider);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!providerToDelete) return;

    try {
      await deleteCloudProvider(providerToDelete.id);
      console.log('Cloud provider deleted successfully');
      setDeleteModalOpen(false);
      setProviderToDelete(null);
    } catch (error) {
      console.error('Failed to delete cloud provider:', error);
      // Error is handled by the hook and displayed in the modal
    }
  };

  const handleCreate = () => {
    navigate('/admin/cloud-providers/create');
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Cloud Providers</Title>
          <Text c="dimmed">Manage cloud storage provider integrations</Text>
        </div>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={handleCreate}
        >
          Add Cloud Provider
        </Button>
      </Group>

      <Paper withBorder radius="md" pos="relative">
        <LoadingOverlay visible={isLoading} />
        
        {cloudProviders && cloudProviders.length > 0 ? (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {cloudProviders.map((provider: CloudProvider) => (
                <Table.Tr key={provider.id}>
                  <Table.Td>{provider.name}</Table.Td>
                  <Table.Td>{provider.slug}</Table.Td>
                  <Table.Td>
                    <Badge color="green">Active</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="View/Edit Provider">
                        <ActionIcon 
                          variant="subtle" 
                          color="blue"
                          onClick={() => handleEdit(provider.id)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete Provider">
                        <ActionIcon 
                          variant="subtle" 
                          color="red"
                          onClick={() => handleDeleteClick(provider)}
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
            <Text c="dimmed">No cloud providers configured</Text>
            <Button 
              mt="md"
              leftSection={<IconPlus size={16} />}
              onClick={handleCreate}
            >
              Add Your First Cloud Provider
            </Button>
          </div>
        )}
      </Paper>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Cloud Provider"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            <Text fw={500}>This action cannot be undone!</Text>
            <Text size="sm">
              Deleting this cloud provider will remove it permanently and may affect 
              existing tenant integrations.
            </Text>
          </Alert>
          
          {deleteError && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {deleteError instanceof Error ? deleteError.message : 'Failed to delete cloud provider'}
            </Alert>
          )}
          
          <Text>
            Are you sure you want to delete the cloud provider "{providerToDelete?.name}"?
          </Text>
          
          <Group justify="flex-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteModalOpen(false);
                setProviderToDelete(null);
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
              Delete Provider
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default CloudProviderListPage;