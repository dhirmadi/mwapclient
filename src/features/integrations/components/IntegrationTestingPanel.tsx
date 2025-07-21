import React, { useState } from 'react';
import {
  Paper,
  Group,
  Text,
  Button,
  Stack,
  Alert,
  Progress,
  Badge,
  Timeline,
  Modal,
  Tabs,
  List,
  Card,
  ActionIcon,
  Tooltip,
  Divider,
  Code,
  Table,
  Switch,
  NumberInput,
  Accordion,
} from '@mantine/core';
import {
  IconTestPipe,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconInfoCircle,
  IconRefresh,
  IconSettings,
  IconBug,
  IconTool,
  IconClock,
  IconPlayerPlay,
  IconPlayerStop,
  IconChevronRight,
  IconShield,
  IconNetwork,
  IconKey,
  IconCloud,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useIntegrationTesting } from '../hooks';
import { formatDistanceToNow } from '../utils';

interface IntegrationTestingPanelProps {
  integrationId: string;
  compact?: boolean;
  autoRun?: boolean;
}

export const IntegrationTestingPanel: React.FC<IntegrationTestingPanelProps> = ({
  integrationId,
  compact = false,
  autoRun = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [testConfig, setTestConfig] = useState({
    timeout: 10000,
    retries: 3,
    skipOptional: false,
    includePerformance: true,
  });

  const {
    runTests,
    cancelTests,
    currentSuite,
    isRunning,
    getDiagnostics,
    diagnostics,
    isLoadingDiagnostics,
    getTroubleshootingSteps,
    runAutomatedFix,
    testHistory,
    getHealthScore,
    getRecommendations,
  } = useIntegrationTesting({
    integrationId,
    autoRun,
    configuration: testConfig,
  });

  const troubleshootingSteps = getTroubleshootingSteps(diagnostics || undefined);

  // Handle test execution
  const handleRunTests = async () => {
    try {
      await runTests(testConfig);
      notifications.show({
        title: 'Tests Complete',
        message: 'Connection tests have finished running',
        color: 'blue',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Test Failed',
        message: error.message || 'Failed to run tests',
        color: 'red',
      });
    }
  };

  // Handle diagnostics
  const handleGetDiagnostics = async () => {
    try {
      await getDiagnostics();
      setShowDiagnostics(true);
    } catch (error: any) {
      notifications.show({
        title: 'Diagnostics Failed',
        message: error.message || 'Failed to get diagnostics',
        color: 'red',
      });
    }
  };

  // Handle automated fix
  const handleAutomatedFix = async (stepId: string) => {
    try {
      const success = await runAutomatedFix(stepId);
      notifications.show({
        title: success ? 'Fix Applied' : 'Fix Failed',
        message: success 
          ? 'Automated fix has been applied successfully'
          : 'Failed to apply automated fix',
        color: success ? 'green' : 'red',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Fix Failed',
        message: error.message || 'Failed to apply fix',
        color: 'red',
      });
    }
  };

  // Get test status color
  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'green';
      case 'failed': return 'red';
      case 'warning': return 'orange';
      case 'skipped': return 'gray';
      default: return 'blue';
    }
  };

  // Get test status icon
  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <IconCheck size={16} />;
      case 'failed': return <IconX size={16} />;
      case 'warning': return <IconAlertTriangle size={16} />;
      case 'skipped': return <IconInfoCircle size={16} />;
      default: return <IconClock size={16} />;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <IconShield size={16} />;
      case 'network': return <IconNetwork size={16} />;
      case 'permissions': return <IconKey size={16} />;
      case 'configuration': return <IconSettings size={16} />;
      case 'provider': return <IconCloud size={16} />;
      default: return <IconTool size={16} />;
    }
  };

  // Compact view
  if (compact) {
    return (
      <Group gap="sm" align="center">
        {currentSuite && (
          <Badge
            color={
              currentSuite.status === 'completed' 
                ? getTestStatusColor(currentSuite.summary.failed > 0 ? 'failed' : 'passed')
                : 'blue'
            }
            variant="light"
          >
            {currentSuite.status === 'running' ? 'Testing...' : 
             currentSuite.summary.failed > 0 ? 'Issues Found' : 'Healthy'}
          </Badge>
        )}
        
        <Button
          size="xs"
          variant="light"
          leftSection={<IconTestPipe size={14} />}
          onClick={handleRunTests}
          loading={isRunning}
        >
          Test
        </Button>
        
        <Button
          size="xs"
          variant="light"
          leftSection={<IconBug size={14} />}
          onClick={handleGetDiagnostics}
          loading={isLoadingDiagnostics}
        >
          Diagnose
        </Button>
      </Group>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <IconTestPipe size={20} />
          <Text fw={500}>Connection Testing</Text>
          {isRunning && (
            <Badge color="blue" variant="light">
              Running
            </Badge>
          )}
        </Group>
        
        <Group gap="xs">
          <Tooltip label="Test configuration">
            <ActionIcon
              variant="light"
              onClick={() => setShowDetails(true)}
            >
              <IconSettings size={16} />
            </ActionIcon>
          </Tooltip>
          
          <Button
            size="sm"
            leftSection={<IconBug size={16} />}
            onClick={handleGetDiagnostics}
            loading={isLoadingDiagnostics}
            variant="light"
          >
            Diagnose
          </Button>
          
          <Button
            size="sm"
            leftSection={<IconTestPipe size={16} />}
            onClick={isRunning ? cancelTests : handleRunTests}
            loading={isRunning}
            color={isRunning ? 'red' : 'blue'}
          >
            {isRunning ? 'Cancel' : 'Run Tests'}
          </Button>
        </Group>
      </Group>

      <Stack gap="md">
        {/* Current Test Suite */}
        {currentSuite && (
          <Card withBorder p="md">
            <Group justify="space-between" mb="sm">
              <Text fw={500}>{currentSuite.name}</Text>
              <Group gap="xs">
                <Badge color={getTestStatusColor(currentSuite.status)}>
                  {currentSuite.status}
                </Badge>
                <Text size="sm" c="dimmed">
                  Health: {getHealthScore(currentSuite)}%
                </Text>
              </Group>
            </Group>
            
            <Text size="sm" c="dimmed" mb="md">
              {currentSuite.description}
            </Text>

            {/* Progress */}
            {currentSuite.status === 'running' && (
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">
                    Running tests...
                  </Text>
                  <Text size="sm" c="dimmed">
                    {currentSuite.summary.total > 0 && 
                     `${((currentSuite.tests.length / currentSuite.summary.total) * 100).toFixed(0)}%`
                    }
                  </Text>
                </Group>
                <Progress
                  value={currentSuite.summary.total > 0 
                    ? (currentSuite.tests.length / currentSuite.summary.total) * 100 
                    : 0
                  }
                  animated
                  color="blue"
                />
              </div>
            )}

            {/* Summary */}
            {currentSuite.status === 'completed' && (
              <Group gap="md" mb="md">
                <Group gap="xs">
                  <IconCheck size={16} color="var(--mantine-color-green-6)" />
                  <Text size="sm">{currentSuite.summary.passed} passed</Text>
                </Group>
                <Group gap="xs">
                  <IconX size={16} color="var(--mantine-color-red-6)" />
                  <Text size="sm">{currentSuite.summary.failed} failed</Text>
                </Group>
                <Group gap="xs">
                  <IconAlertTriangle size={16} color="var(--mantine-color-orange-6)" />
                  <Text size="sm">{currentSuite.summary.warnings} warnings</Text>
                </Group>
                <Group gap="xs">
                  <IconClock size={16} />
                  <Text size="sm">{currentSuite.summary.duration}ms</Text>
                </Group>
              </Group>
            )}

            {/* Test Results */}
            {currentSuite.tests.length > 0 && (
              <Stack gap="xs">
                {currentSuite.tests.slice(0, 5).map((test, index) => (
                  <Group key={index} gap="sm">
                    <Badge
                      size="sm"
                      color={getTestStatusColor(test.status)}
                      leftSection={getTestStatusIcon(test.status)}
                    >
                      {test.status}
                    </Badge>
                    <Text size="sm" style={{ flex: 1 }}>
                      {test.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {test.duration}ms
                    </Text>
                  </Group>
                ))}
                
                {currentSuite.tests.length > 5 && (
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => setShowDetails(true)}
                  >
                    View all {currentSuite.tests.length} tests
                  </Button>
                )}
              </Stack>
            )}

            {/* Recommendations */}
            {currentSuite.status === 'completed' && (
              <>
                {getRecommendations(currentSuite).length > 0 && (
                  <>
                    <Divider my="md" />
                    <Alert
                      icon={<IconInfoCircle size={16} />}
                      color="blue"
                      variant="light"
                    >
                      <Text size="sm" fw={500} mb="xs">
                        Recommendations
                      </Text>
                      <List size="sm" spacing="xs">
                        {getRecommendations(currentSuite).slice(0, 2).map((rec, index) => (
                          <List.Item key={index}>
                            <Text size="sm">{rec}</Text>
                          </List.Item>
                        ))}
                      </List>
                    </Alert>
                  </>
                )}
              </>
            )}
          </Card>
        )}

        {/* Troubleshooting Steps */}
        {troubleshootingSteps.length > 0 && (
          <Card withBorder p="md">
            <Group justify="space-between" mb="sm">
              <Text fw={500}>Troubleshooting Steps</Text>
              <Button
                size="xs"
                variant="light"
                onClick={() => setShowTroubleshooting(true)}
              >
                View All
              </Button>
            </Group>
            
            <Stack gap="sm">
              {troubleshootingSteps.slice(0, 3).map((step, index) => (
                <Group key={index} gap="sm" align="flex-start">
                  <Badge
                    size="sm"
                    color={
                      step.severity === 'critical' ? 'red' :
                      step.severity === 'high' ? 'orange' :
                      step.severity === 'medium' ? 'yellow' : 'blue'
                    }
                    leftSection={getCategoryIcon(step.category)}
                  >
                    {step.severity}
                  </Badge>
                  
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {step.title}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {step.description}
                    </Text>
                  </div>
                  
                  {step.action === 'automatic' && (
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => handleAutomatedFix(step.id)}
                    >
                      Fix
                    </Button>
                  )}
                </Group>
              ))}
            </Stack>
          </Card>
        )}

        {/* Test History */}
        {testHistory.length > 0 && (
          <Card withBorder p="md">
            <Text fw={500} mb="sm">Recent Test History</Text>
            <Timeline active={-1} bulletSize={20} lineWidth={2}>
              {testHistory.slice(0, 3).map((suite, index) => (
                <Timeline.Item
                  key={index}
                  bullet={
                    suite.summary.failed > 0 ? (
                      <IconX size={12} />
                    ) : (
                      <IconCheck size={12} />
                    )
                  }
                  title={`${suite.summary.passed}/${suite.summary.total} tests passed`}
                  color={suite.summary.failed > 0 ? 'red' : 'green'}
                >
                  <Text c="dimmed" size="sm">
                    {formatDistanceToNow(new Date(suite.startedAt))} ago
                  </Text>
                  <Text size="sm">
                    Duration: {suite.summary.duration}ms
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}
      </Stack>

      {/* Test Configuration Modal */}
      <Modal
        opened={showDetails}
        onClose={() => setShowDetails(false)}
        title="Test Configuration"
        size="md"
      >
        <Stack gap="md">
          <NumberInput
            label="Timeout (milliseconds)"
            description="Maximum time to wait for each test"
            value={testConfig.timeout}
            onChange={(value) => setTestConfig(prev => ({ ...prev, timeout: value as number }))}
            min={1000}
            max={60000}
            step={1000}
          />
          
          <NumberInput
            label="Retries"
            description="Number of retries for failed tests"
            value={testConfig.retries}
            onChange={(value) => setTestConfig(prev => ({ ...prev, retries: value as number }))}
            min={0}
            max={5}
          />
          
          <Switch
            label="Skip Optional Tests"
            description="Skip non-critical tests to run faster"
            checked={testConfig.skipOptional}
            onChange={(event) => setTestConfig(prev => ({ 
              ...prev, 
              skipOptional: event.currentTarget.checked 
            }))}
          />
          
          <Switch
            label="Include Performance Tests"
            description="Run additional performance and latency tests"
            checked={testConfig.includePerformance}
            onChange={(event) => setTestConfig(prev => ({ 
              ...prev, 
              includePerformance: event.currentTarget.checked 
            }))}
          />
          
          <Group justify="flex-end">
            <Button onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Diagnostics Modal */}
      <Modal
        opened={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
        title="Integration Diagnostics"
        size="lg"
      >
        {diagnostics && (
          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="token">Token</Tabs.Tab>
              <Tabs.Tab value="network">Network</Tabs.Tab>
              <Tabs.Tab value="permissions">Permissions</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview" pt="md">
              <Stack gap="md">
                <Group gap="md">
                  <div>
                    <Text size="sm" c="dimmed">Provider</Text>
                    <Text fw={500}>{diagnostics.provider.name}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">Type</Text>
                    <Text fw={500}>{diagnostics.provider.type}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">Version</Text>
                    <Text fw={500}>{diagnostics.provider.version || 'Unknown'}</Text>
                  </div>
                </Group>
                
                {diagnostics.lastError && (
                  <Alert
                    icon={<IconAlertTriangle size={16} />}
                    color="red"
                    variant="light"
                  >
                    <Text size="sm" fw={500}>Last Error</Text>
                    <Code block mt="xs">
                      {diagnostics.lastError.code}: {diagnostics.lastError.message}
                    </Code>
                    <Text size="xs" c="dimmed" mt="xs">
                      {formatDistanceToNow(new Date(diagnostics.lastError.timestamp))} ago
                    </Text>
                  </Alert>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="token" pt="md">
              <Stack gap="md">
                <Group gap="md">
                  <Badge
                    color={
                      diagnostics.token.status === 'valid' ? 'green' :
                      diagnostics.token.status === 'expired' ? 'red' : 'orange'
                    }
                  >
                    {diagnostics.token.status}
                  </Badge>
                  {diagnostics.token.expiresAt && (
                    <Text size="sm">
                      Expires: {formatDistanceToNow(new Date(diagnostics.token.expiresAt))}
                    </Text>
                  )}
                </Group>
                
                <div>
                  <Text size="sm" fw={500} mb="xs">Granted Scopes</Text>
                  <List size="sm">
                    {diagnostics.token.scopes.map((scope, index) => (
                      <List.Item key={index}>{scope}</List.Item>
                    ))}
                  </List>
                </div>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="network" pt="md">
              <Stack gap="md">
                <Group gap="md">
                  <div>
                    <Text size="sm" c="dimmed">Connectivity</Text>
                    <Badge color={diagnostics.network.connectivity === 'online' ? 'green' : 'red'}>
                      {diagnostics.network.connectivity}
                    </Badge>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">Latency</Text>
                    <Text fw={500}>{diagnostics.network.latency}ms</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">DNS Resolution</Text>
                    <Badge color={diagnostics.network.dnsResolution ? 'green' : 'red'}>
                      {diagnostics.network.dnsResolution ? 'Working' : 'Failed'}
                    </Badge>
                  </div>
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="permissions" pt="md">
              <Stack gap="md">
                <div>
                  <Text size="sm" fw={500} mb="xs">Granted Permissions</Text>
                  <List size="sm">
                    {diagnostics.permissions.granted.map((permission, index) => (
                      <List.Item key={index} icon={<IconCheck size={14} color="green" />}>
                        {permission}
                      </List.Item>
                    ))}
                  </List>
                </div>
                
                {diagnostics.permissions.missing.length > 0 && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">Missing Permissions</Text>
                    <List size="sm">
                      {diagnostics.permissions.missing.map((permission, index) => (
                        <List.Item key={index} icon={<IconX size={14} color="red" />}>
                          {permission}
                        </List.Item>
                      ))}
                    </List>
                  </div>
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        )}
      </Modal>

      {/* Troubleshooting Modal */}
      <Modal
        opened={showTroubleshooting}
        onClose={() => setShowTroubleshooting(false)}
        title="Troubleshooting Guide"
        size="lg"
      >
        <Stack gap="md">
          {troubleshootingSteps.map((step, index) => (
            <Card key={index} withBorder p="md">
              <Group justify="space-between" mb="sm">
                <Group gap="sm">
                  {getCategoryIcon(step.category)}
                  <Text fw={500}>{step.title}</Text>
                </Group>
                <Badge
                  color={
                    step.severity === 'critical' ? 'red' :
                    step.severity === 'high' ? 'orange' :
                    step.severity === 'medium' ? 'yellow' : 'blue'
                  }
                >
                  {step.severity}
                </Badge>
              </Group>
              
              <Text size="sm" mb="sm">
                {step.description}
              </Text>
              
              {step.instructions && (
                <Alert
                  icon={<IconInfoCircle size={16} />}
                  color="blue"
                  variant="light"
                  mb="sm"
                >
                  <Text size="sm">{step.instructions}</Text>
                </Alert>
              )}
              
              {step.action === 'automatic' && (
                <Button
                  size="sm"
                  leftSection={<IconTool size={16} />}
                  onClick={() => handleAutomatedFix(step.id)}
                >
                  Apply Automated Fix
                </Button>
              )}
            </Card>
          ))}
        </Stack>
      </Modal>
    </Paper>
  );
};