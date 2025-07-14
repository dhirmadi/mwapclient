import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { Project } from '../types';

/**
 * Hook for updating an existing project
 */
const useUpdateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const response = await api.patch(`/projects/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Update the project in the cache
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
  });

  return {
    updateProject: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

export default useUpdateProject;