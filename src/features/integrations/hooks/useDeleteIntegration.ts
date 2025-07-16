import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { handleDeleteResponse, handleApiResponse } from '../../../shared/utils/dataTransform';
import { useAuth } from '../../../core/context/AuthContext';
import { Integration } from '../types';
import { notifications } from '@mantine/notifications';

/**
 * Hook to delete an integration
 * @returns React Query mutation for deleting integrations
 */
export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAuth();

  return useMutation({
    mutationFn: async (integrationId: string): Promise<void> => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      if (import.meta.env.DEV) {
        console.group('🔗 DELETE INTEGRATION: Deleting integration');
        console.log('📊 Mutation Data:', {
          tenantId: currentTenant.id,
          integrationId,
          timestamp: new Date().toISOString()
        });
      }

      try {
        const response = await api.delete(
          `/tenants/${currentTenant.id}/integrations/${integrationId}`
        );
        
        if (import.meta.env.DEV) {
          console.log('✅ Integration deleted successfully:', response.data);
        }
        
        handleDeleteResponse(response);
        
        if (import.meta.env.DEV) {
          console.log('✅ Integration deletion completed');
          console.groupEnd();
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to delete integration:', error);
          console.groupEnd();
        }
        throw error;
      }
    },
    onMutate: async (integrationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['integrations', currentTenant?.id] 
      });
      await queryClient.cancelQueries({ 
        queryKey: ['integration', integrationId] 
      });

      // Snapshot the previous value for rollback
      const previousIntegrations = queryClient.getQueryData<Integration[]>([
        'integrations', 
        currentTenant?.id
      ]);
      const previousIntegration = queryClient.getQueryData<Integration>([
        'integration', 
        integrationId
      ]);

      // Optimistically remove the integration from the list
      queryClient.setQueryData(
        ['integrations', currentTenant?.id],
        (oldData: Integration[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter(integration => integration.id !== integrationId);
        }
      );

      // Remove the specific integration from cache
      queryClient.removeQueries({ 
        queryKey: ['integration', integrationId] 
      });

      // Return context for rollback
      return { previousIntegrations, previousIntegration };
    },
    onSuccess: (_, integrationId, context) => {
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['integrations', currentTenant?.id] 
      });

      // Show success notification
      const integrationName = context?.previousIntegration?.provider?.name || 'cloud provider';
      notifications.show({
        title: 'Integration Deleted',
        message: `Successfully deleted integration for ${integrationName}`,
        color: 'green',
      });

      if (import.meta.env.DEV) {
        console.log('✅ Integration deletion success callback executed');
      }
    },
    onError: (error: any, integrationId, context) => {
      // Rollback optimistic updates
      if (context?.previousIntegrations) {
        queryClient.setQueryData(
          ['integrations', currentTenant?.id],
          context.previousIntegrations
        );
      }
      
      if (context?.previousIntegration) {
        queryClient.setQueryData(
          ['integration', integrationId],
          context.previousIntegration
        );
      }

      // Show error notification
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'Failed to delete integration';
      
      notifications.show({
        title: 'Integration Deletion Failed',
        message: errorMessage,
        color: 'red',
      });

      if (import.meta.env.DEV) {
        console.error('❌ Integration deletion error callback executed:', error);
      }
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['integrations', currentTenant?.id] 
      });
    },
  });
};

/**
 * Hook to revoke an integration (soft delete - changes status to 'revoked')
 * @returns React Query mutation for revoking integrations
 */
export const useRevokeIntegration = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAuth();

  return useMutation({
    mutationFn: async (integrationId: string): Promise<Integration> => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      if (import.meta.env.DEV) {
        console.group('🔗 REVOKE INTEGRATION: Revoking integration');
        console.log('📊 Mutation Data:', {
          tenantId: currentTenant.id,
          integrationId,
          timestamp: new Date().toISOString()
        });
      }

      try {
        const response = await api.patch(
          `/tenants/${currentTenant.id}/integrations/${integrationId}`,
          { status: 'revoked' }
        );
        
        if (import.meta.env.DEV) {
          console.log('✅ Integration revoked successfully:', response.data);
        }
        
        const transformedData = handleApiResponse(response, false);
        
        if (import.meta.env.DEV) {
          console.log('✅ Transformed integration data:', transformedData);
          console.groupEnd();
        }
        
        return transformedData;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to revoke integration:', error);
          console.groupEnd();
        }
        throw error;
      }
    },
    onSuccess: (revokedIntegration, integrationId) => {
      // Update the specific integration in the cache
      queryClient.setQueryData(
        ['integration', integrationId],
        revokedIntegration
      );
      
      // Update the integration in the list cache
      queryClient.setQueryData(
        ['integrations', currentTenant?.id],
        (oldData: Integration[] | undefined) => {
          if (!oldData) return [revokedIntegration];
          return oldData.map(integration => 
            integration.id === integrationId ? revokedIntegration : integration
          );
        }
      );

      // Show success notification
      notifications.show({
        title: 'Integration Revoked',
        message: `Successfully revoked integration for ${revokedIntegration.provider?.name || 'cloud provider'}`,
        color: 'orange',
      });

      if (import.meta.env.DEV) {
        console.log('✅ Integration revocation success callback executed');
      }
    },
    onError: (error: any) => {
      // Show error notification
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'Failed to revoke integration';
      
      notifications.show({
        title: 'Integration Revocation Failed',
        message: errorMessage,
        color: 'red',
      });

      if (import.meta.env.DEV) {
        console.error('❌ Integration revocation error callback executed:', error);
      }
    },
  });
};