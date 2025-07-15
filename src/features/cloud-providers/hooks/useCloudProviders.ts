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
      
      let rawData: any[] = [];
      
      // Handle both response formats: { success: true, data: [...] } or directly the array
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log('Using wrapped response format');
        rawData = response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log('Using direct array format');
        rawData = response.data;
      } else {
        console.log('No valid data found, returning empty array');
        return [];
      }
      
      // Transform _id to id for frontend compatibility
      const transformedData = rawData.map(provider => ({
        ...provider,
        id: provider._id || provider.id, // Use _id if available, fallback to id
      }));
      
      console.log('Transformed cloud providers data:', transformedData);
      return transformedData;
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
      
      let rawData: any = null;
      
      // Handle both response formats: { success: true, data: {...} } or directly the object
      if (response.data && response.data.success && response.data.data) {
        rawData = response.data.data;
      } else if (response.data && !response.data.success) {
        rawData = response.data;
      } else {
        rawData = response.data;
      }
      
      // Transform _id to id for frontend compatibility
      if (rawData && typeof rawData === 'object') {
        const transformedData = {
          ...rawData,
          id: rawData._id || rawData.id,
        };
        console.log('Transformed created cloud provider data:', transformedData);
        return transformedData;
      }
      
      return rawData;
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
      
      let rawData: any = null;
      
      // Handle both response formats: { success: true, data: {...} } or directly the object
      if (response.data && response.data.success && response.data.data) {
        rawData = response.data.data;
      } else if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to update cloud provider');
      } else if (Array.isArray(response.data) || (response.data && typeof response.data === 'object' && !response.data.success)) {
        // Direct object format (no wrapper)
        rawData = response.data;
      } else {
        rawData = response.data;
      }
      
      // Transform _id to id for frontend compatibility
      if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
        const transformedData = {
          ...rawData,
          id: rawData._id || rawData.id,
        };
        console.log('Transformed updated cloud provider data:', transformedData);
        return transformedData;
      }
      
      return rawData;
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
      } else if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to delete cloud provider');
      } else if (response.data === null || response.data === undefined || response.data === '') {
        // DELETE requests often return empty responses on success
        return { success: true };
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
        
        let rawData: any = null;
        
        // Handle both response formats: { success: true, data: {...} } or directly the object
        if (response.data && response.data.success && response.data.data) {
          console.log('Using wrapped response format');
          rawData = response.data.data;
        } else if (response.data && response.data.success === false) {
          console.log('API returned error:', response.data.message);
          throw new Error(response.data.message || 'Cloud provider not found');
        } else if (response.data && typeof response.data === 'object' && !response.data.success) {
          // Direct object format (no wrapper)
          console.log('Using direct object format');
          rawData = response.data;
        } else {
          console.log('No valid data found for cloud provider');
          throw new Error('Cloud provider not found');
        }
        
        // Transform _id to id for frontend compatibility
        const transformedData = {
          ...rawData,
          id: rawData._id || rawData.id, // Use _id if available, fallback to id
        };
        
        console.log('Transformed cloud provider data:', transformedData);
        return transformedData;
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