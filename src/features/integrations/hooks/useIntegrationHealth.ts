import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import api from '../../../shared/utils/api';
import { Integration, IntegrationHealthStatus, TokenHealth } from '../types';

interface IntegrationHealthData {
  integrationId: string;
  status: IntegrationHealthStatus;
  tokenHealth: TokenHealth;
  lastChecked: string;
  nextCheck: string;
  issues: HealthIssue[];
  metrics: HealthMetrics;
}

interface HealthIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  details?: string;
  action?: string;
  timestamp: string;
}

interface HealthMetrics {
  uptime: number; // percentage
  responseTime: number; // milliseconds
  errorRate: number; // percentage
  lastSuccessfulConnection: string;
  totalRequests: number;
  failedRequests: number;
}

interface UseIntegrationHealthOptions {
  integrationId: string;
  enabled?: boolean;
  interval?: number; // milliseconds, default 30000 (30 seconds)
  onHealthChange?: (health: IntegrationHealthData) => void;
  onIssueDetected?: (issue: HealthIssue) => void;
}

interface UseIntegrationHealthReturn {
  health: IntegrationHealthData | undefined;
  isLoading: boolean;
  error: Error | null;
  lastChecked: Date | null;
  nextCheck: Date | null;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  checkNow: () => Promise<IntegrationHealthData>;
  getHealthScore: () => number;
  getHealthTrend: () => 'improving' | 'stable' | 'declining';
  getRecommendations: () => string[];
}

