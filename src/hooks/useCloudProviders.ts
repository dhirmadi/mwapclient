import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CloudProvider, CreateCloudProviderDto, UpdateCloudProviderDto, PaginatedResponse } from '@/types';
import api from '@/utils/api';

/**
 * Hook for fetching all cloud providers
 */
export const useCloudProviders = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['cloud-providers', page, pageSize],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<CloudProvider>>('/cloud-providers', { page, pageSize });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch cloud providers');
      }
      return response.data;
    },
  });
};

/**
 * Hook for fetching active cloud providers
 */
export const useActiveCloudProviders = () => {
  return useQuery({
    queryKey: ['active-cloud-providers'],
    queryFn: async () => {
      const response = await api.get<CloudProvider[]>('/cloud-providers/active');
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch active cloud providers');
      }
      return response.data;
    },
  });
};

/**
 * Hook for fetching a single cloud provider by ID
 */
export const useCloudProvider = (id: string) => {
  return useQuery({
    queryKey: ['cloud-provider', id],
    queryFn: async () => {
      const response = await api.get<CloudProvider>(`/cloud-providers/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch cloud provider');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new cloud provider
 */
export const useCreateCloudProvider = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCloudProviderDto) => {
      const response = await api.post<CloudProvider>('/cloud-providers', data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create cloud provider');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
      queryClient.invalidateQueries({ queryKey: ['active-cloud-providers'] });
    },
  });
};

/**
 * Hook for updating a cloud provider
 */
export const useUpdateCloudProvider = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateCloudProviderDto) => {
      const response = await api.patch<CloudProvider>(`/cloud-providers/${id}`, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update cloud provider');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
      queryClient.invalidateQueries({ queryKey: ['cloud-provider', id] });
      queryClient.invalidateQueries({ queryKey: ['active-cloud-providers'] });
    },
  });
};

/**
 * Hook for deleting a cloud provider
 */
export const useDeleteCloudProvider = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<void>(`/cloud-providers/${id}`);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete cloud provider');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
      queryClient.invalidateQueries({ queryKey: ['active-cloud-providers'] });
    },
  });
};