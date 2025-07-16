import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../../../shared/utils/api';

interface UsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  dataTransferred: number; // bytes
  filesAccessed: number;
  lastActivity: string;
}

interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

interface IntegrationAnalytics {
  integrationId: string;
  period: {
    start: string;
    end: string;
  };
  usage: UsageMetrics;
  trends: {
    requests: TimeSeriesData[];
    responseTime: TimeSeriesData[];
    errorRate: TimeSeriesData[];
    dataTransfer: TimeSeriesData[];
  };
  topFiles: {
    path: string;
    accessCount: number;
    lastAccessed: string;
    size: number;
  }[];
  errorBreakdown: {
    type: string;
    count: number;
    percentage: number;
    lastOccurrence: string;
  }[];
  performanceMetrics: {
    uptime: number; // percentage
    availability: number; // percentage
    reliability: number; // percentage
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
}

interface TenantAnalytics {
  tenantId: string;
  period: {
    start: string;
    end: string;
  };
  overview: {
    totalIntegrations: number;
    activeIntegrations: number;
    totalRequests: number;
    totalDataTransferred: number;
    averageUptime: number;
  };
  integrationBreakdown: {
    integrationId: string;
    providerName: string;
    displayName: string;
    usage: UsageMetrics;
    healthScore: number;
  }[];
  trends: {
    requests: TimeSeriesData[];
    integrations: TimeSeriesData[];
    errors: TimeSeriesData[];
  };
  topPerformers: {
    integrationId: string;
    displayName: string;
    score: number;
    metric: 'uptime' | 'requests' | 'reliability';
  }[];
}

interface UseIntegrationAnalyticsOptions {
  integrationId: string;
  period?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
  refreshInterval?: number;
}

interface UseIntegrationAnalyticsReturn {
  analytics: IntegrationAnalytics | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  
  // Computed metrics
  getUsageScore: () => number;
  getPerformanceScore: () => number;
  getReliabilityScore: () => number;
  getUsageTrend: () => 'increasing' | 'stable' | 'decreasing';
  getHealthInsights: () => string[];
  getOptimizationSuggestions: () => string[];
}

export const useIntegrationAnalytics = ({
  integrationId,
  period = 'week',
  startDate,
  endDate,
  enabled = true,
  refreshInterval,
}: UseIntegrationAnalyticsOptions): UseIntegrationAnalyticsReturn => {
  
  // Build query parameters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append('period', period);
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    return params.toString();
  }, [period, startDate, endDate]);

  // Fetch analytics data
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['integration-analytics', integrationId, queryParams],
    queryFn: async (): Promise<IntegrationAnalytics> => {
      const response = await apiClient.get(
        `/integrations/${integrationId}/analytics?${queryParams}`
      );
      return response.data.data;
    },
    enabled: enabled && !!integrationId,
    refetchInterval,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  // Calculate usage score (0-100)
  const getUsageScore = (): number => {
    if (!analytics) return 0;

    const { usage } = analytics;
    const successRate = usage.totalRequests > 0 
      ? (usage.successfulRequests / usage.totalRequests) * 100 
      : 0;
    
    // Base score from success rate
    let score = successRate;
    
    // Adjust for activity level (more requests = higher score, up to a point)
    const activityMultiplier = Math.min(1.2, 1 + (usage.totalRequests / 10000));
    score *= activityMultiplier;
    
    // Penalize for high response times
    if (usage.averageResponseTime > 5000) {
      score *= 0.7;
    } else if (usage.averageResponseTime > 2000) {
      score *= 0.9;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Calculate performance score (0-100)
  const getPerformanceScore = (): number => {
    if (!analytics) return 0;

    const { performanceMetrics } = analytics;
    
    // Weighted average of performance metrics
    const uptimeWeight = 0.4;
    const availabilityWeight = 0.3;
    const reliabilityWeight = 0.3;
    
    const score = (
      performanceMetrics.uptime * uptimeWeight +
      performanceMetrics.availability * availabilityWeight +
      performanceMetrics.reliability * reliabilityWeight
    );
    
    return Math.round(score);
  };

  // Calculate reliability score (0-100)
  const getReliabilityScore = (): number => {
    if (!analytics) return 0;

    const { usage, performanceMetrics } = analytics;
    
    // Base score from reliability metric
    let score = performanceMetrics.reliability;
    
    // Adjust for error rate
    const errorRate = usage.totalRequests > 0 
      ? (usage.failedRequests / usage.totalRequests) * 100 
      : 0;
    
    score *= (1 - errorRate / 100);
    
    // Adjust for response time consistency
    const responseTimeRatio = performanceMetrics.p99ResponseTime / performanceMetrics.p95ResponseTime;
    if (responseTimeRatio > 3) {
      score *= 0.8; // Penalize inconsistent response times
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Get usage trend
  const getUsageTrend = (): 'increasing' | 'stable' | 'decreasing' => {
    if (!analytics || analytics.trends.requests.length < 2) return 'stable';

    const requests = analytics.trends.requests;
    const recent = requests.slice(-7); // Last 7 data points
    const older = requests.slice(-14, -7); // Previous 7 data points
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;
    
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (changePercent > 10) return 'increasing';
    if (changePercent < -10) return 'decreasing';
    return 'stable';
  };

  // Get health insights
  const getHealthInsights = (): string[] => {
    if (!analytics) return [];

    const insights: string[] = [];
    const { usage, performanceMetrics, errorBreakdown } = analytics;

    // Usage insights
    if (usage.totalRequests === 0) {
      insights.push('No API requests recorded - integration may not be actively used');
    } else if (usage.totalRequests > 10000) {
      insights.push('High API usage detected - monitor for rate limiting');
    }

    // Performance insights
    if (performanceMetrics.uptime < 95) {
      insights.push(`Low uptime (${performanceMetrics.uptime.toFixed(1)}%) - investigate connectivity issues`);
    }

    if (performanceMetrics.p95ResponseTime > 5000) {
      insights.push('Slow response times detected - may impact user experience');
    }

    // Error insights
    const errorRate = usage.totalRequests > 0 
      ? (usage.failedRequests / usage.totalRequests) * 100 
      : 0;
    
    if (errorRate > 5) {
      insights.push(`High error rate (${errorRate.toFixed(1)}%) - review error breakdown`);
    }

    // Top error types
    const topError = errorBreakdown[0];
    if (topError && topError.percentage > 50) {
      insights.push(`Most common error: ${topError.type} (${topError.percentage.toFixed(1)}% of failures)`);
    }

    // Data transfer insights
    if (usage.dataTransferred > 1000000000) { // 1GB
      insights.push('High data transfer volume - monitor bandwidth usage');
    }

    return insights;
  };

  // Get optimization suggestions
  const getOptimizationSuggestions = (): string[] => {
    if (!analytics) return [];

    const suggestions: string[] = [];
    const { usage, performanceMetrics, trends } = analytics;

    // Performance optimizations
    if (performanceMetrics.p95ResponseTime > 2000) {
      suggestions.push('Consider implementing request caching to improve response times');
    }

    // Usage optimizations
    const errorRate = usage.totalRequests > 0 
      ? (usage.failedRequests / usage.totalRequests) * 100 
      : 0;
    
    if (errorRate > 2) {
      suggestions.push('Implement retry logic with exponential backoff for failed requests');
    }

    // Trend-based suggestions
    const usageTrend = getUsageTrend();
    if (usageTrend === 'increasing') {
      suggestions.push('Usage is growing - consider upgrading to a higher tier plan if available');
    } else if (usageTrend === 'decreasing') {
      suggestions.push('Usage is declining - review integration value and user adoption');
    }

    // File access patterns
    if (analytics.topFiles.length > 0) {
      const topFile = analytics.topFiles[0];
      if (topFile.accessCount > usage.totalRequests * 0.5) {
        suggestions.push('Consider caching frequently accessed files locally');
      }
    }

    // Reliability improvements
    if (performanceMetrics.reliability < 95) {
      suggestions.push('Enable automatic token refresh to improve reliability');
      suggestions.push('Set up monitoring alerts for proactive issue detection');
    }

    return suggestions;
  };

  return {
    analytics,
    isLoading,
    error,
    refetch,
    getUsageScore,
    getPerformanceScore,
    getReliabilityScore,
    getUsageTrend,
    getHealthInsights,
    getOptimizationSuggestions,
  };
};

// Hook for tenant-wide analytics
interface UseTenantAnalyticsOptions {
  tenantId: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  enabled?: boolean;
}

export const useTenantAnalytics = ({
  tenantId,
  period = 'month',
  enabled = true,
}: UseTenantAnalyticsOptions) => {
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tenant-analytics', tenantId, period],
    queryFn: async (): Promise<TenantAnalytics> => {
      const response = await apiClient.get(
        `/tenants/${tenantId}/analytics?period=${period}`
      );
      return response.data.data;
    },
    enabled: enabled && !!tenantId,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  // Calculate overall tenant health score
  const getOverallHealthScore = (): number => {
    if (!analytics) return 0;

    const scores = analytics.integrationBreakdown.map(integration => integration.healthScore);
    return scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;
  };

  // Get tenant insights
  const getTenantInsights = (): string[] => {
    if (!analytics) return [];

    const insights: string[] = [];
    const { overview, integrationBreakdown } = analytics;

    // Integration insights
    const activePercentage = (overview.activeIntegrations / overview.totalIntegrations) * 100;
    if (activePercentage < 80) {
      insights.push(`${(100 - activePercentage).toFixed(0)}% of integrations are inactive`);
    }

    // Usage insights
    if (overview.totalRequests > 100000) {
      insights.push('High API usage across integrations - monitor for rate limits');
    }

    // Performance insights
    if (overview.averageUptime < 95) {
      insights.push(`Average uptime is ${overview.averageUptime.toFixed(1)}% - review integration health`);
    }

    // Top performers
    const topPerformer = analytics.topPerformers[0];
    if (topPerformer) {
      insights.push(`Best performing integration: ${topPerformer.displayName} (${topPerformer.metric})`);
    }

    return insights;
  };

  return {
    analytics,
    isLoading,
    error,
    refetch,
    getOverallHealthScore,
    getTenantInsights,
  };
};