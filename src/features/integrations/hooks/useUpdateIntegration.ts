import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { handleApiResponse } from '../../../shared/utils/dataTransform';
import { useAuth } from '../../../core/context/AuthContext';
import { Integration, IntegrationUpdateRequest } from '../types';
import { notifications } from '@mantine/notifications';

/**
 * Hook to update an existing integration
 * @returns React Query mutation for updating integrations
 */
export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      integrationId, 
      data 
    }: { 
      integrationId: string; 
      data: IntegrationUpdateRequest; 
    }): Promise<Integration> => {
      if (!currentTenant) {
        throw new Error('No current tenant available');
      }

      if (import.meta.env.DEV) {
        console.group('🔗 UPDATE INTEGRATION: Updating integration');
        console.log('📊 Mutation Data:', {
          tenantId: currentTenant,
          integrationId,
          data,
          timestamp: new Date().toISOString()
        });
      }

      try {
        const response = await api.patch(
          `/tenants/${currentTenant}/integrations/${integrationId}`, 
          data
        );
        
        if (import.meta.env.DEV) {
          console.log('✅ Integration updated successfully:', response.data);
        }
        
        const transformedData = handleApiResponse(response, false);
        
        if (import.meta.env.DEV) {
          console.log('✅ Transformed integration data:', transformedData);
          console.groupEnd();
        }
        
        return transformedData;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to update integration:', error);
          console.groupEnd();
        }
        throw error;
      }
    },
    onSuccess: (updatedIntegration, { integrationId }) => {
      // Update the specific integration in the cache
      queryClient.setQueryData(
        ['integration', integrationId],
        updatedIntegration
      );
      
      // Update the integration in the list cache
      queryClient.setQueryData(
        ['integrations', currentTenant],
        (oldData: Integration[] | undefined) => {
          if (!oldData) return [updatedIntegration];
          return oldData.map(integration => 
            integration.id === integrationId ? updatedIntegration : integration
          );
        }
      );

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['integrations', currentTenant] 
      });

      // Show success notification
      notifications.show({
        title: 'Integration Updated',
        message: `Successfully updated integration for ${updatedIntegration.provider?.name || 'cloud provider'}`,
        color: 'green',
      });

      if (import.meta.env.DEV) {
        console.log('✅ Integration update success callback executed');
      }
    },
    onError: (error: any) => {
      // Show error notification
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'Failed to update integration';
      
      notifications.show({
        title: 'Integration Update Failed',
        message: errorMessage,
        color: 'red',
      });

      if (import.meta.env.DEV) {
        console.error('❌ Integration update error callback executed:', error);
      }
    },
  });
};

/**
 * Hook to refresh an integration's token
 * @returns React Query mutation for refreshing integration tokens
 */
export const useRefreshIntegrationToken = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAuth();

  return useMutation({
    mutationFn: async (integrationId: string): Promise<Integration> => {
      if (!currentTenant) {
        throw new Error('No current tenant available');
      }

      if (import.meta.env.DEV) {
        console.group('🔗 REFRESH TOKEN: Refreshing integration token');
        console.log('📊 Mutation Data:', {
          tenantId: currentTenant,
          integrationId,
          timestamp: new Date().toISOString()
        });
      }

      try {
        const response = await api.post(
          `/tenants/${currentTenant}/integrations/${integrationId}/refresh-token`
        );
        
        if (import.meta.env.DEV) {
          console.log('✅ Token refreshed successfully:', response.data);
        }
        
        const transformedData = handleApiResponse(response, false);
        
        if (import.meta.env.DEV) {
          console.log('✅ Transformed integration data:', transformedData);
          console.groupEnd();
        }
        
        return transformedData;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to refresh token:', error);
          console.groupEnd();
        }
        throw error;
      }
    },
    onSuccess: (updatedIntegration, integrationId) => {
      // Update the specific integration in the cache
      queryClient.setQueryData(
        ['integration', integrationId],
        updatedIntegration
      );
      
      // Update the integration in the list cache
      queryClient.setQueryData(
        ['integrations', currentTenant],
        (oldData: Integration[] | undefined) => {
          if (!oldData) return [updatedIntegration];
          return oldData.map(integration => 
            integration.id === integrationId ? updatedIntegration : integration
          );
        }
      );

      // Show success notification
      notifications.show({
        title: 'Token Refreshed',
        message: `Successfully refreshed token for ${updatedIntegration.provider?.name || 'cloud provider'}`,
        color: 'green',
      });

      if (import.meta.env.DEV) {
        console.log('✅ Token refresh success callback executed');
      }
    },
    onError: (error: any) => {
      // Show error notification
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'Failed to refresh token';
      
      notifications.show({
        title: 'Token Refresh Failed',
        message: errorMessage,
        color: 'red',
      });

      if (import.meta.env.DEV) {
        console.error('❌ Token refresh error callback executed:', error);
      }
    },
  });
};