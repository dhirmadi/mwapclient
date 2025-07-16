import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { handleApiResponse } from '../../../shared/utils/dataTransform';
import { useAuth } from '../../../core/context/AuthContext';
import { Integration, IntegrationCreateRequest } from '../types';
import { notifications } from '@mantine/notifications';

/**
 * Hook to create a new integration
 * @returns React Query mutation for creating integrations
 */
export const useCreateIntegration = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAuth();

  return useMutation({
    mutationFn: async (data: IntegrationCreateRequest): Promise<Integration> => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      if (import.meta.env.DEV) {
        console.group('🔗 CREATE INTEGRATION: Creating new integration');
        console.log('📊 Mutation Data:', {
          tenantId: currentTenant.id,
          data,
          timestamp: new Date().toISOString()
        });
      }

      try {
        const response = await api.post(`/tenants/${currentTenant.id}/integrations`, data);
        
        if (import.meta.env.DEV) {
          console.log('✅ Integration created successfully:', response.data);
        }
        
        const transformedData = handleApiResponse(response, false);
        
        if (import.meta.env.DEV) {
          console.log('✅ Transformed integration data:', transformedData);
          console.groupEnd();
        }
        
        return transformedData;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to create integration:', error);
          console.groupEnd();
        }
        throw error;
      }
    },
    onSuccess: (newIntegration) => {
      // Invalidate and refetch integrations list
      queryClient.invalidateQueries({ 
        queryKey: ['integrations', currentTenant?.id] 
      });
      
      // Optimistically add the new integration to the cache
      queryClient.setQueryData(
        ['integrations', currentTenant?.id],
        (oldData: Integration[] | undefined) => {
          if (!oldData) return [newIntegration];
          return [...oldData, newIntegration];
        }
      );

      // Show success notification
      notifications.show({
        title: 'Integration Created',
        message: `Successfully created integration for ${newIntegration.provider?.name || 'cloud provider'}`,
        color: 'green',
      });

      if (import.meta.env.DEV) {
        console.log('✅ Integration creation success callback executed');
      }
    },
    onError: (error: any) => {
      // Show error notification
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'Failed to create integration';
      
      notifications.show({
        title: 'Integration Creation Failed',
        message: errorMessage,
        color: 'red',
      });

      if (import.meta.env.DEV) {
        console.error('❌ Integration creation error callback executed:', error);
      }
    },
  });
};