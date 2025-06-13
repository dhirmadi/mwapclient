import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Project } from '../types/project';

/**
 * Hook for updating an existing project
 */
const useUpdateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => 
      api.updateProject(id, data),
    onSuccess: (data) => {
      // Invalidate projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Update the project in the cache
      queryClient.invalidateQueries({ queryKey: ['project', data._id] });
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