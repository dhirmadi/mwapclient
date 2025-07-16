import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { apiClient } from '../../../shared/utils/api';

interface TestResult {
  testId: string;
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  message: string;
  details?: string;
  duration: number; // milliseconds
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ConnectionTestSuite {
  integrationId: string;
  suiteId: string;
  name: string;
  description: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
    duration: number;
  };
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
}

interface TestConfiguration {
  timeout?: number; // milliseconds
  retries?: number;
  skipOptional?: boolean;
  includePerformance?: boolean;
  customTests?: string[];
}

interface DiagnosticInfo {
  integrationId: string;
  provider: {
    name: string;
    type: string;
    version?: string;
    endpoints: string[];
  };
  token: {
    status: 'valid' | 'expired' | 'invalid' | 'missing';
    expiresAt?: string;
    scopes: string[];
    issuer?: string;
  };
  network: {
    connectivity: 'online' | 'offline' | 'limited';
    latency: number;
    bandwidth?: number;
    dnsResolution: boolean;
  };
  permissions: {
    granted: string[];
    missing: string[];
    excessive: string[];
  };
  quotas: {
    current: number;
    limit: number;
    resetTime?: string;
  };
  lastError?: {
    code: string;
    message: string;
    timestamp: string;
    context?: Record<string, any>;
  };
}

interface TroubleshootingStep {
  id: string;
  title: string;
  description: string;
  action: 'manual' | 'automatic' | 'informational';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'network' | 'permissions' | 'configuration' | 'provider';
  instructions?: string;
  automatedFix?: () => Promise<boolean>;
  verificationTest?: string; // Test ID to run after fix
}

interface UseIntegrationTestingOptions {
  integrationId: string;
  autoRun?: boolean;
  configuration?: TestConfiguration;
}

interface UseIntegrationTestingReturn {
  // Test execution
  runTests: (config?: TestConfiguration) => Promise<ConnectionTestSuite>;
  cancelTests: () => void;
  
  // Current test state
  currentSuite: ConnectionTestSuite | null;
  isRunning: boolean;
  
  // Diagnostics
  getDiagnostics: () => Promise<DiagnosticInfo>;
  diagnostics: DiagnosticInfo | null;
  isLoadingDiagnostics: boolean;
  
  // Troubleshooting
  getTroubleshootingSteps: (diagnostics?: DiagnosticInfo) => TroubleshootingStep[];
  runAutomatedFix: (stepId: string) => Promise<boolean>;
  
  // Test history
  testHistory: ConnectionTestSuite[];
  isLoadingHistory: boolean;
  
  // Utilities
  getHealthScore: (suite: ConnectionTestSuite) => number;
  getRecommendations: (suite: ConnectionTestSuite) => string[];
}

