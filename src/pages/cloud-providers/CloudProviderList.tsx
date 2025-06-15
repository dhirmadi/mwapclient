import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCloudProviders } from '../../hooks/useCloudProviders';
import { PageHeader } from '../../components/layout';
import { LoadingSpinner } from '../../components/common';
import { Button, Table, ActionIcon, Group, Badge, Text, Paper, Modal, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconEye, IconPlus } from '@tabler/icons-react';

const CloudProviderList: React.FC = () => {
  const navigate = useNavigate();
  const { fetchCloudProviders, deleteCloudProvider } = useCloudProviders();
  
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setLoading(true);
        const data = await fetchCloudProviders();
        setProviders(data);
      } catch (error) {
        console.error('Failed to load cloud providers:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load cloud providers',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  const handleCreateCloudProvider = () => {
    navigate('/admin/cloud-providers/create');
  };

  const handleEditCloudProvider = (id: string) => {
    navigate(`/admin/cloud-providers/${id}/edit`);
  };

  const openDeleteModal = (provider: any) => {
    setSelectedProvider(provider);
    setDeleteModalOpen(true);
    setConfirmText('');
  };

  const handleDeleteCloudProvider = async () => {
    if (!selectedProvider) return;
    
    try {
      await deleteCloudProvider(selectedProvider._id);
      
      // Remove from local state
      setProviders(prev => prev.filter(p => p._id !== selectedProvider._id));
      
      notifications.show({
        title: 'Success',
        message: `${selectedProvider.name} has been deleted`,
        color: 'green',
      });
      
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete cloud provider:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete cloud provider',
        color: 'red',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (providers.length === 0) {
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

  return (
    <div>
      <PageHeader
        title="Cloud Providers"
        description="Manage cloud provider integrations"
      />

      <Group justify="flex-end" mb="md">
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={handleCreateCloudProvider}
        >
          Add Cloud Provider
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
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
            {providers.map((provider) => (
              <Table.Tr key={provider._id}>
                <Table.Td>
                  <Text fw={500}>{provider.name}</Text>
                  <Text size="xs" c="dimmed">
                    {provider._id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge>{provider.type}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={provider.isActive ? 'green' : 'red'}
                  >
                    {provider.isActive ? 'Active' : 'Inactive'}
                  </Badge>
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
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Cloud Provider"
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
            />
            
            <Group justify="flex-end">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                color="red" 
                onClick={handleDeleteCloudProvider}
                disabled={confirmText !== selectedProvider.name}
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