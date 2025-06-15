import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Tenant } from '../types/tenant';

/**
 * Hook for updating an existing tenant
 */
const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tenant> }) => 
      api.updateTenant(id, data),
    onSuccess: (data) => {
      // Invalidate tenants query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      // Update the tenant in the cache
      queryClient.invalidateQueries({ queryKey: ['tenant', data._id] });
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