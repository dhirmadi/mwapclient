import React from 'react';
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
  LoadingOverlay
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { CloudProvider } from '../../../types/cloud-provider';

const CloudProviderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { cloudProviders, isLoading } = useCloudProviders();

  const handleEdit = (id: string) => {
    navigate(`/admin/cloud-providers/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    console.log('Delete cloud provider:', id);
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
                <Table.Tr key={provider._id}>
                  <Table.Td>{provider.name}</Table.Td>
                  <Table.Td>{provider.slug}</Table.Td>
                  <Table.Td>
                    <Badge color="green">Active</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon 
                        variant="subtle" 
                        onClick={() => handleEdit(provider._id)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="subtle" 
                        color="red"
                        onClick={() => handleDelete(provider._id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
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
    </Container>
  );
};

export default CloudProviderListPage;