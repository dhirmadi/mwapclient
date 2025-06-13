import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { ProjectType, ProjectTypeCreate, ProjectTypeUpdate } from '../types/project-type';
import { useAuth } from '../context/AuthContext';

export const useProjectTypes = () => {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();

  // Fetch all project types
  const { 
    data: projectTypes, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['project-types'],
    queryFn: () => api.fetchProjectTypes(),
  });

  // Fetch a single project type by ID
  const useProjectType = (id?: string) => {
    return useQuery({
      queryKey: ['project-type', id],
      queryFn: () => api.fetchProjectTypeById(id!),
      enabled: !!id,
    });
  };

  // Create a new project type (SuperAdmin only)
  const createProjectTypeMutation = useMutation({
    mutationFn: (data: ProjectTypeCreate) => api.createProjectType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
    },
  });

  // Update a project type (SuperAdmin only)
  const updateProjectTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectTypeUpdate }) => 
      api.updateProjectType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
      queryClient.invalidateQueries({ queryKey: ['project-type', variables.id] });
    },
  });

  // Delete a project type (SuperAdmin only)
  const deleteProjectTypeMutation = useMutation({
    mutationFn: (id: string) => api.deleteProjectType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
    },
  });

  return {
    projectTypes,
    isLoading,
    error,
    refetch,
    useProjectType,
    createProjectType: createProjectTypeMutation.mutate,
    updateProjectType: updateProjectTypeMutation.mutate,
    deleteProjectType: deleteProjectTypeMutation.mutate,
    isCreating: createProjectTypeMutation.isPending,
    isUpdating: updateProjectTypeMutation.isPending,
    isDeleting: deleteProjectTypeMutation.isPending,
    createError: createProjectTypeMutation.error,
    updateError: updateProjectTypeMutation.error,
    deleteError: deleteProjectTypeMutation.error,
  };
};

export default useProjectTypes;