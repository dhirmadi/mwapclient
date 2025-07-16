import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../core/context/AuthContext';
import { useUpdateIntegration } from './useUpdateIntegration';
import { 
  Integration, 
  TokenHealth, 
  IntegrationHealth,
  TokenStatus 
} from '../types';
import { 
  isTokenExpired, 
  isTokenExpiringSoon, 
  getTimeUntilExpiration,
  getTokenHealth,
  getIntegrationHealthStatus 
} from '../utils/integrationUtils';
import { HEALTH_CHECK_CONFIG } from '../utils/constants';
import { notifications } from '@mantine/notifications';
import api from '../../../shared/utils/api';
import { handleApiResponse } from '../../../shared/utils/dataTransform';

/**
 * Hook for comprehensive token management and health monitoring
 */
export const useTokenManagement = (integrationId?: string) => {
  const { currentTenant } = useAuth();
  const queryClient = useQueryClient();
  const updateIntegration = useUpdateIntegration();

  /**
   * Get current integration data
   */
  const integration = queryClient.getQueryData<Integration>([
    'integration', 
    integrationId
  ]);

  /**
   * Check token health for a specific integration
   */
  const checkTokenHealth = useQuery({
    queryKey: ['integration-health', integrationId],
    queryFn: async (): Promise<IntegrationHealth> => {
      if (!currentTenant?.id || !integrationId) {
        throw new Error('Missing tenant or integration ID');
      }

      if (import.meta.env.DEV) {
        console.group('🔍 TOKEN HEALTH: Checking integration health');
        console.log('📊 Health Check Data:', {
          tenantId: currentTenant.id,
          integrationId,
          timestamp: new Date().toISOString()
        });
      }

      try {
        const response = await api.get(
          `/tenants/${currentTenant.id}/integrations/${integrationId}/health`
        );
        
        const healthData = handleApiResponse(response, false);
        
        if (import.meta.env.DEV) {
          console.log('✅ Health check completed:', healthData);
          console.groupEnd();
        }
        
        return healthData;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Health check failed:', error);
          console.groupEnd();
        }
        
        // Fallback to client-side health calculation if API fails
        if (integration) {
          return getIntegrationHealthStatus(integration);
        }
        
        throw error;
      }
    },
    enabled: !!currentTenant?.id && !!integrationId,
    staleTime: HEALTH_CHECK_CONFIG.CHECK_INTERVAL_MS,
    gcTime: HEALTH_CHECK_CONFIG.CHECK_INTERVAL_MS * 2,
    refetchInterval: HEALTH_CHECK_CONFIG.CHECK_INTERVAL_MS,
    retry: HEALTH_CHECK_CONFIG.MAX_RETRIES,
    retryDelay: (attemptIndex) => 
      Math.min(1000 * 2 ** attemptIndex, HEALTH_CHECK_CONFIG.RETRY_DELAY_BASE_MS * 10),
  });

  /**
   * Refresh integration token
   */
  const refreshToken = useMutation({
    mutationFn: async (integrationId: string): Promise<Integration> => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      if (import.meta.env.DEV) {
        console.group('🔄 TOKEN REFRESH: Refreshing integration token');
        console.log('📊 Refresh Data:', {
          tenantId: currentTenant.id,
          integrationId,
          timestamp: new Date().toISOString()
        });
      }

      try {
        const response = await api.post(
          `/tenants/${currentTenant.id}/integrations/${integrationId}/refresh-token`
        );
        
        const updatedIntegration = handleApiResponse(response, false);
        
        if (import.meta.env.DEV) {
          console.log('✅ Token refreshed successfully:', updatedIntegration);
          console.groupEnd();
        }
        
        return updatedIntegration;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Token refresh failed:', error);
          console.groupEnd();
        }
        throw error;
      }
    },
    onSuccess: (updatedIntegration, integrationId) => {
      // Update integration in cache
      queryClient.setQueryData(
        ['integration', integrationId],
        updatedIntegration
      );
      
      // Update integrations list
      queryClient.setQueryData(
        ['integrations', currentTenant?.id],
        (oldData: Integration[] | undefined) => {
          if (!oldData) return [updatedIntegration];
          return oldData.map(item => 
            item.id === integrationId ? updatedIntegration : item
          );
        }
      );

      // Invalidate health check to get fresh status
      queryClient.invalidateQueries({ 
        queryKey: ['integration-health', integrationId] 
      });

      // Show success notification
      notifications.show({
        title: 'Token Refreshed',
        message: `Successfully refreshed token for ${updatedIntegration.provider?.name || 'integration'}`,
        color: 'green',
      });

      if (import.meta.env.DEV) {
        console.log('✅ Token refresh success callback executed');
      }
    },
    onError: (error: any, integrationId) => {
      // Show error notification
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'Failed to refresh token';
      
      notifications.show({
        title: 'Token Refresh Failed',
        message: errorMessage,
        color: 'red',
      });

      // Invalidate health check to reflect error state
      queryClient.invalidateQueries({ 
        queryKey: ['integration-health', integrationId] 
      });

      if (import.meta.env.DEV) {
        console.error('❌ Token refresh error callback executed:', error);
      }
    },
  });

  /**
   * Test integration connection
   */
  const testConnection = useMutation({
    mutationFn: async (integrationId: string): Promise<{
      success: boolean;
      details: {
        tokenValid: boolean;
        apiReachable: boolean;
        scopesValid: boolean;
        responseTime?: number;
      };
      error?: string;
    }> => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      if (import.meta.env.DEV) {
        console.group('🧪 CONNECTION TEST: Testing integration connection');
        console.log('📊 Test Data:', {
          tenantId: currentTenant.id,
          integrationId,
          timestamp: new Date().toISOString()
        });
      }

      try {
        const response = await api.post(
          `/tenants/${currentTenant.id}/integrations/${integrationId}/test`
        );
        
        const testResult = handleApiResponse(response, false);
        
        if (import.meta.env.DEV) {
          console.log('✅ Connection test completed:', testResult);
          console.groupEnd();
        }
        
        return testResult;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Connection test failed:', error);
          console.groupEnd();
        }
        throw error;
      }
    },
    onSuccess: (result, integrationId) => {
      // Invalidate health check to reflect test results
      queryClient.invalidateQueries({ 
        queryKey: ['integration-health', integrationId] 
      });

      // Show result notification
      if (result.success) {
        notifications.show({
          title: 'Connection Test Passed',
          message: 'Integration is working correctly',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Connection Test Failed',
          message: result.error || 'Integration has connectivity issues',
          color: 'orange',
        });
      }

      if (import.meta.env.DEV) {
        console.log('✅ Connection test success callback executed');
      }
    },
    onError: (error: any) => {
      // Show error notification
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'Failed to test connection';
      
      notifications.show({
        title: 'Connection Test Error',
        message: errorMessage,
        color: 'red',
      });

      if (import.meta.env.DEV) {
        console.error('❌ Connection test error callback executed:', error);
      }
    },
  });

  /**
   * Get client-side token health information
   */
  const getClientTokenHealth = (): TokenHealth | null => {
    if (!integration) return null;
    return getTokenHealth(integration);
  };

  /**
   * Check if token needs refresh
   */
  const needsRefresh = (): boolean => {
    if (!integration) return false;
    return isTokenExpired(integration) || isTokenExpiringSoon(integration);
  };

  /**
   * Get time until token expiration
   */
  const getExpirationTime = (): number | null => {
    if (!integration) return null;
    return getTimeUntilExpiration(integration);
  };

  /**
   * Auto-refresh token if expiring soon
   */
  const autoRefreshToken = useMutation({
    mutationFn: async (integrationId: string): Promise<Integration | null> => {
      if (!integration || !needsRefresh()) {
        return null;
      }

      if (import.meta.env.DEV) {
        console.log('🔄 AUTO REFRESH: Token expiring soon, auto-refreshing...');
      }

      return refreshToken.mutateAsync(integrationId);
    },
    onSuccess: (result) => {
      if (result && import.meta.env.DEV) {
        console.log('✅ Auto-refresh completed successfully');
      }
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error('❌ Auto-refresh failed:', error);
      }
    },
  });

  /**
   * Monitor token health and auto-refresh if needed
   */
  const monitorTokenHealth = useQuery({
    queryKey: ['token-monitor', integrationId],
    queryFn: async () => {
      if (!integration || !integrationId) return null;
      
      const tokenHealth = getClientTokenHealth();
      if (!tokenHealth) return null;
      
      // Auto-refresh if token is expiring soon
      if (tokenHealth.isExpiringSoon && tokenHealth.status === 'active') {
        try {
          await autoRefreshToken.mutateAsync(integrationId);
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      }
      
      return tokenHealth;
    },
    enabled: !!integration && !!integrationId,
    refetchInterval: 60000, // Check every minute
    staleTime: 30000, // 30 seconds
  });

  return {
    // Health data
    healthCheck: checkTokenHealth,
    tokenHealth: getClientTokenHealth(),
    isHealthy: checkTokenHealth.data?.status === 'healthy',
    
    // Token status
    needsRefresh: needsRefresh(),
    expirationTime: getExpirationTime(),
    isExpired: integration ? isTokenExpired(integration) : false,
    isExpiringSoon: integration ? isTokenExpiringSoon(integration) : false,
    
    // Actions
    refreshToken: refreshToken.mutateAsync,
    testConnection: testConnection.mutateAsync,
    autoRefresh: autoRefreshToken.mutateAsync,
    
    // Loading states
    isRefreshing: refreshToken.isPending,
    isTesting: testConnection.isPending,
    isCheckingHealth: checkTokenHealth.isLoading,
    isMonitoring: monitorTokenHealth.isLoading,
    
    // Utilities
    getTokenStatus: (): TokenStatus => {
      if (!integration) return 'unknown';
      const health = getClientTokenHealth();
      return health?.status || 'unknown';
    },
    
    getHealthSummary: () => ({
      integration: integration || null,
      health: checkTokenHealth.data || null,
      tokenHealth: getClientTokenHealth(),
      needsRefresh: needsRefresh(),
      isMonitoring: !!monitorTokenHealth.data,
    }),
  };
};