import React, { useState } from 'react';
import {
  Paper,
  Group,
  Text,
  Button,
  ActionIcon,
  Modal,
  Stack,
  Alert,
  Progress,
  List,
  Badge,
  Divider,
  Checkbox,
  TextInput,
  Select,
  Tooltip,
  Card,
  Timeline,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconRefresh,
  IconTrash,
  IconToggleLeft,
  IconToggleRight,
  IconTestPipe,
  IconAlertTriangle,
  IconInfoCircle,
  IconPlayerStop,
  IconCopy,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useBulkOperations, useBulkOperationUI } from '../hooks';
import { Integration } from '../types';
import { formatDistanceToNow } from '../utils';

interface BulkOperationsPanelProps {
  integrations: Integration[];
  onRefresh?: () => void;
}

export const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  integrations,
  onRefresh,
}) => {
  const [confirmationToken, setConfirmationToken] = useState('');
  
  const {
    progress,
    isProcessing,
    refreshTokens,
    updateStatus,
    deleteIntegrations,
    testConnections,
    resetProgress,
    cancelOperation,
    generateConfirmationToken,
    validateSelection,
  } = useBulkOperations();

  const {
    selectedIntegrations,
    isSelectionMode,
    showConfirmDialog,
    pendingOperation,
    toggleSelection,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    confirmOperation,
    cancelOperation: cancelConfirmDialog,
  } = useBulkOperationUI();

  // Handle operation execution
  const executeOperation = async () => {
    if (!pendingOperation) return;

    const validation = validateSelection(selectedIntegrations, integrations);
    if (!validation.valid) {
      notifications.show({
        title: 'Invalid Selection',
        message: validation.errors.join(', '),
        color: 'red',
      });
      return;
    }

    try {
      let results;
      
      switch (pendingOperation.type) {
        case 'refresh':
          results = await refreshTokens({
            integrationIds: selectedIntegrations,
            forceRefresh: pendingOperation.data?.forceRefresh || false,
          });
          break;
          
        case 'activate':
          results = await updateStatus({
            integrationIds: selectedIntegrations,
            status: 'active',
          });
          break;
          
        case 'deactivate':
          results = await updateStatus({
            integrationIds: selectedIntegrations,
            status: 'inactive',
          });
          break;
          
        case 'delete':
          if (!confirmationToken) {
            notifications.show({
              title: 'Confirmation Required',
              message: 'Please enter the confirmation token',
              color: 'red',
            });
            return;
          }
          
          results = await deleteIntegrations({
            integrationIds: selectedIntegrations,
            confirmationToken,
          });
          break;
          
        case 'test':
          results = await testConnections({
            integrationIds: selectedIntegrations,
            timeout: pendingOperation.data?.timeout || 10000,
          });
          break;
          
        default:
          throw new Error('Unknown operation type');
      }

      // Show results
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      notifications.show({
        title: 'Operation Complete',
        message: `${successCount} succeeded, ${failureCount} failed`,
        color: failureCount === 0 ? 'green' : 'orange',
      });

      // Refresh data and close dialog
      onRefresh?.();
      cancelConfirmDialog();
      exitSelectionMode();
      
    } catch (error: any) {
      notifications.show({
        title: 'Operation Failed',
        message: error.message || 'An unexpected error occurred',
        color: 'red',
      });
    }
  };

  // Get operation details for confirmation
  const getOperationDetails = () => {
    if (!pendingOperation) return null;

    const selectedCount = selectedIntegrations.length;
    const selectedNames = integrations
      .filter(i => selectedIntegrations.includes(i.id))
      .map(i => i.metadata?.displayName || i.provider?.name || i.id)
      .slice(0, 3);

    switch (pendingOperation.type) {
      case 'refresh':
        return {
          title: 'Refresh Access Tokens',
          description: `Refresh access tokens for ${selectedCount} integration${selectedCount > 1 ? 's' : ''}`,
          color: 'blue',
          icon: <IconRefresh size={16} />,
          destructive: false,
        };
        
      case 'activate':
        return {
          title: 'Activate Integrations',
          description: `Activate ${selectedCount} integration${selectedCount > 1 ? 's' : ''}`,
          color: 'green',
          icon: <IconToggleRight size={16} />,
          destructive: false,
        };
        
      case 'deactivate':
        return {
          title: 'Deactivate Integrations',
          description: `Deactivate ${selectedCount} integration${selectedCount > 1 ? 's' : ''}`,
          color: 'orange',
          icon: <IconToggleLeft size={16} />,
          destructive: false,
        };
        
      case 'delete':
        return {
          title: 'Delete Integrations',
          description: `Permanently delete ${selectedCount} integration${selectedCount > 1 ? 's' : ''}`,
          color: 'red',
          icon: <IconTrash size={16} />,
          destructive: true,
        };
        
      case 'test':
        return {
          title: 'Test Connections',
          description: `Test connections for ${selectedCount} integration${selectedCount > 1 ? 's' : ''}`,
          color: 'blue',
          icon: <IconTestPipe size={16} />,
          destructive: false,
        };
        
      default:
        return null;
    }
  };

  const operationDetails = getOperationDetails();

  return (
    <>
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Text fw={500}>Bulk Operations</Text>
          
          {!isSelectionMode ? (
            <Button
              size="sm"
              variant="light"
              onClick={enterSelectionMode}
              disabled={integrations.length === 0}
            >
              Select Integrations
            </Button>
          ) : (
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {selectedIntegrations.length} selected
              </Text>
              <Button size="xs" variant="subtle" onClick={clearSelection}>
                Clear
              </Button>
              <Button size="xs" variant="subtle" onClick={exitSelectionMode}>
                Cancel
              </Button>
            </Group>
          )}
        </Group>

        {isSelectionMode && (
          <Stack gap="md">
            {/* Selection Controls */}
            <Group gap="sm">
              <Button
                size="xs"
                variant="light"
                onClick={() => selectAll(integrations.map(i => i.id))}
              >
                Select All
              </Button>
              <Button
                size="xs"
                variant="light"
                onClick={() => selectAll(integrations.filter(i => i.status === 'active').map(i => i.id))}
              >
                Select Active
              </Button>
              <Button
                size="xs"
                variant="light"
                onClick={() => selectAll(integrations.filter(i => i.status !== 'active').map(i => i.id))}
              >
                Select Inactive
              </Button>
            </Group>

            {/* Integration List */}
            <Stack gap="xs" style={{ maxHeight: 200, overflowY: 'auto' }}>
              {integrations.map((integration) => (
                <Card key={integration.id} withBorder p="xs">
                  <Group gap="sm">
                    <Checkbox
                      checked={selectedIntegrations.includes(integration.id)}
                      onChange={() => toggleSelection(integration.id)}
                    />
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>
                        {String(integration.metadata?.displayName || integration.provider?.name || 'Unknown')}
                      </Text>
                      <Group gap="xs">
                        <Badge
                          size="xs"
                          color={integration.status === 'active' ? 'green' : 'gray'}
                        >
                          {integration.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {integration.provider?.type}
                        </Text>
                      </Group>
                    </div>
                  </Group>
                </Card>
              ))}
            </Stack>

            {/* Operation Buttons */}
            {selectedIntegrations.length > 0 && (
              <>
                <Divider />
                <Group gap="sm">
                  <Button
                    size="sm"
                    leftSection={<IconRefresh size={16} />}
                    onClick={() => confirmOperation('refresh')}
                  >
                    Refresh Tokens
                  </Button>
                  
                  <Button
                    size="sm"
                    leftSection={<IconToggleRight size={16} />}
                    onClick={() => confirmOperation('activate')}
                    color="green"
                  >
                    Activate
                  </Button>
                  
                  <Button
                    size="sm"
                    leftSection={<IconToggleLeft size={16} />}
                    onClick={() => confirmOperation('deactivate')}
                    color="orange"
                  >
                    Deactivate
                  </Button>
                  
                  <Button
                    size="sm"
                    leftSection={<IconTestPipe size={16} />}
                    onClick={() => confirmOperation('test')}
                    variant="light"
                  >
                    Test
                  </Button>
                  
                  <Button
                    size="sm"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => confirmOperation('delete')}
                    color="red"
                    variant="light"
                  >
                    Delete
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        )}

        {/* Progress Display */}
        {progress && (
          <Stack gap="md" mt="md">
            <Divider />
            
            <Group justify="space-between">
              <Text fw={500}>Operation Progress</Text>
              {isProcessing && (
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  leftSection={<IconPlayerStop size={14} />}
                  onClick={cancelOperation}
                >
                  Cancel
                </Button>
              )}
            </Group>
            
            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm">
                  {progress.completed} of {progress.total} completed
                </Text>
                <Text size="sm" c="dimmed">
                  {progress.failed} failed
                </Text>
              </Group>
              
              <Progress
                value={(progress.completed / progress.total) * 100}
                color={progress.failed > 0 ? 'orange' : 'blue'}
                size="sm"
                animated={isProcessing}
              />
              
              {progress.current && (
                <Text size="xs" c="dimmed" mt="xs">
                  Processing: {progress.current}
                </Text>
              )}
            </div>

            {/* Results */}
            {progress.results.length > 0 && (
              <Stack gap="xs" style={{ maxHeight: 150, overflowY: 'auto' }}>
                {progress.results.map((result, index) => (
                  <Group key={index} gap="xs">
                    {result.success ? (
                      <IconCheck size={16} color="var(--mantine-color-green-6)" />
                    ) : (
                      <IconX size={16} color="var(--mantine-color-red-6)" />
                    )}
                    <Text size="sm" style={{ flex: 1 }}>
                      {String(integrations.find(i => i.id === result.integrationId)?.metadata?.displayName || result.integrationId)}
                    </Text>
                    {result.error && (
                      <Tooltip label={result.error}>
                        <ActionIcon size="sm" variant="subtle" color="red">
                          <IconAlertTriangle size={12} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                ))}
              </Stack>
            )}

            {!isProcessing && (
              <Group justify="flex-end">
                <Button size="xs" variant="subtle" onClick={resetProgress}>
                  Clear Results
                </Button>
              </Group>
            )}
          </Stack>
        )}
      </Paper>

      {/* Confirmation Modal */}
      <Modal
        opened={showConfirmDialog}
        onClose={cancelConfirmDialog}
        title={operationDetails?.title}
        centered
      >
        {operationDetails && (
          <Stack gap="md">
            <Alert
              icon={operationDetails.icon}
              color={operationDetails.color}
              variant="light"
            >
              <Text size="sm">
                {operationDetails.description}
              </Text>
            </Alert>

            {/* Show selected integrations */}
            <div>
              <Text size="sm" fw={500} mb="xs">
                Selected integrations:
              </Text>
              <List size="sm" spacing="xs">
                {integrations
                  .filter(i => selectedIntegrations.includes(i.id))
                  .slice(0, 5)
                  .map((integration) => (
                    <List.Item key={integration.id}>
                      {String(integration.metadata?.displayName || integration.provider?.name || 'Unknown')}
                      <Badge size="xs" ml="xs" color={integration.status === 'active' ? 'green' : 'gray'}>
                        {integration.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </List.Item>
                  ))}
              </List>
              {selectedIntegrations.length > 5 && (
                <Text size="xs" c="dimmed" mt="xs">
                  ... and {selectedIntegrations.length - 5} more
                </Text>
              )}
            </div>

            {/* Destructive operation warning */}
            {operationDetails.destructive && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                color="red"
                variant="light"
              >
                <Text size="sm" fw={500} mb="xs">
                  This action cannot be undone!
                </Text>
                <Text size="sm">
                  You will lose access to files and data from these cloud providers 
                  until you reconnect them.
                </Text>
              </Alert>
            )}

            {/* Confirmation token for delete */}
            {pendingOperation?.type === 'delete' && (
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Enter confirmation token:
                </Text>
                <Group gap="xs">
                  <TextInput
                    placeholder="Confirmation token"
                    value={confirmationToken}
                    onChange={(e) => setConfirmationToken(e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                  <Tooltip label="Generate token">
                    <ActionIcon
                      onClick={() => setConfirmationToken(generateConfirmationToken())}
                    >
                      <IconCopy size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Text size="xs" c="dimmed" mt="xs">
                  Click the copy icon to generate a confirmation token
                </Text>
              </div>
            )}

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                onClick={cancelConfirmDialog}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                color={operationDetails.color}
                onClick={executeOperation}
                loading={isProcessing}
                disabled={
                  pendingOperation?.type === 'delete' && !confirmationToken
                }
              >
                {operationDetails.title}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
};