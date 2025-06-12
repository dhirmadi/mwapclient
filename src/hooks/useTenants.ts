import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tenant, CreateTenantDto, UpdateTenantDto, PaginatedResponse } from '@/types';
import api from '@/utils/api';

/**
 * Hook for fetching all tenants
 */
export const useTenants = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['tenants', page, pageSize],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Tenant>>('/tenants', { page, pageSize });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch tenants');
      }
      return response.data;
    },
  });
};

/**
 * Hook for fetching a single tenant by ID
 */
export const useTenant = (id: string) => {
  return useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const response = await api.get<Tenant>(`/tenants/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch tenant');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new tenant
 */
export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTenantDto) => {
      const response = await api.post<Tenant>('/tenants', data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create tenant');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};

/**
 * Hook for updating a tenant
 */
export const useUpdateTenant = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateTenantDto) => {
      const response = await api.patch<Tenant>(`/tenants/${id}`, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update tenant');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
    },
  });
};

/**
 * Hook for deleting a tenant
 */
export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<void>(`/tenants/${id}`);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete tenant');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};