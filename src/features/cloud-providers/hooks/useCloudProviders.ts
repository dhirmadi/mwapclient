import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { 
  CloudProviderCreate, 
  CloudProviderUpdate,
  CloudProviderIntegrationCreate
} from '../types';
import { useAuth } from '../../../core/context/AuthContext';

/**
 * Hook for managing cloud providers
 */
export const useCloudProviders = () => {
  const queryClient = useQueryClient();
  const { isReady } = useAuth();

  // Fetch all cloud providers - wait for auth to be ready
  const { 
    data: cloudProviders = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['cloud-providers'],
    queryFn: async () => {
      const response = await api.get('/cloud-providers');
      console.log('useCloudProviders - fetchCloudProviders response:', response.data);
      
      // Handle both response formats: { success: true, data: [...] } or directly the array
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log('Using wrapped response format, returning:', response.data.data);
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log('Using direct array format, returning:', response.data);
        return response.data;
      }
      
      console.log('No valid data found, returning empty array');
      return [];
    },
    enabled: isReady, // Wait for authentication to be complete
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Create a new cloud provider
  const createCloudProviderMutation = useMutation({
    mutationFn: async (data: CloudProviderCreate) => {
      const response = await api.post("/cloud-providers", data);
      console.log('createCloudProvider response:', response.data);
      
      // Handle both response formats: { success: true, data: {...} } or directly the object
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && !response.data.success) {
        return response.data;
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
    },
  });

  // Update a cloud provider
  const updateCloudProviderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CloudProviderUpdate }) => {
      const response = await api.patch(`/cloud-providers/${id}`, data);
      console.log(`updateCloudProvider ${id} response:`, response.data);
      
      // Handle both response formats: { success: true, data: {...} } or directly the object
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && !response.data.success) {
        return response.data;
      }
      
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
      queryClient.invalidateQueries({ queryKey: ['cloud-provider', variables.id] });
    },
  });

  // Delete a cloud provider
  const deleteCloudProviderMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/cloud-providers/${id}`);
      console.log(`deleteCloudProvider ${id} response:`, response.data);
      
      // Handle both response formats: { success: true, data: {...} } or directly the object
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && !response.data.success) {
        return response.data;
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
    },
  });

  // Create a tenant integration
  const createIntegrationMutation = useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string; data: CloudProviderIntegrationCreate }) => {
      const response = await api.post(`/tenants/${tenantId}/integrations`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-integrations', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
    },
  });

  // Delete a tenant integration
  const deleteIntegrationMutation = useMutation({
    mutationFn: async ({ tenantId, integrationId }: { tenantId: string; integrationId: string }) => {
      const response = await api.delete(`/tenants/${tenantId}/integrations/${integrationId}`);
      return response.data;
    },
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
      queryFn: async () => {
        const response = await api.get(`/cloud-providers/${id!}`);
        console.log(`useCloudProvider - fetchCloudProvider ${id} response:`, response.data);
        
        // Handle both response formats: { success: true, data: {...} } or directly the object
        if (response.data && response.data.success && response.data.data) {
          console.log('Using wrapped response format, returning:', response.data.data);
          return response.data.data;
        } else if (response.data && !response.data.success) {
          console.log('Using direct object format, returning:', response.data);
          return response.data;
        }
        
        console.log('No valid data found for cloud provider');
        throw new Error('Cloud provider not found');
      },
      enabled: !!id && isReady, // Wait for auth and require ID
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
    createIntegration: createIntegrationMutation.mutate,
    deleteIntegration: deleteIntegrationMutation.mutate,
    isCreatingIntegration: createIntegrationMutation.isPending,
    isDeletingIntegration: deleteIntegrationMutation.isPending,
    createIntegrationError: createIntegrationMutation.error,
    deleteIntegrationError: deleteIntegrationMutation.error,
  };
};

export default useCloudProviders;