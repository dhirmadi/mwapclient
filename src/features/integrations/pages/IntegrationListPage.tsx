import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  Paper,
  Button,
  Group,
  SimpleGrid,
  TextInput,
  Select,
  Stack,
  Alert,
  Center,
  Skeleton,
  Badge,
  ActionIcon,
  Tooltip,
  Modal,
  Divider,
  Container,
  Flex,
  Box
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconCloud,
  IconAlertCircle,
  IconInfoCircle,
  IconSettings,
  IconTrash,
  IconSortAscending,
  IconSortDescending,
  IconGridDots,
  IconList
} from '@tabler/icons-react';
import { useAuth } from '../../../core/context/AuthContext';
import { useIntegrations, useDeleteIntegration } from '../hooks';
import { useCloudProviders } from '../../cloud-providers/hooks';
import { IntegrationCard, TokenStatusBadge } from '../components';
import { Integration, IntegrationStatus } from '../types';
import { formatDistanceToNow } from '../utils';

type SortField = 'name' | 'provider' | 'status' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

const IntegrationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus | ''>('');
  const [providerFilter, setProviderFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [integrationToDelete, setIntegrationToDelete] = useState<Integration | null>(null);

  // Data fetching
  const { 
    data: integrations, 
    isLoading, 
    error, 
    refetch 
  } = useIntegrations(roles?.tenantId);
  
  const { data: cloudProviders } = useCloudProviders();
  const { mutate: deleteIntegration, isPending: isDeleting } = useDeleteIntegration();

  // Filter and sort integrations
  const filteredAndSortedIntegrations = useMemo(() => {
    if (!integrations) return [];

    let filtered = integrations.filter(integration => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = integration.metadata?.displayName?.toLowerCase().includes(query) ||
                           integration.provider?.name?.toLowerCase().includes(query);
        const matchesProvider = integration.provider?.type?.toLowerCase().includes(query);
        if (!matchesName && !matchesProvider) return false;
      }

      // Status filter
      if (statusFilter && integration.status !== statusFilter) return false;

      // Provider filter
      if (providerFilter && integration.providerId !== providerFilter) return false;

      return true;
    });

    // Sort integrations
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.metadata?.displayName || a.provider?.name || '';
          bValue = b.metadata?.displayName || b.provider?.name || '';
          break;
        case 'provider':
          aValue = a.provider?.name || '';
          bValue = b.provider?.name || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          aValue = a.updatedAt;
          bValue = b.updatedAt;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [integrations, searchQuery, statusFilter, providerFilter, sortField, sortDirection]);

  // Get provider options for filter
  const providerOptions = useMemo(() => {
    if (!cloudProviders) return [];
    return cloudProviders.map(provider => ({
      value: provider.id,
      label: provider.name
    }));
  }, [cloudProviders]);

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'error', label: 'Error' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'provider', label: 'Provider' },
    { value: 'status', label: 'Status' }
  ];

  // Event handlers
  const handleCreateIntegration = () => {
    navigate('/integrations/create');
  };

  const handleViewDetails = (integrationId: string) => {
    navigate(`/integrations/${integrationId}`);
  };

  const handleEditIntegration = (integrationId: string) => {
    navigate(`/integrations/${integrationId}/edit`);
  };

  const handleDeleteClick = (integration: Integration) => {
    setIntegrationToDelete(integration);
  };

  const handleDeleteConfirm = () => {
    if (integrationToDelete) {
      deleteIntegration(integrationToDelete.id, {
        onSuccess: () => {
          setIntegrationToDelete(null);
        }
      });
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setProviderFilter('');
    setSortField('updatedAt');
    setSortDirection('desc');
  };

  // Get integration statistics
  const stats = useMemo(() => {
    if (!integrations) return { total: 0, active: 0, pending: 0, error: 0 };
    
    return {
      total: integrations.length,
      active: integrations.filter(i => i.status === 'active').length,
      pending: integrations.filter(i => i.status === 'pending').length,
      error: integrations.filter(i => i.status === 'error').length
    };
  }, [integrations]);

  // Render empty state
  const renderEmptyState = () => {
    if (searchQuery || statusFilter || providerFilter) {
      return (
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconSearch size={48} color="var(--mantine-color-gray-4)" />
            <div style={{ textAlign: 'center' }}>
              <Text size="lg" fw={500} c="dimmed">
                No integrations found
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Try adjusting your search or filter criteria
              </Text>
            </div>
            <Button variant="light" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Stack>
        </Center>
      );
    }

    return (
      <Center py="xl">
        <Stack align="center" gap="md" style={{ maxWidth: 400, textAlign: 'center' }}>
          <IconCloud size={64} color="var(--mantine-color-blue-4)" />
          <div>
            <Text size="xl" fw={500} mb="xs">
              No integrations yet
            </Text>
            <Text c="dimmed" mb="md">
              Connect your first cloud provider to start managing your files and resources across different platforms.
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleCreateIntegration}
            size="md"
          >
            Create Your First Integration
          </Button>
          
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="blue"
            variant="light"
            mt="md"
          >
            <Text size="sm">
              Integrations allow you to securely connect cloud storage providers like Google Drive, 
              Dropbox, and OneDrive to access your files directly from MWAP.
            </Text>
          </Alert>
        </Stack>
      </Center>
    );
  };

  // Render loading state
  const renderLoadingState = () => (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} height={200} radius="md" />
      ))}
    </SimpleGrid>
  );

  // Render error state
  if (error) {
    return (
      <Container size="lg">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Failed to load integrations"
          color="red"
          variant="light"
        >
          <Text size="sm" mb="md">
            Unable to load your integrations. Please try again.
          </Text>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconRefresh size={14} />}
            onClick={handleRefresh}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Cloud Integrations</Title>
          <Text c="dimmed" mt="xs">
            Manage your cloud provider connections and access tokens
          </Text>
        </div>
        
        <Group gap="sm">
          <Tooltip label="Refresh integrations">
            <ActionIcon
              variant="light"
              onClick={handleRefresh}
              loading={isLoading}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleCreateIntegration}
          >
            Add Integration
          </Button>
        </Group>
      </Group>

      {/* Statistics */}
      {integrations && integrations.length > 0 && (
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="lg">
          <Paper withBorder p="md" radius="md">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Total
            </Text>
            <Text size="xl" fw={700}>
              {stats.total}
            </Text>
          </Paper>
          
          <Paper withBorder p="md" radius="md">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Active
            </Text>
            <Group gap="xs" align="center">
              <Text size="xl" fw={700}>
                {stats.active}
              </Text>
              <Badge color="green" size="xs">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
              </Badge>
            </Group>
          </Paper>
          
          <Paper withBorder p="md" radius="md">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Pending
            </Text>
            <Text size="xl" fw={700} c="orange">
              {stats.pending}
            </Text>
          </Paper>
          
          <Paper withBorder p="md" radius="md">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Errors
            </Text>
            <Text size="xl" fw={700} c="red">
              {stats.error}
            </Text>
          </Paper>
        </SimpleGrid>
      )}

      {/* Filters and Controls */}
      {integrations && integrations.length > 0 && (
        <Paper withBorder p="md" radius="md" mb="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Filters & Search</Text>
              <Group gap="xs">
                <Tooltip label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}>
                  <ActionIcon
                    variant="light"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <IconList size={16} /> : <IconGridDots size={16} />}
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
            
            <Group gap="md" grow>
              <TextInput
                placeholder="Search integrations..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
              />
              
              <Select
                placeholder="Filter by status"
                leftSection={<IconFilter size={16} />}
                data={statusOptions}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as IntegrationStatus | '')}
                clearable
              />
              
              <Select
                placeholder="Filter by provider"
                leftSection={<IconCloud size={16} />}
                data={[{ value: '', label: 'All Providers' }, ...providerOptions]}
                value={providerFilter}
                onChange={(value) => setProviderFilter(value || '')}
                clearable
              />
              
              <Select
                placeholder="Sort by"
                data={sortOptions}
                value={sortField}
                onChange={(value) => setSortField(value as SortField)}
                rightSection={
                  <ActionIcon
                    size="sm"
                    variant="transparent"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortDirection === 'asc' ? 
                      <IconSortAscending size={14} /> : 
                      <IconSortDescending size={14} />
                    }
                  </ActionIcon>
                }
              />
            </Group>
            
            {(searchQuery || statusFilter || providerFilter) && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Showing {filteredAndSortedIntegrations.length} of {integrations.length} integrations
                </Text>
                <Button variant="subtle" size="xs" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </Group>
            )}
          </Stack>
        </Paper>
      )}

      {/* Content */}
      {isLoading ? (
        renderLoadingState()
      ) : !integrations || integrations.length === 0 ? (
        renderEmptyState()
      ) : filteredAndSortedIntegrations.length === 0 ? (
        renderEmptyState()
      ) : (
        <SimpleGrid 
          cols={viewMode === 'grid' ? { base: 1, sm: 2, lg: 3 } : 1} 
          spacing="md"
        >
          {filteredAndSortedIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onRefresh={handleRefresh}
              onEdit={handleEditIntegration}
              onDelete={handleDeleteClick}
              onViewDetails={handleViewDetails}
              compact={viewMode === 'list'}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!integrationToDelete}
        onClose={() => setIntegrationToDelete(null)}
        title="Delete Integration"
        centered
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            <Text size="sm">
              This action cannot be undone. You will lose access to files and data 
              from this cloud provider until you reconnect.
            </Text>
          </Alert>
          
          {integrationToDelete && (
            <div>
              <Text size="sm" mb="xs">
                You are about to delete:
              </Text>
              <Paper withBorder p="sm" bg="gray.0">
                <Group gap="sm">
                  <IconCloud size={16} />
                  <div>
                    <Text fw={500} size="sm">
                      {integrationToDelete.metadata?.displayName || integrationToDelete.provider?.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {integrationToDelete.provider?.type} • Created {formatDistanceToNow(new Date(integrationToDelete.createdAt))} ago
                    </Text>
                  </div>
                </Group>
              </Paper>
            </div>
          )}
          
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => setIntegrationToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteConfirm}
              loading={isDeleting}
              leftSection={<IconTrash size={16} />}
            >
              Delete Integration
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default IntegrationListPage;