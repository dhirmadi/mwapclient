import React, { useState } from 'react';
import {
  SimpleGrid,
  Card,
  Group,
  Text,
  Avatar,
  Badge,
  Stack,
  TextInput,
  Select,
  Button,
  Tooltip,
  ActionIcon,
  Divider,
  Alert,
  Skeleton,
  Box,
  Center
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconCloud,
  IconCheck,
  IconExternalLink,
  IconInfoCircle,
  IconShield,
  IconKey,
  IconRefresh
} from '@tabler/icons-react';
import { CloudProvider } from '../../cloud-providers/types';
import { useCloudProviders } from '../../cloud-providers/hooks';

interface ProviderSelectorProps {
  selectedProviderId?: string;
  onProviderSelect: (provider: CloudProvider) => void;
  onProviderDeselect?: () => void;
  disabled?: boolean;
  showSelected?: boolean;
  filterByType?: string[];
  excludeProviders?: string[];
  maxSelection?: number;
  compact?: boolean;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProviderId,
  onProviderSelect,
  onProviderDeselect,
  disabled = false,
  showSelected = true,
  filterByType,
  excludeProviders = [],
  maxSelection = 1,
  compact = false,
}) => {
  const { data: cloudProviders, isLoading, error, refetch } = useCloudProviders();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Filter providers based on search, type, and exclusions
  const filteredProviders = React.useMemo(() => {
    if (!cloudProviders) return [];

    return cloudProviders.filter(provider => {
      // Exclude specified providers
      if (excludeProviders.includes(provider.id)) return false;

      // Filter by type if specified
      if (filterByType && provider.type && !filterByType.includes(provider.type)) return false;
      if (typeFilter && provider.type !== typeFilter) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          provider.name.toLowerCase().includes(query) ||
          (provider.type && provider.type.toLowerCase().includes(query)) ||
          (provider.description && provider.description.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [cloudProviders, searchQuery, typeFilter, filterByType, excludeProviders]);

  // Get unique provider types for filter dropdown
  const providerTypes = React.useMemo(() => {
    if (!cloudProviders) return [];
    const types = [...new Set(cloudProviders.map(p => p.type).filter(Boolean))] as string[];
    return types.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }));
  }, [cloudProviders]);

  const handleProviderClick = (provider: CloudProvider) => {
    if (disabled) return;

    if (selectedProviderId === provider.id) {
      // Deselect if already selected
      onProviderDeselect?.();
    } else {
      // Select provider
      onProviderSelect(provider);
    }
  };

  const getProviderIcon = (provider: CloudProvider) => {
    if (provider.metadata?.iconUrl) {
      return (
        <Avatar
          src={provider.metadata.iconUrl as string}
          size={compact ? "sm" : "md"}
          radius="sm"
        />
      );
    }
    
    return (
      <Avatar size={compact ? "sm" : "md"} radius="sm">
        <IconCloud size={compact ? 16 : 20} />
      </Avatar>
    );
  };

  const getProviderStatusBadge = (provider: CloudProvider) => {
    if (!provider.isActive) {
      return <Badge color="red" size="xs">Inactive</Badge>;
    }

    if (provider.metadata?.isRecommended) {
      return <Badge color="blue" size="xs">Recommended</Badge>;
    }

    return <Badge color="green" size="xs">Available</Badge>;
  };

  const renderProviderCard = (provider: CloudProvider) => {
    const isSelected = selectedProviderId === provider.id;
    const isDisabled = disabled || !provider.isActive;

    return (
      <Card
        key={provider.id}
        shadow="sm"
        padding={compact ? "sm" : "md"}
        radius="md"
        withBorder
        style={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.6 : 1,
          borderColor: isSelected ? 'var(--mantine-color-blue-5)' : undefined,
          backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
          transition: 'all 0.2s ease',
        }}
        onClick={() => handleProviderClick(provider)}
      >
        <Group justify="space-between" mb="sm">
          <Group gap="sm">
            {getProviderIcon(provider)}
            <div>
              <Group gap="xs" align="center">
                <Text fw={500} size={compact ? "sm" : "md"}>
                  {provider.name}
                </Text>
                {isSelected && <IconCheck size={16} color="var(--mantine-color-blue-6)" />}
              </Group>
              <Text size="xs" c="dimmed">
                {provider.type ? provider.type.charAt(0).toUpperCase() + provider.type.slice(1) : 'Unknown'}
              </Text>
            </div>
          </Group>
          
          {getProviderStatusBadge(provider)}
        </Group>

        {!compact && provider.description && (
          <Text size="sm" c="dimmed" lineClamp={2} mb="sm">
            {provider.description}
          </Text>
        )}

        {!compact && (
          <Stack gap="xs">
            {/* Scopes */}
            {provider.scopes && provider.scopes.length > 0 ? (
              <Group gap="xs">
                <IconKey size={14} color="var(--mantine-color-gray-6)" />
                <Text size="xs" c="dimmed">
                  {provider.scopes.length} permission{provider.scopes.length !== 1 ? 's' : ''}
                </Text>
              </Group>
            ) : null}

            <Group gap="xs">
              <IconShield size={14} color="var(--mantine-color-green-6)" />
              <Text size="xs" c="dimmed">
                OAuth 2.0 with PKCE
              </Text>
            </Group>

            {/* Additional Info */}
            {provider.metadata?.supportUrl ? (
              <Group gap="xs">
                <IconExternalLink size={14} color="var(--mantine-color-blue-6)" />
                <Text
                  size="xs"
                  c="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(provider.metadata?.supportUrl as string, '_blank');
                  }}
                >
                  Documentation
                </Text>
              </Group>
            ) : null}
          </Stack>
        )}
      </Card>
    );
  };

  if (error) {
    return (
      <Alert
        icon={<IconInfoCircle size={16} />}
        title="Failed to load providers"
        color="red"
        variant="light"
      >
        <Text size="sm" mb="md">
          Unable to load cloud providers. Please try again.
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconRefresh size={14} />}
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {/* Search and Filter Controls */}
      {!compact && (
        <Group gap="md">
          <TextInput
            placeholder="Search providers..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          
          {providerTypes.length > 1 && (
            <Select
              placeholder="Filter by type"
              leftSection={<IconFilter size={16} />}
              data={[{ value: '', label: 'All Types' }, ...providerTypes]}
              value={typeFilter}
              onChange={(value) => setTypeFilter(value || '')}
              clearable
              style={{ minWidth: 150 }}
            />
          )}
        </Group>
      )}

      {/* Selected Provider Display */}
      {showSelected && selectedProviderId && (
        <Alert
          icon={<IconCheck size={16} />}
          title="Selected Provider"
          color="blue"
          variant="light"
        >
          <Group justify="space-between">
            <Text size="sm">
              {cloudProviders?.find(p => p.id === selectedProviderId)?.name || 'Unknown Provider'}
            </Text>
            {onProviderDeselect && (
              <Button
                size="xs"
                variant="subtle"
                onClick={onProviderDeselect}
                disabled={disabled}
              >
                Change Selection
              </Button>
            )}
          </Group>
        </Alert>
      )}

      {/* Provider Grid */}
      {isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height={compact ? 80 : 120} radius="md" />
          ))}
        </SimpleGrid>
      ) : filteredProviders.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredProviders.map(renderProviderCard)}
        </SimpleGrid>
      ) : (
        <Center py="xl">
          <Stack align="center" gap="sm">
            <IconCloud size={48} color="var(--mantine-color-gray-4)" />
            <Text size="lg" fw={500} c="dimmed">
              No providers found
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              {searchQuery || typeFilter
                ? 'Try adjusting your search or filter criteria'
                : 'No cloud providers are currently available'
              }
            </Text>
            {(searchQuery || typeFilter) && (
              <Button
                variant="light"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Stack>
        </Center>
      )}

      {/* Help Text */}
      {!compact && filteredProviders.length > 0 && (
        <Text size="xs" c="dimmed" ta="center">
          Select a cloud provider to create a new integration. 
          All connections use secure OAuth 2.0 authentication.
        </Text>
      )}
    </Stack>
  );
};