import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { handleApiResponse } from '../../../shared/utils/dataTransform';
import { Tenant, TenantCreate } from '../types';
import { useAuth } from '../../../core/context/AuthContext';

/**
 * Hook for creating a new tenant
 */
const useCreateTenant = () => {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();

  const mutation = useMutation({
    mutationFn: async (data: TenantCreate) => {
      const response = await api.post('/tenants', data);
      return handleApiResponse(response, false);
    },
    onSuccess: () => {
      // Invalidate tenants query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      
      // Invalidate current tenant query to update user's tenant
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
      
      // Invalidate user roles to update isTenantOwner status
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
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