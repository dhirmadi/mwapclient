import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { Tenant } from '../types';

/**
 * Enhanced hook for fetching a single tenant by ID with improved reliability
 */
const useTenant = (id?: string) => {
  const query = useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      if (!id) throw new Error('Tenant ID is required');
      
      try {
        const response = await api.get(`/tenants/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error in useTenant hook:', error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 2,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    data: query.data,
    isLoading: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error,
    refetch: query.refetch,
    status: query.status,
  };
};

export default useTenant;