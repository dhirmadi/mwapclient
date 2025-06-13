import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Tenant, TenantCreate } from '../types/tenant';

/**
 * Hook for creating a new tenant
 */
const useCreateTenant = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: TenantCreate) => api.createTenant(data),
    onSuccess: () => {
      // Invalidate tenants query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  return {
    createTenant: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

export default useCreateTenant;