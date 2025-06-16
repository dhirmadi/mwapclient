import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCloudProviders } from '../../hooks/useCloudProviders';
import { PageHeader } from '../../components/layout';
import { LoadingSpinner } from '../../components/common';
import { Button, Table, ActionIcon, Group, Badge, Text, Paper, Modal, TextInput } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { CloudProvider } from '../../types/cloud-provider';
import { showSuccess, showError } from '../../utils/notificationService';

/**
 * Cloud Provider List Component
 * Displays a list of cloud providers and allows CRUD operations
 */
const CloudProviderList: React.FC = () => {
  const navigate = useNavigate();
  const { cloudProviders, isLoading, error, refetch, deleteCloudProvider } = useCloudProviders();
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Navigation handlers
  const handleCreateCloudProvider = () => navigate('/admin/cloud-providers/create');
  const handleEditCloudProvider = (id: string) => navigate(`/admin/cloud-providers/${id}/edit`);

  // Delete modal handlers
  const openDeleteModal = (provider: CloudProvider) => {
    setSelectedProvider(provider);
    setDeleteModalOpen(true);
    setConfirmText('');
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedProvider(null);
    setConfirmText('');
  };

  // Delete cloud provider
  const handleDeleteCloudProvider = async () => {
    if (!selectedProvider) return;
    
    setIsDeleting(true);
    
    try {
      await deleteCloudProvider(selectedProvider._id);
      closeDeleteModal();
      
      // Show success notification
      showSuccess(`${selectedProvider.name} has been deleted`);
      
      // Refresh the list
      refetch();
    } catch (error) {
      console.error('Failed to delete cloud provider:', error);
      
      // Show error notification
      showError('Failed to delete cloud provider');
    } finally {
      setIsDeleting(false);
    }
  };

  // Error handling
  useEffect(() => {
    if (error) {
      console.error('Error loading cloud providers:', error);
      showError('Failed to load cloud providers');
    }
  }, [error]);
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Empty state
  if (cloudProviders.length === 0) {
    return (
      <div>
        <PageHeader
          title="Cloud Providers"
          description="Manage cloud provider integrations"
        />
        
        <Paper withBorder p="xl" radius="md" mt="md">
          <Text ta="center" c="dimmed" mb="md">
            No cloud providers found
          </Text>
          <Group justify="center">
            <Button 
              leftSection={<IconPlus size={16} />} 
              onClick={handleCreateCloudProvider}
            >
              Add Cloud Provider
            </Button>
          </Group>
        </Paper>
      </div>
    );
  }

  // Main content
  return (
    <div>
      <PageHeader
        title="Cloud Providers"
        description="Manage cloud provider integrations"
      >
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={handleCreateCloudProvider}
        >
          Add Cloud Provider
        </Button>
      </PageHeader>

      <Paper withBorder p="md" radius="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Slug</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {cloudProviders.map((provider) => (
              <Table.Tr key={provider._id}>
                <Table.Td>
                  <Text fw={500}>{provider.name}</Text>
                  <Text size="xs" c="dimmed">
                    {provider._id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge>{provider.slug}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color="green">Active</Badge>
                </Table.Td>
                <Table.Td>
                  {new Date(provider.createdAt).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEditCloudProvider(provider._id)}
                      title="Edit cloud provider"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      title="Delete cloud provider"
                      onClick={() => openDeleteModal(provider)}
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
        onClose={closeDeleteModal}
        title="Delete Cloud Provider"
        centered
      >
        {selectedProvider && (
          <>
            <Text mb="md">
              Are you sure you want to delete <strong>{selectedProvider.name}</strong>? This action cannot be undone.
            </Text>
            
            <Text mb="md" size="sm" c="dimmed">
              This will remove the cloud provider from the system. Any tenant integrations using this provider will be affected.
            </Text>
            
            <Text mb="md" fw={500}>
              Type <strong>{selectedProvider.name}</strong> to confirm:
            </Text>
            
            <TextInput
              value={confirmText}
              onChange={(e) => setConfirmText(e.currentTarget.value)}
              placeholder={selectedProvider.name}
              mb="xl"
              data-autofocus
            />
            
            <Group justify="flex-end">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button 
                color="red" 
                onClick={handleDeleteCloudProvider}
                disabled={confirmText !== selectedProvider.name || isDeleting}
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

export default CloudProviderList;