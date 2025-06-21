import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { 
  CloudProvider, 
  CloudProviderCreate, 
  CloudProviderUpdate,
  CloudProviderIntegrationCreate
} from '../types/cloud-provider';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for managing cloud providers
 */
export const useCloudProviders = () => {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();

  // Fetch all cloud providers - available to both superadmins and tenant managers
  const { 
    data: cloudProviders = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['cloud-providers'],
    queryFn: () => api.fetchCloudProviders(),
    // Enable for all users, not just superadmins
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Create a new cloud provider
  const createCloudProviderMutation = useMutation({
    mutationFn: (data: CloudProviderCreate) => api.createCloudProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
    },
  });

  // Update a cloud provider
  const updateCloudProviderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CloudProviderUpdate }) => 
      api.updateCloudProvider(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
      queryClient.invalidateQueries({ queryKey: ['cloud-provider', variables.id] });
    },
  });

  // Delete a cloud provider
  const deleteCloudProviderMutation = useMutation({
    mutationFn: (id: string) => api.deleteCloudProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
    },
  });

  // Check if an integration already exists for a tenant and provider
  const checkIntegrationExistsMutation = useMutation({
    mutationFn: ({ tenantId, providerId }: { tenantId: string; providerId: string }) => 
      api.checkIntegrationExists(tenantId, providerId)
  });

  // Create a tenant integration
  const createIntegrationMutation = useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string; data: CloudProviderIntegrationCreate }) => {
      // First check if an integration already exists for this provider
      const exists = await api.checkIntegrationExists(tenantId, data.providerId);
      if (exists) {
        throw new Error('Integration already exists for this provider');
      }
      return api.createTenantIntegration(tenantId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-integrations', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
    },
  });

  // Update integration tokens using authorization code
  const updateIntegrationTokensMutation = useMutation({
    mutationFn: ({ 
      tenantId, 
      integrationId, 
      authorizationCode, 
      redirectUri 
    }: { 
      tenantId: string; 
      integrationId: string; 
      authorizationCode: string; 
      redirectUri: string;
    }) => {
      console.log('updateIntegrationTokensMutation called with:', {
        tenantId, integrationId, authorizationCode, redirectUri
      });
      return api.updateIntegrationTokens(tenantId, integrationId, { authorizationCode, redirectUri });
    },
    onSuccess: (_, variables) => {
      console.log('updateIntegrationTokensMutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['tenant-integrations', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
    },
    onError: (error) => {
      console.error('updateIntegrationTokensMutation error:', error);
    }
  });

  // Refresh integration token
  const refreshIntegrationTokenMutation = useMutation({
    mutationFn: ({ tenantId, integrationId }: { tenantId: string; integrationId: string }) => 
      api.refreshIntegrationToken(tenantId, integrationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-integrations', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
    },
  });

  // Delete a tenant integration
  const deleteIntegrationMutation = useMutation({
    mutationFn: ({ tenantId, integrationId }: { tenantId: string; integrationId: string }) => 
      api.deleteTenantIntegration(tenantId, integrationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-integrations', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
    },
  });

  /**
   * Hook for fetching a single cloud provider by ID
   */
  const useCloudProvider = (id?: string) => {
    return useQuery({
      queryKey: ['cloud-provider', id],
      queryFn: () => api.fetchCloudProviderById(id!),
      enabled: !!id && isSuperAdmin,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return {
    // Cloud Providers
    cloudProviders,
    isLoading,
    error,
    refetch,
    useCloudProvider,
    createCloudProvider: createCloudProviderMutation.mutate,
    updateCloudProvider: updateCloudProviderMutation.mutate,
    deleteCloudProvider: deleteCloudProviderMutation.mutate,
    isCreating: createCloudProviderMutation.isPending,
    isUpdating: updateCloudProviderMutation.isPending,
    isDeleting: deleteCloudProviderMutation.isPending,
    createError: createCloudProviderMutation.error,
    updateError: updateCloudProviderMutation.error,
    deleteError: deleteCloudProviderMutation.error,
    
    // Tenant Integrations
    checkIntegrationExists: checkIntegrationExistsMutation.mutate,
    isCheckingIntegration: checkIntegrationExistsMutation.isPending,
    checkIntegrationError: checkIntegrationExistsMutation.error,
    
    createIntegration: createIntegrationMutation.mutate,
    isCreatingIntegration: createIntegrationMutation.isPending,
    createIntegrationError: createIntegrationMutation.error,
    
    updateIntegrationTokens: updateIntegrationTokensMutation.mutate,
    isUpdatingIntegrationTokens: updateIntegrationTokensMutation.isPending,
    updateIntegrationTokensError: updateIntegrationTokensMutation.error,
    
    refreshIntegrationToken: refreshIntegrationTokenMutation.mutate,
    isRefreshingIntegrationToken: refreshIntegrationTokenMutation.isPending,
    refreshIntegrationTokenError: refreshIntegrationTokenMutation.error,
    
    deleteIntegration: deleteIntegrationMutation.mutate,
    isDeletingIntegration: deleteIntegrationMutation.isPending,
    deleteIntegrationError: deleteIntegrationMutation.error,
  };
};

export default useCloudProviders;