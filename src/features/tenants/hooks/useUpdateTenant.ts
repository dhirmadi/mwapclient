import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { Tenant } from '../types';

/**
 * Hook for updating an existing tenant
 */
const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Tenant> }) => {
      const response = await api.patch(`/tenants/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate tenants query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      // Update the tenant in the cache
      const tenantId = data._id || data.id;
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      }
      // Update current tenant if it's the one being updated
      queryClient.invalidateQueries({ queryKey: ['tenant', 'current'] });
    },
  });

  return {
    updateTenant: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

export default useUpdateTenant;