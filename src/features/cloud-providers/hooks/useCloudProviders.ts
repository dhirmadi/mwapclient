import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { handleApiResponse, handleDeleteResponse } from '../../../shared/utils/dataTransform';
import { 
  CloudProvider,
  CloudProviderCreate, 
  CloudProviderUpdate
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
  } = useQuery<CloudProvider[]>({
    queryKey: ['cloud-providers'],
    queryFn: async () => {
      const response = await api.get('/cloud-providers');
      console.log('useCloudProviders - fetchCloudProviders response:', response.data);
      
      const transformedData = handleApiResponse<CloudProvider[]>(response, true);
      console.log('Transformed cloud providers data:', transformedData);
      
      // Validate that all providers have valid IDs
      if (Array.isArray(transformedData)) {
        const invalidProviders = transformedData.filter((provider: CloudProvider) => !provider.id);
        if (invalidProviders.length > 0) {
          console.error('useCloudProviders - Found providers without valid IDs:', invalidProviders);
        }
      }
      
      return transformedData;
    },
    enabled: isReady, // Wait for authentication to be complete
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Create a new cloud provider
  const createCloudProviderMutation = useMutation<CloudProvider, Error, CloudProviderCreate>({
    mutationFn: async (data: CloudProviderCreate) => {
      const response = await api.post("/cloud-providers", data);
      console.log('createCloudProvider response:', response.data);
      
      const transformedData = handleApiResponse<CloudProvider>(response, false);
      console.log('Transformed created cloud provider data:', transformedData);
      return transformedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
    },
  });

  // Update a cloud provider
  const updateCloudProviderMutation = useMutation<CloudProvider, Error, { id: string; data: CloudProviderUpdate }>({
    mutationFn: async ({ id, data }: { id: string; data: CloudProviderUpdate }) => {
      if (!id || id === 'undefined') {
        throw new Error(`Cannot update cloud provider with invalid ID: ${id}`);
      }
      
      const response = await api.patch(`/cloud-providers/${id}`, data);
      console.log(`updateCloudProvider ${id} response:`, response.data);
      
      const transformedData = handleApiResponse<CloudProvider>(response, false);
      console.log('Transformed updated cloud provider data:', transformedData);
      return transformedData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
      queryClient.invalidateQueries({ queryKey: ['cloud-provider', variables.id] });
    },
  });

  // Delete a cloud provider
  const deleteCloudProviderMutation = useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id: string) => {
      if (!id || id === 'undefined') {
        throw new Error(`Cannot delete cloud provider with invalid ID: ${id}`);
      }
      
      const response = await api.delete(`/cloud-providers/${id}`);
      console.log(`deleteCloudProvider ${id} response:`, response.data);
      
      return handleDeleteResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
    },
  });



  /**
   * Hook for fetching a single cloud provider by ID
   */
  const useCloudProvider = (id?: string) => {
    return useQuery<CloudProvider>({
      queryKey: ['cloud-provider', id],
      queryFn: async () => {
        if (!id || id === 'undefined') {
          throw new Error(`Invalid cloud provider ID: ${id}`);
        }
        
        const response = await api.get(`/cloud-providers/${id}`);
        console.log(`useCloudProvider - fetchCloudProvider ${id} response:`, response.data);
        
        const transformedData = handleApiResponse<CloudProvider>(response, false);
        console.log('Transformed cloud provider data:', transformedData);
        
        // Validate the returned data has a valid ID
        if (!transformedData.id) {
          console.error('useCloudProvider - Fetched provider missing ID:', transformedData);
        }
        
        return transformedData;
      },
      enabled: !!id && id !== 'undefined' && isReady, // Wait for auth and require valid ID
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return {
    // Cloud Providers
    cloudProviders,
    data: cloudProviders, // For backward compatibility
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
  };
};

export default useCloudProviders;