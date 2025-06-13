import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Project } from '../types/project';

/**
 * Hook for fetching a single project by ID
 */
const useProject = (id?: string) => {
  const query = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.fetchProjectById(id!),
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