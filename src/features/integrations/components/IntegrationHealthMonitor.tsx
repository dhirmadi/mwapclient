import React, { useState } from 'react';
import {
  Paper,
  Group,
  Text,
  Badge,
  Progress,
  ActionIcon,
  Tooltip,
  Stack,
  Alert,
  List,
  Button,
  Modal,
  Timeline,
  RingProgress,
  SimpleGrid,
  Card,
  Divider,
} from '@mantine/core';
import {
  IconActivity,
  IconRefresh,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconClock,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconInfoCircle,
  IconSettings,
  IconChartBar,
} from '@tabler/icons-react';
import { useIntegrationHealth } from '../hooks';
import { formatDistanceToNow } from '../utils';

interface IntegrationHealthMonitorProps {
  integrationId: string;
  compact?: boolean;
  showRecommendations?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onHealthChange?: (health: any) => void;
  onIssueDetected?: (issue: any) => void;
}

export const IntegrationHealthMonitor: React.FC<IntegrationHealthMonitorProps> = ({
  integrationId,
  compact = false,
  showRecommendations = true,
  autoRefresh = true,
  refreshInterval = 30000,
  onHealthChange,
  onIssueDetected,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    health,
    isLoading,
    error,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkNow,
    getHealthScore,
    getHealthTrend,
    getRecommendations,
  } = useIntegrationHealth({
    integrationId,
    enabled: true,
    interval: refreshInterval,
    onHealthChange,
    onIssueDetected,
  });

  const healthScore = getHealthScore();
  const trend = getHealthTrend();
  const recommendations = getRecommendations();

  // Get health color based on score
  const getHealthColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  };

  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <IconTrendingUp size={16} color="var(--mantine-color-green-6)" />;
      case 'declining':
        return <IconTrendingDown size={16} color="var(--mantine-color-red-6)" />;
      default:
        return <IconMinus size={16} color="var(--mantine-color-gray-6)" />;
    }
  };

  // Render compact view
  if (compact) {
    return (
      <Group gap="sm" align="center">
        <RingProgress
          size={32}
          thickness={4}
          sections={[{ value: healthScore, color: getHealthColor(healthScore) }]}
          label={
            <Text size="xs" ta="center" fw={700}>
              {healthScore}
            </Text>
          }
        />
        
        <div>
          <Group gap="xs" align="center">
            <Text size="sm" fw={500}>
              Health: {healthScore}%
            </Text>
            {getTrendIcon()}
          </Group>
          
          {health && (
            <Text size="xs" c="dimmed">
              Last checked: {formatDistanceToNow(new Date(health.lastChecked))} ago
            </Text>
          )}
        </div>
        
        <Tooltip label={isMonitoring ? 'Stop monitoring' : 'Start monitoring'}>
          <ActionIcon
            variant="light"
            color={isMonitoring ? 'red' : 'green'}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            <IconActivity size={16} />
          </ActionIcon>
        </Tooltip>
        
        <Tooltip label="Check now">
          <ActionIcon
            variant="light"
            onClick={checkNow}
            loading={isLoading}
          >
            <IconRefresh size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    );
  }

  // Render full view
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <IconActivity size={20} />
          <Text fw={500}>Health Monitor</Text>
          <Badge
            color={isMonitoring ? 'green' : 'gray'}
            variant="light"
            size="sm"
          >
            {isMonitoring ? 'Active' : 'Inactive'}
          </Badge>
        </Group>
        
        <Group gap="xs">
          <Tooltip label="View details">
            <ActionIcon
              variant="light"
              onClick={() => setShowDetails(true)}
            >
              <IconChartBar size={16} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label={isMonitoring ? 'Stop monitoring' : 'Start monitoring'}>
            <ActionIcon
              variant="light"
              color={isMonitoring ? 'red' : 'green'}
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
            >
              <IconActivity size={16} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="Check now">
            <ActionIcon
              variant="light"
              onClick={checkNow}
              loading={isLoading}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {error && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="red"
          variant="light"
          mb="md"
        >
          <Text size="sm">
            Failed to load health data: {error.message}
          </Text>
        </Alert>
      )}

      {health && (
        <Stack gap="md">
          {/* Health Score */}
          <SimpleGrid cols={3} spacing="md">
            <Card withBorder p="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>Overall Health</Text>
                {getTrendIcon()}
              </Group>
              <Group align="center" gap="sm">
                <RingProgress
                  size={60}
                  thickness={6}
                  sections={[{ value: healthScore, color: getHealthColor(healthScore) }]}
                  label={
                    <Text size="sm" ta="center" fw={700}>
                      {healthScore}%
                    </Text>
                  }
                />
                <div>
                  <Text size="xs" c="dimmed">
                    {trend === 'improving' ? 'Improving' : 
                     trend === 'declining' ? 'Declining' : 'Stable'}
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder p="sm">
              <Text size="sm" fw={500} mb="xs">Token Status</Text>
              <Group gap="xs" align="center">
                {health.tokenHealth.isExpired ? (
                  <IconX size={16} color="var(--mantine-color-red-6)" />
                ) : health.tokenHealth.isExpiringSoon ? (
                  <IconAlertTriangle size={16} color="var(--mantine-color-orange-6)" />
                ) : (
                  <IconCheck size={16} color="var(--mantine-color-green-6)" />
                )}
                <Text size="sm" tt="capitalize">
                  {health.tokenHealth.status.replace('_', ' ')}
                </Text>
              </Group>
              {health.tokenHealth.expiresAt && (
                <Text size="xs" c="dimmed" mt="xs">
                  Expires: {formatDistanceToNow(new Date(health.tokenHealth.expiresAt))}
                </Text>
              )}
            </Card>

            <Card withBorder p="sm">
              <Text size="sm" fw={500} mb="xs">Performance</Text>
              <Stack gap="xs">
                <div>
                  <Group justify="space-between">
                    <Text size="xs">Uptime</Text>
                    <Text size="xs">{health.metrics.uptime.toFixed(1)}%</Text>
                  </Group>
                  <Progress
                    value={health.metrics.uptime}
                    size="xs"
                    color={health.metrics.uptime > 95 ? 'green' : 'orange'}
                  />
                </div>
                <Text size="xs" c="dimmed">
                  Avg response: {health.metrics.responseTime}ms
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          {/* Issues */}
          {health.issues.length > 0 && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="orange"
              variant="light"
            >
              <Text size="sm" fw={500} mb="xs">
                {health.issues.length} Issue{health.issues.length > 1 ? 's' : ''} Detected
              </Text>
              <List size="sm" spacing="xs">
                {health.issues.slice(0, 3).map((issue, index) => (
                  <List.Item key={index}>
                    <Text size="sm">{issue.message}</Text>
                    {issue.action && (
                      <Text size="xs" c="dimmed">
                        Action: {issue.action}
                      </Text>
                    )}
                  </List.Item>
                ))}
              </List>
              {health.issues.length > 3 && (
                <Button
                  size="xs"
                  variant="subtle"
                  mt="xs"
                  onClick={() => setShowDetails(true)}
                >
                  View all {health.issues.length} issues
                </Button>
              )}
            </Alert>
          )}

          {/* Recommendations */}
          {showRecommendations && recommendations.length > 0 && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="blue"
              variant="light"
            >
              <Text size="sm" fw={500} mb="xs">
                Recommendations
              </Text>
              <List size="sm" spacing="xs">
                {recommendations.slice(0, 2).map((recommendation, index) => (
                  <List.Item key={index}>
                    <Text size="sm">{recommendation}</Text>
                  </List.Item>
                ))}
              </List>
              {recommendations.length > 2 && (
                <Button
                  size="xs"
                  variant="subtle"
                  mt="xs"
                  onClick={() => setShowDetails(true)}
                >
                  View all recommendations
                </Button>
              )}
            </Alert>
          )}

          {/* Last Check Info */}
          <Group justify="space-between">
            <Group gap="xs">
              <IconClock size={14} />
              <Text size="xs" c="dimmed">
                Last checked: {formatDistanceToNow(new Date(health.lastChecked))} ago
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Next check: {formatDistanceToNow(new Date(health.nextCheck))}
            </Text>
          </Group>
        </Stack>
      )}

      {/* Details Modal */}
      <Modal
        opened={showDetails}
        onClose={() => setShowDetails(false)}
        title="Health Monitor Details"
        size="lg"
      >
        {health && (
          <Stack gap="md">
            {/* Detailed Metrics */}
            <div>
              <Text fw={500} mb="sm">Performance Metrics</Text>
              <SimpleGrid cols={2} spacing="sm">
                <div>
                  <Text size="sm" c="dimmed">Total Requests</Text>
                  <Text fw={500}>{health.metrics.totalRequests.toLocaleString()}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Failed Requests</Text>
                  <Text fw={500}>{health.metrics.failedRequests.toLocaleString()}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Error Rate</Text>
                  <Text fw={500}>{health.metrics.errorRate.toFixed(2)}%</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Last Success</Text>
                  <Text fw={500}>
                    {formatDistanceToNow(new Date(health.metrics.lastSuccessfulConnection))} ago
                  </Text>
                </div>
              </SimpleGrid>
            </div>

            <Divider />

            {/* All Issues */}
            {health.issues.length > 0 && (
              <div>
                <Text fw={500} mb="sm">All Issues</Text>
                <Timeline active={-1} bulletSize={24} lineWidth={2}>
                  {health.issues.map((issue, index) => (
                    <Timeline.Item
                      key={index}
                      bullet={
                        issue.type === 'error' ? (
                          <IconX size={12} />
                        ) : issue.type === 'warning' ? (
                          <IconAlertTriangle size={12} />
                        ) : (
                          <IconInfoCircle size={12} />
                        )
                      }
                      title={issue.message}
                      color={
                        issue.type === 'error' ? 'red' :
                        issue.type === 'warning' ? 'orange' : 'blue'
                      }
                    >
                      <Text c="dimmed" size="sm">
                        {formatDistanceToNow(new Date(issue.timestamp))} ago
                      </Text>
                      {issue.details && (
                        <Text size="sm" mt="xs">
                          {issue.details}
                        </Text>
                      )}
                      {issue.action && (
                        <Text size="sm" mt="xs" fw={500}>
                          Action: {issue.action}
                        </Text>
                      )}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            )}

            {/* All Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <Text fw={500} mb="sm">All Recommendations</Text>
                <List spacing="sm">
                  {recommendations.map((recommendation, index) => (
                    <List.Item key={index}>
                      <Text size="sm">{recommendation}</Text>
                    </List.Item>
                  ))}
                </List>
              </div>
            )}
          </Stack>
        )}
      </Modal>
    </Paper>
  );
};