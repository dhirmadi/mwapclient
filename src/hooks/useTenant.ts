import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Tenant } from '../types/tenant';

/**
 * Hook for fetching a single tenant by ID
 */
const useTenant = (id?: string) => {
  const query = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => api.fetchTenantById(id!),
    enabled: !!id,
  });

  return {
    tenant: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useTenant;