export const useIntegrationHealth = ({
  integrationId,
  enabled = true,
  interval = 30000,
  onHealthChange,
  onIssueDetected,
}: UseIntegrationHealthOptions): UseIntegrationHealthReturn => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousHealthRef = useRef<IntegrationHealthData | null>(null);

  // Query key for health data
  const queryKey = ['integration-health', integrationId];

  // Fetch health data
  const fetchHealthData = useCallback(async (): Promise<IntegrationHealthData> => {
    const response = await api.get(`/integrations/${integrationId}/health`);
    return response.data.data;
  }, [integrationId]);

  // React Query for health data
  const {
    data: health,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchHealthData,
    enabled: enabled && !!integrationId,
    refetchInterval: false, // We'll handle intervals manually
    staleTime: 10000, // 10 seconds
    gcTime: 300000, // 5 minutes
  });

  // Manual health check
  const checkNow = useCallback(async (): Promise<IntegrationHealthData> => {
    const result = await refetch();
    return result.data!;
  }, [refetch]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        await checkNow();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, interval);
  }, [checkNow, interval]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Calculate health score (0-100)
  const getHealthScore = useCallback((): number => {
    if (!health) return 0;

    const { metrics, tokenHealth, status } = health;
    
    // Base score from uptime
    let score = metrics.uptime;
    
    // Adjust for token health
    switch (tokenHealth.status) {
      case 'active':
        score *= 1.0;
        break;
      case 'expiring_soon':
        score *= 0.8;
        break;
      case 'expired':
        score *= 0.3;
        break;
      case 'error':
        score *= 0.1;
        break;
      default:
        score *= 0.5;
    }
    
    // Adjust for response time (penalize slow responses)
    if (metrics.responseTime > 5000) {
      score *= 0.7;
    } else if (metrics.responseTime > 2000) {
      score *= 0.9;
    }
    
    // Adjust for error rate
    score *= (1 - metrics.errorRate / 100);
    
    // Adjust for integration status
    switch (status) {
      case 'healthy':
        score *= 1.0;
        break;
      case 'warning':
        score *= 0.8;
        break;
      case 'error':
        score *= 0.3;
        break;
      case 'critical':
        score *= 0.1;
        break;
      default:
        score *= 0.5;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [health]);

  // Get health trend
  const getHealthTrend = useCallback((): 'improving' | 'stable' | 'declining' => {
    if (!health || !previousHealthRef.current) return 'stable';

    const currentScore = getHealthScore();
    const previousScore = calculateHealthScore(previousHealthRef.current);
    
    const difference = currentScore - previousScore;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }, [health, getHealthScore]);

  // Get recommendations based on health data
  const getRecommendations = useCallback((): string[] => {
    if (!health) return [];

    const recommendations: string[] = [];
    const { tokenHealth, metrics, issues } = health;

    // Token-related recommendations
    if (tokenHealth.isExpired) {
      recommendations.push('Refresh the access token immediately to restore connectivity');
    } else if (tokenHealth.isExpiringSoon) {
      recommendations.push('Consider refreshing the access token to prevent service interruption');
    }

    // Performance recommendations
    if (metrics.responseTime > 5000) {
      recommendations.push('Response times are slow - check network connectivity and provider status');
    }

    if (metrics.errorRate > 10) {
      recommendations.push('High error rate detected - review integration configuration and permissions');
    }

    if (metrics.uptime < 95) {
      recommendations.push('Low uptime detected - consider enabling auto-refresh and monitoring alerts');
    }

    // Issue-based recommendations
    issues.forEach(issue => {
      if (issue.action) {
        recommendations.push(issue.action);
      }
    });

    // General recommendations
    if (recommendations.length === 0 && getHealthScore() < 80) {
      recommendations.push('Monitor integration closely and consider testing connection manually');
    }

    return recommendations;
  }, [health, getHealthScore]);

  // Helper function to calculate health score for any health data
  const calculateHealthScore = (healthData: IntegrationHealthData): number => {
    const { metrics, tokenHealth, status } = healthData;
    
    let score = metrics.uptime;
    
    switch (tokenHealth.status) {
      case 'active': score *= 1.0; break;
      case 'expiring_soon': score *= 0.8; break;
      case 'expired': score *= 0.3; break;
      case 'error': score *= 0.1; break;
      default: score *= 0.5;
    }
    
    if (metrics.responseTime > 5000) score *= 0.7;
    else if (metrics.responseTime > 2000) score *= 0.9;
    
    score *= (1 - metrics.errorRate / 100);
    
    switch (status) {
      case 'healthy': score *= 1.0; break;
      case 'warning': score *= 0.8; break;
      case 'error': score *= 0.3; break;
      case 'critical': score *= 0.1; break;
      default: score *= 0.5;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Handle health changes
  useEffect(() => {
    if (health && onHealthChange) {
      onHealthChange(health);
    }

    // Check for new issues
    if (health && previousHealthRef.current && onIssueDetected) {
      const previousIssueIds = new Set(previousHealthRef.current.issues.map(i => i.id));
      const newIssues = health.issues.filter(issue => !previousIssueIds.has(issue.id));
      
      newIssues.forEach(issue => {
        onIssueDetected(issue);
      });
    }

    // Update previous health reference
    if (health) {
      previousHealthRef.current = health;
    }
  }, [health, onHealthChange, onIssueDetected]);

  // Auto-start monitoring when enabled
  useEffect(() => {
    if (enabled && integrationId) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enabled, integrationId, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    health,
    isLoading,
    error,
    lastChecked: health ? new Date(health.lastChecked) : null,
    nextCheck: health ? new Date(health.nextCheck) : null,
    isMonitoring: intervalRef.current !== null,
    startMonitoring,
    stopMonitoring,
    checkNow,
    getHealthScore,
    getHealthTrend,
    getRecommendations,
  };
};

// Hook for monitoring multiple integrations
export const useMultipleIntegrationHealth = (
  integrationIds: string[],
  options?: Omit<UseIntegrationHealthOptions, 'integrationId'>
) => {
  const healthHooks = integrationIds.map(id => 
    useIntegrationHealth({ ...options, integrationId: id })
  );

  return {
    healthData: healthHooks.map(hook => hook.health).filter(Boolean),
    isLoading: healthHooks.some(hook => hook.isLoading),
    errors: healthHooks.map(hook => hook.error).filter(Boolean),
    overallHealthScore: () => {
      const scores = healthHooks.map(hook => hook.getHealthScore());
      return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    },
    criticalIssues: () => {
      return healthHooks
        .flatMap(hook => hook.health?.issues || [])
        .filter(issue => issue.type === 'error');
    },
    startAllMonitoring: () => {
      healthHooks.forEach(hook => hook.startMonitoring());
    },
    stopAllMonitoring: () => {
      healthHooks.forEach(hook => hook.stopMonitoring());
    },
  };
};