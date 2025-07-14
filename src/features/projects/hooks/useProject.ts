import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { Project } from '../types';

/**
 * Hook for fetching a single project by ID
 */
const useProject = (id?: string) => {
  const query = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await api.get(`/projects/${id!}`);
      return response.data;
    },
    enabled: !!id,
  });

  return {
    project: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useProject;