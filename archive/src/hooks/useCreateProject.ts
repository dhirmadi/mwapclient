import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Project, ProjectCreate } from '../types/project';

/**
 * Hook for creating a new project
 */
const useCreateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ProjectCreate) => api.createProject(data),
    onSuccess: () => {
      // Invalidate projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    createProject: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

export default useCreateProject;