export const useIntegrationTesting = ({
  integrationId,
  autoRun = false,
  configuration,
}: UseIntegrationTestingOptions): UseIntegrationTestingReturn => {
  const [currentSuite, setCurrentSuite] = useState<ConnectionTestSuite | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Run connection tests
  const runTestsMutation = useMutation({
    mutationFn: async (config: TestConfiguration = {}): Promise<ConnectionTestSuite> => {
      const controller = new AbortController();
      setAbortController(controller);

      try {
        const response = await apiClient.post(
          `/integrations/${integrationId}/test`,
          {
            configuration: { ...configuration, ...config },
          },
          { signal: controller.signal }
        );

        const suite: ConnectionTestSuite = response.data.data;
        setCurrentSuite(suite);
        return suite;
      } finally {
        setAbortController(null);
      }
    },
  });

  // Get diagnostics
  const diagnosticsQuery = useQuery({
    queryKey: ['integration-diagnostics', integrationId],
    queryFn: async (): Promise<DiagnosticInfo> => {
      const response = await apiClient.get(`/integrations/${integrationId}/diagnostics`);
      return response.data.data;
    },
    enabled: !!integrationId,
    staleTime: 30000, // 30 seconds
  });

  // Get test history
  const historyQuery = useQuery({
    queryKey: ['integration-test-history', integrationId],
    queryFn: async (): Promise<ConnectionTestSuite[]> => {
      const response = await apiClient.get(`/integrations/${integrationId}/test-history`);
      return response.data.data;
    },
    enabled: !!integrationId,
    staleTime: 60000, // 1 minute
  });

  // Cancel running tests
  const cancelTests = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setCurrentSuite(prev => prev ? { ...prev, status: 'cancelled' } : null);
    }
  }, [abortController]);

  // Get troubleshooting steps based on diagnostics
  const getTroubleshootingSteps = useCallback((
    diagnostics?: DiagnosticInfo
  ): TroubleshootingStep[] => {
    const diag = diagnostics || diagnosticsQuery.data;
    if (!diag) return [];

    const steps: TroubleshootingStep[] = [];

    // Token issues
    if (diag.token.status === 'expired') {
      steps.push({
        id: 'refresh-token',
        title: 'Refresh Access Token',
        description: 'The access token has expired and needs to be refreshed',
        action: 'automatic',
        severity: 'high',
        category: 'authentication',
        instructions: 'Click the refresh button to automatically renew the access token',
        automatedFix: async () => {
          try {
            await apiClient.post(`/integrations/${integrationId}/refresh-token`);
            return true;
          } catch {
            return false;
          }
        },
        verificationTest: 'token-validation',
      });
    }

    if (diag.token.status === 'invalid') {
      steps.push({
        id: 'reauthorize',
        title: 'Re-authorize Integration',
        description: 'The access token is invalid and requires re-authorization',
        action: 'manual',
        severity: 'critical',
        category: 'authentication',
        instructions: 'You need to go through the OAuth flow again to re-authorize this integration',
      });
    }

    // Permission issues
    if (diag.permissions.missing.length > 0) {
      steps.push({
        id: 'grant-permissions',
        title: 'Grant Missing Permissions',
        description: `Missing required permissions: ${diag.permissions.missing.join(', ')}`,
        action: 'manual',
        severity: 'high',
        category: 'permissions',
        instructions: 'Re-authorize the integration to grant the missing permissions',
      });
    }

    // Network issues
    if (diag.network.connectivity === 'offline') {
      steps.push({
        id: 'check-network',
        title: 'Check Network Connectivity',
        description: 'Unable to reach the provider\'s servers',
        action: 'manual',
        severity: 'critical',
        category: 'network',
        instructions: 'Check your internet connection and firewall settings',
      });
    }

    if (diag.network.latency > 5000) {
      steps.push({
        id: 'network-performance',
        title: 'Network Performance Issue',
        description: `High latency detected (${diag.network.latency}ms)`,
        action: 'informational',
        severity: 'medium',
        category: 'network',
        instructions: 'Consider checking your network connection or contacting your ISP',
      });
    }

    // Quota issues
    if (diag.quotas.current >= diag.quotas.limit * 0.9) {
      steps.push({
        id: 'quota-limit',
        title: 'API Quota Nearly Exhausted',
        description: `Using ${diag.quotas.current}/${diag.quotas.limit} of API quota`,
        action: 'informational',
        severity: 'medium',
        category: 'configuration',
        instructions: diag.quotas.resetTime 
          ? `Quota resets at ${new Date(diag.quotas.resetTime).toLocaleString()}`
          : 'Consider upgrading your plan or reducing API usage',
      });
    }

    // Provider-specific issues
    if (diag.lastError) {
      steps.push({
        id: 'last-error',
        title: 'Resolve Last Error',
        description: `Last error: ${diag.lastError.message}`,
        action: 'manual',
        severity: 'medium',
        category: 'provider',
        instructions: `Error code: ${diag.lastError.code}. Check provider documentation for details.`,
      });
    }

    return steps.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [integrationId, diagnosticsQuery.data]);

  // Run automated fix
  const runAutomatedFix = useCallback(async (stepId: string): Promise<boolean> => {
    const steps = getTroubleshootingSteps();
    const step = steps.find(s => s.id === stepId);
    
    if (!step || !step.automatedFix) {
      return false;
    }

    try {
      const success = await step.automatedFix();
      
      // Run verification test if specified
      if (success && step.verificationTest) {
        await runTestsMutation.mutateAsync({
          customTests: [step.verificationTest],
        });
      }
      
      return success;
    } catch (error) {
      console.error(`Automated fix failed for step ${stepId}:`, error);
      return false;
    }
  }, [getTroubleshootingSteps, runTestsMutation]);

  // Calculate health score from test results
  const getHealthScore = useCallback((suite: ConnectionTestSuite): number => {
    if (!suite || suite.summary.total === 0) return 0;

    const { summary } = suite;
    const passedWeight = 1.0;
    const warningWeight = 0.7;
    const failedWeight = 0.0;
    const skippedWeight = 0.5;

    const weightedScore = (
      summary.passed * passedWeight +
      summary.warnings * warningWeight +
      summary.failed * failedWeight +
      summary.skipped * skippedWeight
    ) / summary.total;

    return Math.round(weightedScore * 100);
  }, []);

  // Get recommendations based on test results
  const getRecommendations = useCallback((suite: ConnectionTestSuite): string[] => {
    if (!suite) return [];

    const recommendations: string[] = [];
    const { tests, summary } = suite;

    // Performance recommendations
    if (summary.duration > 10000) {
      recommendations.push('Tests took longer than expected - check network connectivity');
    }

    // Failed test recommendations
    const failedTests = tests.filter(test => test.status === 'failed');
    if (failedTests.length > 0) {
      recommendations.push(`${failedTests.length} test(s) failed - review error details and run diagnostics`);
    }

    // Warning recommendations
    const warningTests = tests.filter(test => test.status === 'warning');
    if (warningTests.length > 0) {
      recommendations.push(`${warningTests.length} test(s) have warnings - consider addressing these issues`);
    }

    // Specific test recommendations
    const tokenTest = tests.find(test => test.name.includes('token'));
    if (tokenTest && tokenTest.status === 'failed') {
      recommendations.push('Token validation failed - refresh or re-authorize the integration');
    }

    const permissionTest = tests.find(test => test.name.includes('permission'));
    if (permissionTest && tokenTest.status === 'failed') {
      recommendations.push('Permission test failed - check granted scopes and re-authorize if needed');
    }

    const connectivityTest = tests.find(test => test.name.includes('connectivity'));
    if (connectivityTest && connectivityTest.status === 'failed') {
      recommendations.push('Connectivity test failed - check network settings and firewall rules');
    }

    // General recommendations
    if (summary.passed / summary.total < 0.8) {
      recommendations.push('Overall test success rate is low - run full diagnostics and review troubleshooting steps');
    }

    return recommendations;
  }, []);

  // Auto-run tests if enabled
  React.useEffect(() => {
    if (autoRun && integrationId && !currentSuite) {
      runTestsMutation.mutate(configuration);
    }
  }, [autoRun, integrationId, configuration, currentSuite, runTestsMutation]);

  return {
    // Test execution
    runTests: runTestsMutation.mutateAsync,
    cancelTests,
    
    // Current test state
    currentSuite,
    isRunning: runTestsMutation.isPending,
    
    // Diagnostics
    getDiagnostics: diagnosticsQuery.refetch,
    diagnostics: diagnosticsQuery.data || null,
    isLoadingDiagnostics: diagnosticsQuery.isLoading,
    
    // Troubleshooting
    getTroubleshootingSteps,
    runAutomatedFix,
    
    // Test history
    testHistory: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    
    // Utilities
    getHealthScore,
    getRecommendations,
  };
};