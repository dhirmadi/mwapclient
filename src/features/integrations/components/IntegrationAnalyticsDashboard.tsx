import React, { useState } from 'react';
import {
  Paper,
  Group,
  Text,
  Select,
  SimpleGrid,
  Card,
  RingProgress,
  Badge,
  Stack,
  Alert,
  List,
  Button,
  Modal,
  Tabs,
  Table,
  Progress,
  ActionIcon,
  Tooltip,
  Divider,
} from '@mantine/core';
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconRefresh,
  IconDownload,
  IconInfoCircle,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconActivity,
  IconDatabase,
  IconFile,
} from '@tabler/icons-react';
import { useIntegrationAnalytics, useTenantAnalytics } from '../hooks';
import { formatDistanceToNow } from '../utils';

interface IntegrationAnalyticsDashboardProps {
  integrationId?: string;
  tenantId?: string;
  period?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  compact?: boolean;
}

export const IntegrationAnalyticsDashboard: React.FC<IntegrationAnalyticsDashboardProps> = ({
  integrationId,
  tenantId,
  period: initialPeriod = 'week',
  compact = false,
}) => {
  const [period, setPeriod] = useState(initialPeriod);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Use appropriate analytics hook
  const integrationAnalytics = useIntegrationAnalytics({
    integrationId: integrationId!,
    period,
    enabled: !!integrationId,
  });

  const tenantAnalytics = useTenantAnalytics({
    tenantId: tenantId!,
    period: period === 'hour' ? 'day' : period,
    enabled: !!tenantId && !integrationId,
  });

  // Determine which analytics to use
  const analytics = integrationId ? integrationAnalytics.analytics : tenantAnalytics.analytics;
  const isLoading = integrationId ? integrationAnalytics.isLoading : tenantAnalytics.isLoading;
  const error = integrationId ? integrationAnalytics.error : tenantAnalytics.error;
  const refetch = integrationId ? integrationAnalytics.refetch : tenantAnalytics.refetch;

  // Get computed metrics
  const getUsageScore = integrationId ? integrationAnalytics.getUsageScore : () => 0;
  const getPerformanceScore = integrationId ? integrationAnalytics.getPerformanceScore : () => 0;
  const getReliabilityScore = integrationId ? integrationAnalytics.getReliabilityScore : () => 0;
  const getUsageTrend = integrationId ? integrationAnalytics.getUsageTrend : () => 'stable' as const;
  const getHealthInsights = integrationId ? integrationAnalytics.getHealthInsights : () => [];
  const getOptimizationSuggestions = integrationId ? integrationAnalytics.getOptimizationSuggestions : () => [];

  // Period options
  const periodOptions = [
    { value: 'hour', label: 'Last Hour' },
    { value: 'day', label: 'Last Day' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' },
  ];

  // Get trend icon
  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return <IconTrendingUp size={16} color="var(--mantine-color-green-6)" />;
      case 'decreasing':
        return <IconTrendingDown size={16} color="var(--mantine-color-red-6)" />;
      default:
        return <IconMinus size={16} color="var(--mantine-color-gray-6)" />;
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (error) {
    return (
      <Alert
        icon={<IconAlertTriangle size={16} />}
        color="red"
        variant="light"
      >
        <Text size="sm">
          Failed to load analytics data: {error.message}
        </Text>
        <Button size="xs" variant="light" mt="xs" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (compact && analytics) {
    const usageScore = getUsageScore();
    const trend = getUsageTrend();
    
    return (
      <Group gap="md" align="center">
        <RingProgress
          size={40}
          thickness={4}
          sections={[{ value: usageScore, color: getScoreColor(usageScore) }]}
          label={
            <Text size="xs" ta="center" fw={700}>
              {usageScore}
            </Text>
          }
        />
        
        <div>
          <Group gap="xs" align="center">
            <Text size="sm" fw={500}>
              Usage: {usageScore}%
            </Text>
            {getTrendIcon(trend)}
          </Group>
          
          {integrationId && analytics && 'usage' in analytics && (
            <Text size="xs" c="dimmed">
              {analytics.usage.totalRequests.toLocaleString()} requests
            </Text>
          )}
        </div>
        
        <Button
          size="xs"
          variant="light"
          leftSection={<IconChartBar size={14} />}
          onClick={() => setShowDetails(true)}
        >
          Details
        </Button>
      </Group>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <IconChartBar size={20} />
          <Text fw={500}>
            {integrationId ? 'Integration Analytics' : 'Tenant Analytics'}
          </Text>
        </Group>
        
        <Group gap="sm">
          <Select
            size="sm"
            value={period}
            onChange={(value) => setPeriod(value as any)}
            data={periodOptions}
            style={{ width: 150 }}
          />
          
          <Tooltip label="Refresh data">
            <ActionIcon
              variant="light"
              onClick={() => refetch()}
              loading={isLoading}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="Export data">
            <ActionIcon variant="light">
              <IconDownload size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {analytics && (
        <Stack gap="md">
          {/* Key Metrics */}
          {integrationId && 'usage' in analytics ? (
            // Integration-specific metrics
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
              <Card withBorder p="sm">
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>Usage Score</Text>
                  {getTrendIcon(getUsageTrend())}
                </Group>
                <RingProgress
                  size={60}
                  thickness={6}
                  sections={[{ value: getUsageScore(), color: getScoreColor(getUsageScore()) }]}
                  label={
                    <Text size="sm" ta="center" fw={700}>
                      {getUsageScore()}%
                    </Text>
                  }
                />
              </Card>

              <Card withBorder p="sm">
                <Text size="sm" fw={500} mb="xs">Performance</Text>
                <RingProgress
                  size={60}
                  thickness={6}
                  sections={[{ value: getPerformanceScore(), color: getScoreColor(getPerformanceScore()) }]}
                  label={
                    <Text size="sm" ta="center" fw={700}>
                      {getPerformanceScore()}%
                    </Text>
                  }
                />
              </Card>

              <Card withBorder p="sm">
                <Text size="sm" fw={500} mb="xs">Reliability</Text>
                <RingProgress
                  size={60}
                  thickness={6}
                  sections={[{ value: getReliabilityScore(), color: getScoreColor(getReliabilityScore()) }]}
                  label={
                    <Text size="sm" ta="center" fw={700}>
                      {getReliabilityScore()}%
                    </Text>
                  }
                />
              </Card>

              <Card withBorder p="sm">
                <Text size="sm" fw={500} mb="xs">Requests</Text>
                <Stack gap="xs">
                  <Text size="lg" fw={700}>
                    {analytics.usage.totalRequests.toLocaleString()}
                  </Text>
                  <Group gap="xs">
                    <Badge size="xs" color="green">
                      {analytics.usage.successfulRequests.toLocaleString()} success
                    </Badge>
                    <Badge size="xs" color="red">
                      {analytics.usage.failedRequests.toLocaleString()} failed
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </SimpleGrid>
          ) : (
            // Tenant-wide metrics
            'overview' in analytics && (
              <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
                <Card withBorder p="sm">
                  <Group gap="xs" mb="xs">
                    <IconActivity size={16} />
                    <Text size="sm" fw={500}>Integrations</Text>
                  </Group>
                  <Text size="lg" fw={700}>
                    {analytics.overview.activeIntegrations} / {analytics.overview.totalIntegrations}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Active integrations
                  </Text>
                </Card>

                <Card withBorder p="sm">
                  <Group gap="xs" mb="xs">
                    <IconChartBar size={16} />
                    <Text size="sm" fw={500}>Requests</Text>
                  </Group>
                  <Text size="lg" fw={700}>
                    {analytics.overview.totalRequests.toLocaleString()}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Total API requests
                  </Text>
                </Card>

                <Card withBorder p="sm">
                  <Group gap="xs" mb="xs">
                    <IconDatabase size={16} />
                    <Text size="sm" fw={500}>Data Transfer</Text>
                  </Group>
                  <Text size="lg" fw={700}>
                    {formatBytes(analytics.overview.totalDataTransferred)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Total transferred
                  </Text>
                </Card>

                <Card withBorder p="sm">
                  <Group gap="xs" mb="xs">
                    <IconCheck size={16} />
                    <Text size="sm" fw={500}>Uptime</Text>
                  </Group>
                  <Text size="lg" fw={700}>
                    {analytics.overview.averageUptime.toFixed(1)}%
                  </Text>
                  <Text size="xs" c="dimmed">
                    Average uptime
                  </Text>
                </Card>
              </SimpleGrid>
            )
          )}

          {/* Additional Stats */}
          {integrationId && 'usage' in analytics && (
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Card withBorder p="sm">
                <Group gap="xs" mb="xs">
                  <IconDatabase size={16} />
                  <Text size="sm" fw={500}>Data Transfer</Text>
                </Group>
                <Text size="lg" fw={700}>
                  {formatBytes(analytics.usage.dataTransferred)}
                </Text>
                <Text size="xs" c="dimmed">
                  Total data transferred
                </Text>
              </Card>

              <Card withBorder p="sm">
                <Group gap="xs" mb="xs">
                  <IconFile size={16} />
                  <Text size="sm" fw={500}>Files Accessed</Text>
                </Group>
                <Text size="lg" fw={700}>
                  {analytics.usage.filesAccessed.toLocaleString()}
                </Text>
                <Text size="xs" c="dimmed">
                  Unique files accessed
                </Text>
              </Card>

              <Card withBorder p="sm">
                <Group gap="xs" mb="xs">
                  <IconClock size={16} />
                  <Text size="sm" fw={500}>Response Time</Text>
                </Group>
                <Text size="lg" fw={700}>
                  {analytics.usage.averageResponseTime}ms
                </Text>
                <Text size="xs" c="dimmed">
                  Average response time
                </Text>
              </Card>
            </SimpleGrid>
          )}

          {/* Insights and Recommendations */}
          {integrationId && (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              {/* Health Insights */}
              {getHealthInsights().length > 0 && (
                <Alert
                  icon={<IconInfoCircle size={16} />}
                  color="blue"
                  variant="light"
                >
                  <Text size="sm" fw={500} mb="xs">
                    Health Insights
                  </Text>
                  <List size="sm" spacing="xs">
                    {getHealthInsights().slice(0, 3).map((insight, index) => (
                      <List.Item key={index}>
                        <Text size="sm">{insight}</Text>
                      </List.Item>
                    ))}
                  </List>
                  {getHealthInsights().length > 3 && (
                    <Button
                      size="xs"
                      variant="subtle"
                      mt="xs"
                      onClick={() => setShowDetails(true)}
                    >
                      View all insights
                    </Button>
                  )}
                </Alert>
              )}

              {/* Optimization Suggestions */}
              {getOptimizationSuggestions().length > 0 && (
                <Alert
                  icon={<IconTrendingUp size={16} />}
                  color="green"
                  variant="light"
                >
                  <Text size="sm" fw={500} mb="xs">
                    Optimization Suggestions
                  </Text>
                  <List size="sm" spacing="xs">
                    {getOptimizationSuggestions().slice(0, 3).map((suggestion, index) => (
                      <List.Item key={index}>
                        <Text size="sm">{suggestion}</Text>
                      </List.Item>
                    ))}
                  </List>
                  {getOptimizationSuggestions().length > 3 && (
                    <Button
                      size="xs"
                      variant="subtle"
                      mt="xs"
                      onClick={() => setShowDetails(true)}
                    >
                      View all suggestions
                    </Button>
                  )}
                </Alert>
              )}
            </SimpleGrid>
          )}

          {/* Period Info */}
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Period: {analytics.period.start} to {analytics.period.end}
            </Text>
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconChartBar size={14} />}
              onClick={() => setShowDetails(true)}
            >
              View Detailed Analytics
            </Button>
          </Group>
        </Stack>
      )}

      {/* Detailed Analytics Modal */}
      <Modal
        opened={showDetails}
        onClose={() => setShowDetails(false)}
        title="Detailed Analytics"
        size="xl"
      >
        {analytics && (
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              {integrationId && (
                <>
                  <Tabs.Tab value="performance">Performance</Tabs.Tab>
                  <Tabs.Tab value="files">Top Files</Tabs.Tab>
                  <Tabs.Tab value="errors">Errors</Tabs.Tab>
                </>
              )}
              {!integrationId && (
                <Tabs.Tab value="integrations">Integrations</Tabs.Tab>
              )}
            </Tabs.List>

            <Tabs.Panel value="overview" pt="md">
              <Stack gap="md">
                {/* Detailed metrics would go here */}
                <Text>Detailed overview metrics and charts would be displayed here.</Text>
              </Stack>
            </Tabs.Panel>

            {integrationId && 'topFiles' in analytics && (
              <>
                <Tabs.Panel value="performance" pt="md">
                  <Stack gap="md">
                    <Text fw={500}>Performance Metrics</Text>
                    {/* Performance charts and detailed metrics */}
                    <Text>Performance trends and detailed metrics would be displayed here.</Text>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="files" pt="md">
                  <Stack gap="md">
                    <Text fw={500}>Most Accessed Files</Text>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>File Path</Table.Th>
                          <Table.Th>Access Count</Table.Th>
                          <Table.Th>Size</Table.Th>
                          <Table.Th>Last Accessed</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {analytics.topFiles.slice(0, 10).map((file, index) => (
                          <Table.Tr key={index}>
                            <Table.Td>
                              <Text size="sm" style={{ fontFamily: 'monospace' }}>
                                {file.path}
                              </Text>
                            </Table.Td>
                            <Table.Td>{file.accessCount.toLocaleString()}</Table.Td>
                            <Table.Td>{formatBytes(file.size)}</Table.Td>
                            <Table.Td>
                              {formatDistanceToNow(new Date(file.lastAccessed))} ago
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="errors" pt="md">
                  <Stack gap="md">
                    <Text fw={500}>Error Breakdown</Text>
                    <Stack gap="sm">
                      {analytics.errorBreakdown.map((error, index) => (
                        <Card key={index} withBorder p="sm">
                          <Group justify="space-between" mb="xs">
                            <Text fw={500}>{error.type}</Text>
                            <Badge color="red">{error.percentage.toFixed(1)}%</Badge>
                          </Group>
                          <Group justify="space-between">
                            <Text size="sm" c="dimmed">
                              {error.count.toLocaleString()} occurrences
                            </Text>
                            <Text size="sm" c="dimmed">
                              Last: {formatDistanceToNow(new Date(error.lastOccurrence))} ago
                            </Text>
                          </Group>
                          <Progress
                            value={error.percentage}
                            color="red"
                            size="xs"
                            mt="xs"
                          />
                        </Card>
                      ))}
                    </Stack>
                  </Stack>
                </Tabs.Panel>
              </>
            )}

            {!integrationId && 'integrationBreakdown' in analytics && (
              <Tabs.Panel value="integrations" pt="md">
                <Stack gap="md">
                  <Text fw={500}>Integration Performance</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Integration</Table.Th>
                        <Table.Th>Provider</Table.Th>
                        <Table.Th>Requests</Table.Th>
                        <Table.Th>Health Score</Table.Th>
                        <Table.Th>Data Transfer</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {analytics.integrationBreakdown.map((integration, index) => (
                        <Table.Tr key={index}>
                          <Table.Td>{integration.displayName}</Table.Td>
                          <Table.Td>{integration.providerName}</Table.Td>
                          <Table.Td>{integration.usage.totalRequests.toLocaleString()}</Table.Td>
                          <Table.Td>
                            <Badge color={getScoreColor(integration.healthScore)}>
                              {integration.healthScore}%
                            </Badge>
                          </Table.Td>
                          <Table.Td>{formatBytes(integration.usage.dataTransferred)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Stack>
              </Tabs.Panel>
            )}
          </Tabs>
        )}
      </Modal>
    </Paper>
  );
};